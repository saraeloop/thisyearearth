"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  useDynamicContext,
  usePhantomRedirectEvents,
  useWalletOptions,
} from "@dynamic-labs/sdk-react-core";
import { isSolanaWallet } from "@dynamic-labs/solana";
import type { Wallet } from "@dynamic-labs/wallet-connector-core";
import { ACTIVE_STORAGE_KEY, CARD_IDS } from "@/constants/cards";
import type { Pledge } from "@/types";
import type { PledgeMetadata } from "@/hooks/usePledge";
import type { PledgeMintMetadata } from "@/lib/solana/mint";
import {
  buildPledgeMintMetadataFromSignature,
  confirmPledgeMintSignature,
  preparePledgeMintTransaction,
} from "@/lib/solana/wallet";
import { normalizeWalletSignature } from "@/lib/solana/signature";
import {
  clearPendingMobileMint,
  markPendingMobileMintSaving,
  readPendingMobileMint,
  writePendingMobileMint,
  type PendingDynamicMobileMint,
} from "@/lib/solana/dynamicMobileMintIntent";

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

type DynamicSolanaSigner = {
  signAndSendTransaction: (
    transaction: unknown,
  ) => Promise<{ signature: string | Uint8Array | number[] }>;
};

function keepMobileStoryOnPledgeCard() {
  if (typeof window === "undefined") return;
  const pledgeIndex = CARD_IDS.findIndex((id) => id === "pledge");
  if (pledgeIndex >= 0) {
    window.localStorage.setItem(ACTIVE_STORAGE_KEY, String(pledgeIndex));
  }
}

function getPhantomWalletKey(
  walletOptions: ReturnType<typeof useWalletOptions>["walletOptions"],
) {
  return (
    walletOptions.find(
      (option) =>
        option.key.toLowerCase().includes("phantom") &&
        option.supportedChains.includes("SOL"),
    )?.key ?? "phantom"
  );
}

export function useDynamicMobileMint({
  saveMinted,
  onComplete,
}: UseDynamicMobileMintOptions) {
  const { primaryWallet, sdkHasLoaded, setShowAuthFlow } = useDynamicContext();
  const { selectWalletOption, walletOptions } = useWalletOptions();
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
    async (wallet: Wallet, pending: PendingDynamicMobileMint) => {
      if (processingRef.current) return;
      processingRef.current = true;

      try {
        if (!isSolanaWallet(wallet)) {
          throw new Error("Connect Phantom on Solana to mint.");
        }

        const walletAddress = wallet.address;
        if (!walletAddress) throw new Error("Wallet connection failed.");

        const prepared = await preparePledgeMintTransaction(
          pending.pledgeText,
          walletAddress,
        );
        const signingPending: PendingDynamicMobileMint = {
          ...pending,
          stage: "sign",
          walletAddress: prepared.walletAddress,
          memo: prepared.memo,
          confirmation: prepared.confirmation,
        };
        writePendingMobileMint(signingPending);

        const signer = (await wallet.getSigner()) as DynamicSolanaSigner;
        const result = await signer.signAndSendTransaction(prepared.transaction);
        const txHash = normalizeWalletSignature(result.signature);
        await completeMint(txHash, signingPending);
      } finally {
        processingRef.current = false;
      }
    },
    [completeMint],
  );

  const startMobileMint = useCallback(
    async (input: StartDynamicMobileMintInput) => {
      if (!sdkHasLoaded) {
        setError("Wallet connection is still loading. Try again.");
        return;
      }

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
        if (primaryWallet) {
          await signPendingWithWallet(primaryWallet, pending);
          return;
        }

        const phantomKey = getPhantomWalletKey(walletOptions);
        const selectedWallet = await selectWalletOption(
          phantomKey,
          false,
          true,
          "SOL",
        );
        if (selectedWallet) {
          await signPendingWithWallet(selectedWallet, pending);
          return;
        }

        setShowAuthFlow(true);
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Open Phantom to approve the mint.";
        setError(message);
        setShowAuthFlow(true);
      } finally {
        setMinting(false);
      }
    },
    [
      primaryWallet,
      sdkHasLoaded,
      selectWalletOption,
      setShowAuthFlow,
      signPendingWithWallet,
      walletOptions,
    ],
  );

  useEffect(() => {
    if (!primaryWallet || processingRef.current) return;
    const pending = readPendingMobileMint();
    if (!pending || pending.stage !== "connect") return;

    void Promise.resolve()
      .then(async () => {
        setMinting(true);
        setError(null);
        await signPendingWithWallet(primaryWallet, pending);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Mint failed.");
      })
      .finally(() => {
        setMinting(false);
      });
  }, [primaryWallet, signPendingWithWallet]);

  usePhantomRedirectEvents({
    onSignAndSendTransaction: ({ signature, errorCode, errorMessage }) => {
      const pending = readPendingMobileMint();
      if (!pending || pending.stage === "saving") return;

      if (errorCode || errorMessage || !signature) {
        clearPendingMobileMint();
        setError(errorMessage || errorCode || "Mint cancelled.");
        setMinting(false);
        return;
      }

      processingRef.current = true;
      setMinting(true);
      setError(null);
      void completeMint(normalizeWalletSignature(signature), pending)
        .catch((e) => {
          setError(e instanceof Error ? e.message : "Mint failed.");
        })
        .finally(() => {
          processingRef.current = false;
          setMinting(false);
        });
    },
  });

  return {
    startMobileMint,
    minting,
    error,
  };
}
