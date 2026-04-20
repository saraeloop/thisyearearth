"use client";

import {
  createDynamicClient,
  initializeClient,
  type DynamicClient,
} from "@dynamic-labs-sdk/client";
import {
  addPhantomRedirectSolanaExtension,
  completePhantomRedirect,
  detectPhantomRedirect,
} from "@dynamic-labs-sdk/solana";
import { SOLANA_RPC_URL } from "./mint";

const DYNAMIC_ENVIRONMENT_ID =
  process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID ??
  "a3326550-ee8a-4181-b886-79ad03979302";

let dynamicClient: DynamicClient | null = null;
let dynamicClientReady: Promise<DynamicClient> | null = null;
let dynamicClientInitialized = false;

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
    const currentUrl = new URL(window.location.href);
    dynamicClientReady = addPhantomRedirectSolanaExtension(
      {
        disableAutoRedirectCompletion: true,
        onCloseTab: () => window.close(),
        url: currentUrl,
      },
      client,
    )
      .then(() => {
        void detectPhantomRedirect({ url: currentUrl }, client)
          .then((isRedirect) => {
            if (!isRedirect) return;
            return completePhantomRedirect({ url: currentUrl }, client);
          })
          .catch((error) => {
            console.error("[dynamic:phantom-redirect:complete]", error);
          });
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

if (typeof window !== "undefined") {
  void ensureDynamicClientReady().catch((error) => {
    console.error("[dynamic:phantom-redirect:init]", error);
  });
}
