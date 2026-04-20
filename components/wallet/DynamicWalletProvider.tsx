"use client";

import { type ReactNode } from "react";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { SolanaWalletConnectorsWithConfig } from "@dynamic-labs/solana";
import { SOLANA_RPC_URL } from "@/lib/solana/mint";

const DYNAMIC_ENVIRONMENT_ID =
  process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID ??
  "a3326550-ee8a-4181-b886-79ad03979302";

type DynamicWalletProviderProps = {
  children: ReactNode;
};

export function DynamicWalletProvider({ children }: DynamicWalletProviderProps) {
  const redirectUrl =
    typeof window === "undefined"
      ? undefined
      : `${window.location.origin}${window.location.pathname}${window.location.search}#pledge`;

  return (
    <DynamicContextProvider
      settings={{
        environmentId: DYNAMIC_ENVIRONMENT_ID,
        initialAuthenticationMode: "connect-only",
        mobileExperience: "redirect",
        redirectUrl,
        walletConnectors: [
          SolanaWalletConnectorsWithConfig({
            commitment: "confirmed",
            customRpcUrls: {
              solana: [SOLANA_RPC_URL],
            },
          }),
        ],
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}
