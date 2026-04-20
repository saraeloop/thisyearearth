import type { PledgeMintConfirmation } from "./wallet";

export const PENDING_MOBILE_MINT_KEY =
  "thisyearearth:pending-dynamic-mobile-mint";
export const PENDING_MINT_MAX_AGE_MS = 15 * 60 * 1000;

type PendingPledgeMetadata = {
  name?: string | null;
  country?: string | null;
  countryCode?: string | null;
  location?: {
    country: string;
    countryCode: string;
    lat: number;
    lon: number;
  } | null;
};

export type PendingDynamicMobileMint = {
  version: 1;
  stage: "connect" | "sign" | "saving";
  pledgeText: string;
  metadata: PendingPledgeMetadata;
  choice: string | null;
  custom: string | null;
  walletAddress?: string;
  memo?: string;
  confirmation?: PledgeMintConfirmation;
  serializedTransaction?: string;
  txHash?: string;
  createdAt: number;
};

type MobileMintStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

type StorageOptions = {
  storage?: MobileMintStorage | null;
  now?: number;
};

function getBrowserStorage() {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

function resolveStorage(storage?: MobileMintStorage | null) {
  return storage === undefined ? getBrowserStorage() : storage;
}

export function clearPendingMobileMint(storage?: MobileMintStorage | null) {
  resolveStorage(storage)?.removeItem(PENDING_MOBILE_MINT_KEY);
}

export function writePendingMobileMint(
  pending: PendingDynamicMobileMint,
  storage?: MobileMintStorage | null,
) {
  resolveStorage(storage)?.setItem(PENDING_MOBILE_MINT_KEY, JSON.stringify(pending));
}

export function readPendingMobileMint(
  options: StorageOptions = {},
): PendingDynamicMobileMint | null {
  const storage = resolveStorage(options.storage);
  if (!storage) return null;

  const raw = storage.getItem(PENDING_MOBILE_MINT_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<PendingDynamicMobileMint>;
    const stage = parsed.stage;
    if (
      parsed.version !== 1 ||
      (stage !== "connect" && stage !== "sign" && stage !== "saving") ||
      typeof parsed.pledgeText !== "string" ||
      !parsed.pledgeText.trim() ||
      typeof parsed.createdAt !== "number"
    ) {
      clearPendingMobileMint(storage);
      return null;
    }

    const now = options.now ?? Date.now();
    if (now - parsed.createdAt > PENDING_MINT_MAX_AGE_MS) {
      clearPendingMobileMint(storage);
      return null;
    }

    return {
      version: 1,
      stage,
      pledgeText: parsed.pledgeText,
      metadata: parsed.metadata ?? {},
      choice: typeof parsed.choice === "string" ? parsed.choice : null,
      custom: typeof parsed.custom === "string" ? parsed.custom : null,
      walletAddress:
        typeof parsed.walletAddress === "string" ? parsed.walletAddress : undefined,
      memo: typeof parsed.memo === "string" ? parsed.memo : undefined,
      confirmation: parsed.confirmation,
      serializedTransaction:
        typeof parsed.serializedTransaction === "string"
          ? parsed.serializedTransaction
          : undefined,
      txHash: typeof parsed.txHash === "string" ? parsed.txHash : undefined,
      createdAt: parsed.createdAt,
    };
  } catch {
    clearPendingMobileMint(storage);
    return null;
  }
}

export function markPendingMobileMintSaving(
  pending: PendingDynamicMobileMint,
  txHash: string,
  storage?: MobileMintStorage | null,
) {
  const savingPending: PendingDynamicMobileMint = {
    ...pending,
    stage: "saving",
    txHash,
  };
  writePendingMobileMint(savingPending, storage);
  return savingPending;
}
