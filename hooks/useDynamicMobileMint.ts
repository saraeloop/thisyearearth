"use client";

import { useCallback, useRef, useState } from "react";
import {
  connectWithWalletProvider,
  getWalletAccounts,
  type DynamicClient,
  type WalletAccount,
} from "@dynamic-labs-sdk/client";
import {
  signAndSendTransaction,
  type SolanaWalletAccount,
} from "@dynamic-labs-sdk/solana";
import { ACTIVE_STORAGE_KEY, CARD_IDS } from "@/constants/cards";
import type { Pledge } from "@/types";
import type { PledgeMetadata } from "@/hooks/usePledge";
import type { PledgeMintMetadata } from "@/lib/solana/mint";
import { ensureDynamicClientReady } from "@/lib/solana/dynamicClient";
import {
  buildPledgeMintMetadataFromSignature,
  confirmPledgeMintSignature,
  preparePledgeMintTransaction,
} from "@/lib/solana/wallet";
import {
  clearPendingMobileMint,
  markPendingMobileMintSaving,
  readPendingMobileMint,
  writePendingMobileMint,
  type PendingDynamicMobileMint,
} from "@/lib/solana/dynamicMobileMintIntent";

const PHANTOM_SOLANA_DEEPLINK_PROVIDER_KEY = "phantomsol:deepLink";

type DynamicSignAndSendInput = Parameters<typeof signAndSendTransaction>[0];

type StartDynamicMobileMintInput = {
  pledgeText: string;
  metadata: PledgeMetadata;
  choice: string | null;
  custom: string | null;
};

type UseDynamicMobileMintOptions = {
  saveMinted: (
    text: string,
    metadata: PledgeMetadata,
    mintMetadata: PledgeMintMetadata,
  ) => Promise<Pledge | null>;
  onComplete: (
    pledge: Pledge,
    draft: Pick<PendingDynamicMobileMint, "choice" | "custom" | "metadata">,
  ) => void;
};

function keepMobileStoryOnPledgeCard() {
  if (typeof window === "undefined") return;
  const pledgeIndex = CARD_IDS.findIndex((id) => id === "pledge");
  if (pledgeIndex >= 0) {
    window.localStorage.setItem(ACTIVE_STORAGE_KEY, String(pledgeIndex));
  }
}

function isSolanaWalletAccount(
  walletAccount: WalletAccount | null | undefined,
): walletAccount is SolanaWalletAccount {
  return walletAccount?.chain === "SOL" && !!walletAccount.address;
}

function getConnectedSolanaWalletAccount(client: DynamicClient) {
  return getWalletAccounts(client).find(isSolanaWalletAccount) ?? null;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "";
}

function getUserFacingMintError(error: unknown) {
  const message = getErrorMessage(error);
  const normalized = message.toLowerCase();
  if (
    normalized.includes("reject") ||
    normalized.includes("cancel") ||
    normalized.includes("user denied")
  ) {
    return "Mint cancelled.";
  }
  if (
    normalized.includes("no wallet provider") ||
    normalized.includes("no wallet found") ||
    normalized.includes("wallet provider")
  ) {
    return "Phantom mobile redirect is unavailable. Make sure Phantom is installed and try again.";
  }
  return message || "Open Phantom to approve the mint.";
}

export function useDynamicMobileMint({
  saveMinted,
  onComplete,
}: UseDynamicMobileMintOptions) {
  const [minting, setMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const processingRef = useRef(false);
  const processedTxHashesRef = useRef<Set<string>>(new Set());

  const completeMint = useCallback(
    async (txHash: string, pending: PendingDynamicMobileMint) => {
      if (processedTxHashesRef.current.has(txHash)) return;

      if (!pending.walletAddress || !pending.memo || !pending.confirmation) {
        throw new Error("Mint result returned without the pending pledge details.");
      }

      const currentPending = readPendingMobileMint();
      if (currentPending?.stage === "saving" && currentPending.txHash === txHash) {
        return;
      }
      markPendingMobileMintSaving(pending, txHash);

      try {
        await confirmPledgeMintSignature(txHash, pending.confirmation);
        const mintMetadata = buildPledgeMintMetadataFromSignature(
          txHash,
          pending.walletAddress,
          pending.memo,
        );
        processedTxHashesRef.current.add(txHash);
        const saved = await saveMinted(
          pending.pledgeText,
          pending.metadata,
          mintMetadata,
        );
        if (!saved) throw new Error("Pledge save failed after mint.");
        clearPendingMobileMint();
        onComplete(saved, {
          choice: pending.choice,
          custom: pending.custom,
          metadata: pending.metadata,
        });
      } catch (error) {
        clearPendingMobileMint();
        throw error;
      }
    },
    [onComplete, saveMinted],
  );

  const signPendingWithWallet = useCallback(
    async (
      walletAccount: SolanaWalletAccount,
      pending: PendingDynamicMobileMint,
    ) => {
      const client = await ensureDynamicClientReady();
      const prepared = await preparePledgeMintTransaction(
        pending.pledgeText,
        walletAccount.address,
      );
      const signingPending: PendingDynamicMobileMint = {
        ...pending,
        stage: "sign",
        walletAddress: prepared.walletAddress,
        memo: prepared.memo,
        confirmation: prepared.confirmation,
      };
      writePendingMobileMint(signingPending);

      const { signature } = await signAndSendTransaction(
        {
          options: {
            maxRetries: 3,
            preflightCommitment: "confirmed",
          },
          transaction:
            prepared.transaction as unknown as DynamicSignAndSendInput["transaction"],
          walletAccount,
        },
        client,
      );
      await completeMint(signature, signingPending);
    },
    [completeMint],
  );

  const startMobileMint = useCallback(
    async (input: StartDynamicMobileMintInput) => {
      if (processingRef.current) return;
      processingRef.current = true;

      setMinting(true);
      setError(null);
      keepMobileStoryOnPledgeCard();

      const pending: PendingDynamicMobileMint = {
        version: 1,
        stage: "connect",
        pledgeText: input.pledgeText,
        metadata: input.metadata,
        choice: input.choice,
        custom: input.custom,
        createdAt: Date.now(),
      };
      writePendingMobileMint(pending);

      try {
        const client = await ensureDynamicClientReady();
        const existingWalletAccount = getConnectedSolanaWalletAccount(client);
        const walletAccount =
          existingWalletAccount ??
          (await connectWithWalletProvider(
            {
              addToDynamicWalletAccounts: true,
              walletProviderKey: PHANTOM_SOLANA_DEEPLINK_PROVIDER_KEY,
            },
            client,
          ));

        if (!isSolanaWalletAccount(walletAccount)) {
          throw new Error("Phantom did not return a Solana wallet.");
        }

        await signPendingWithWallet(walletAccount, pending);
      } catch (error) {
        clearPendingMobileMint();
        setError(getUserFacingMintError(error));
      } finally {
        processingRef.current = false;
        setMinting(false);
      }
    },
    [signPendingWithWallet],
  );

  return {
    startMobileMint,
    minting,
    error,
  };
}
