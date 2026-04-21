"use client";

import {
  createDynamicClient,
  initializeClient,
  onceEvent,
  type DynamicClient,
} from "@dynamic-labs-sdk/client";
import {
  addPhantomRedirectSolanaExtension,
  completePhantomRedirect,
  detectPhantomRedirect,
} from "@dynamic-labs-sdk/solana";
import { SOLANA_NETWORK, SOLANA_RPC_URL } from "./mint";

const DYNAMIC_ENVIRONMENT_ID =
  process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID ??
  "a3326550-ee8a-4181-b886-79ad03979302";

let dynamicClient: DynamicClient | null = null;
let dynamicClientReady: Promise<DynamicClient> | null = null;
let dynamicClientInitialized = false;

declare global {
  interface DynamicEvents {
    phantomRedirectCloseTab: (args: Record<string, never>) => void;
  }
}

function getCurrentUrl() {
  return new URL(window.location.href);
}

function createClient() {
  return createDynamicClient({
    autoInitialize: false,
    coreConfig: {
      openDeeplink: async (url) => {
        const deeplink = new URL(url);
        console.info("[dynamic:phantom:open]", {
          host: deeplink.host,
          path: deeplink.pathname,
        });
        window.location.assign(url);
      },
    },
    environmentId: DYNAMIC_ENVIRONMENT_ID,
    metadata: {
      name: "thisyear.earth",
      universalLink: window.location.origin,
    },
    transformers: {
      networkData: (networkData) => {
        if (networkData.chain !== "SOL") return networkData;
        return {
          ...networkData,
          cluster: SOLANA_NETWORK,
          rpcUrls: {
            ...networkData.rpcUrls,
            http: [SOLANA_RPC_URL],
          },
        };
      },
    },
  });
}

export function getDynamicClient() {
  if (typeof window === "undefined") {
    throw new Error("Dynamic Phantom redirect is only available in the browser.");
  }

  if (!dynamicClient) {
    dynamicClient = createClient();
  }

  return dynamicClient;
}

export function ensureDynamicClientReady() {
  if (!dynamicClientReady) {
    const client = getDynamicClient();
    const currentUrl = getCurrentUrl();
    dynamicClientReady = addPhantomRedirectSolanaExtension(
      {
        disableAutoRedirectCompletion: true,
        onCloseTab: () => window.close(),
        url: currentUrl,
      },
      client,
    )
      .then(() => {
        if (!dynamicClientInitialized) {
          dynamicClientInitialized = true;
          void initializeClient(client).catch((error) => {
            dynamicClientInitialized = false;
            console.error("[dynamic:init]", error);
          });
        }
        return client;
      })
      .catch((error) => {
        dynamicClientReady = null;
        throw error;
      });
  }

  return dynamicClientReady;
}

export async function completePendingPhantomRedirect(client: DynamicClient) {
  const currentUrl = getCurrentUrl();
  const isRedirect = await detectPhantomRedirect({ url: currentUrl }, client);
  if (!isRedirect) return false;
  onceEvent(
    {
      event: "phantomRedirectCloseTab",
      listener: () => window.close(),
    },
    client,
  );
  await completePhantomRedirect({ url: currentUrl }, client);
  return true;
}
