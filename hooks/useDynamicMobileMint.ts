"use client";

import { useCallback, useRef, useState } from "react";
import {
  connectWithWalletProvider,
  getWalletAccounts,
  type DynamicClient,
  type WalletAccount,
} from "@dynamic-labs-sdk/client";
import { getWalletProviders } from "@dynamic-labs-sdk/client/core";
import {
  signAndSendTransaction,
  type SolanaWalletAccount,
} from "@dynamic-labs-sdk/solana";
import { Transaction } from "@solana/web3.js";
import { Buffer } from "buffer";
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
const PHANTOM_LAUNCH_TIMEOUT_MS = 12_000;
const PHANTOM_RETURN_RESULT_TIMEOUT_MS = 20_000;

type DynamicSignAndSendInput = Parameters<typeof signAndSendTransaction>[0];
type DynamicMobileMintStatus =
  | "idle"
  | "connecting"
  | "preparing"
  | "ready-to-sign"
  | "signing"
  | "saving";

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

function getWalletProviderKeys(client: DynamicClient) {
  return getWalletProviders(client).map((provider) => provider.key);
}

function assertPhantomRedirectProvider(client: DynamicClient) {
  const providerKeys = getWalletProviderKeys(client);
  if (!providerKeys.includes(PHANTOM_SOLANA_DEEPLINK_PROVIDER_KEY)) {
    console.info("[dynamic:phantom:providers]", providerKeys);
    throw new Error(
      "Phantom mobile redirect is not registered. Enable Phantom for Solana in Dynamic.",
    );
  }
}

function serializeTransaction(transaction: Transaction) {
  return Buffer.from(
    transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    }),
  ).toString("base64");
}

function deserializeTransaction(serializedTransaction: string) {
  return Transaction.from(Buffer.from(serializedTransaction, "base64"));
}

function walletAccountFromPending(
  pending: PendingDynamicMobileMint,
): SolanaWalletAccount {
  if (!pending.walletAddress) {
    throw new Error("Phantom wallet must reconnect before signing.");
  }

  return {
    address: pending.walletAddress,
    addressesWithTypes: [{ address: pending.walletAddress }],
    chain: "SOL",
    hardwareWalletVendor: undefined,
    id: `SOL:${pending.walletAddress}`,
    lastSelectedAt: null,
    verifiedCredentialId: null,
    walletProviderKey: PHANTOM_SOLANA_DEEPLINK_PROVIDER_KEY,
  } as SolanaWalletAccount;
}

function waitForPhantomRedirect<T>(operation: Promise<T>, label: string) {
  if (typeof document === "undefined") return operation;

  let leftPage = document.visibilityState === "hidden";
  let launchTimeoutId: number | null = null;
  let returnTimeoutId: number | null = null;
  let rejectOperation: ((error: Error) => void) | null = null;

  const timeout = new Promise<never>((_, reject) => {
    rejectOperation = reject;
    const rejectIfStillHere = () => {
      if (!leftPage) {
        reject(
          new Error(
            `${label} did not open Phantom. Check that Phantom is installed and enabled for Solana in Dynamic.`,
          ),
        );
      }
    };

    launchTimeoutId = window.setTimeout(
      rejectIfStillHere,
      PHANTOM_LAUNCH_TIMEOUT_MS,
    );
  });

  const onVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      leftPage = true;
      if (launchTimeoutId) window.clearTimeout(launchTimeoutId);
      return;
    }

    if (!leftPage || !rejectOperation || returnTimeoutId) return;
    returnTimeoutId = window.setTimeout(() => {
      rejectOperation?.(
        new Error(
          `${label} returned from Phantom without a result. Try approving again.`,
        ),
      );
    }, PHANTOM_RETURN_RESULT_TIMEOUT_MS);
  };

  document.addEventListener("visibilitychange", onVisibilityChange);

  return Promise.race([operation, timeout]).finally(() => {
    document.removeEventListener("visibilitychange", onVisibilityChange);
    if (launchTimeoutId) window.clearTimeout(launchTimeoutId);
    if (returnTimeoutId) window.clearTimeout(returnTimeoutId);
  });
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
  const [status, setStatus] = useState<DynamicMobileMintStatus>(() =>
    readPendingMobileMint()?.stage === "sign" ? "ready-to-sign" : "idle",
  );
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
      setStatus("saving");
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
        setStatus("idle");
        onComplete(saved, {
          choice: pending.choice,
          custom: pending.custom,
          metadata: pending.metadata,
        });
      } catch (error) {
        clearPendingMobileMint();
        setStatus("idle");
        throw error;
      }
    },
    [onComplete, saveMinted],
  );

  const preparePendingForSignature = useCallback(
    async (walletAccount: SolanaWalletAccount, pending: PendingDynamicMobileMint) => {
      setStatus("preparing");
      const client = await ensureDynamicClientReady();
      assertPhantomRedirectProvider(client);
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
        serializedTransaction: serializeTransaction(prepared.transaction),
      };
      writePendingMobileMint(signingPending);
      setStatus("ready-to-sign");
      return signingPending;
    },
    [],
  );

  const signPreparedPending = useCallback(
    async (pending: PendingDynamicMobileMint) => {
      if (!pending.serializedTransaction) {
        throw new Error("Mint transaction expired. Start the mint again.");
      }

      setStatus("signing");
      const client = await ensureDynamicClientReady();
      assertPhantomRedirectProvider(client);
      const connectedWallet = getConnectedSolanaWalletAccount(client);
      const walletAccount =
        connectedWallet && connectedWallet.address === pending.walletAddress
          ? connectedWallet
          : walletAccountFromPending(pending);

      const { signature } = await signAndSendTransaction(
        {
          options: {
            maxRetries: 3,
            preflightCommitment: "confirmed",
          },
          transaction: deserializeTransaction(
            pending.serializedTransaction,
          ) as unknown as DynamicSignAndSendInput["transaction"],
          walletAccount,
        },
        client,
      );
      await completeMint(signature, pending);
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

      try {
        const client = await ensureDynamicClientReady();
        assertPhantomRedirectProvider(client);

        const existingPending = readPendingMobileMint();
        if (
          existingPending?.stage === "sign" &&
          existingPending.pledgeText === input.pledgeText
        ) {
          await waitForPhantomRedirect(
            signPreparedPending(existingPending),
            "Phantom signing",
          );
          return;
        }

        writePendingMobileMint(pending);
        const existingWalletAccount = getConnectedSolanaWalletAccount(client);
        let walletAccount = existingWalletAccount;

        if (!walletAccount) {
          setStatus("connecting");
          walletAccount = await waitForPhantomRedirect(
            connectWithWalletProvider(
              {
                addToDynamicWalletAccounts: true,
                walletProviderKey: PHANTOM_SOLANA_DEEPLINK_PROVIDER_KEY,
              },
              client,
            ),
            "Phantom connection",
          );
        }

        if (!isSolanaWalletAccount(walletAccount)) {
          throw new Error("Phantom did not return a Solana wallet.");
        }

        await preparePendingForSignature(walletAccount, pending);
      } catch (error) {
        clearPendingMobileMint();
        setStatus("idle");
        setError(getUserFacingMintError(error));
      } finally {
        processingRef.current = false;
        setMinting(false);
      }
    },
    [preparePendingForSignature, signPreparedPending],
  );

  return {
    startMobileMint,
    minting,
    status,
    error,
  };
}
