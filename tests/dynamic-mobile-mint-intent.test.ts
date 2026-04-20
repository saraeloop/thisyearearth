import assert from "node:assert/strict";
import test from "node:test";

import {
  PENDING_MINT_MAX_AGE_MS,
  PENDING_MOBILE_MINT_KEY,
  clearPendingMobileMint,
  markPendingMobileMintSaving,
  readPendingMobileMint,
  writePendingMobileMint,
  type PendingDynamicMobileMint,
} from "../lib/solana/dynamicMobileMintIntent";
import { SOLANA_NETWORK } from "../lib/solana/mint";

class MemoryStorage implements Pick<Storage, "getItem" | "setItem" | "removeItem"> {
  private values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

const NOW = 1_800_000_000_000;

function makePending(
  overrides: Partial<PendingDynamicMobileMint> = {},
): PendingDynamicMobileMint {
  return {
    version: 1,
    network: SOLANA_NETWORK,
    stage: "connect",
    pledgeText: "Vote climate",
    metadata: {
      name: "Ada",
      country: "Chile",
    },
    choice: "vote",
    custom: null,
    createdAt: NOW,
    ...overrides,
  };
}

test("pending mobile mint intent round-trips through storage", () => {
  const storage = new MemoryStorage();
  const pending = makePending();

  writePendingMobileMint(pending, storage);

  const stored = readPendingMobileMint({ storage, now: NOW });

  assert.equal(stored?.stage, pending.stage);
  assert.equal(stored?.pledgeText, pending.pledgeText);
  assert.deepEqual(stored?.metadata, pending.metadata);
  assert.equal(stored?.choice, pending.choice);
  assert.equal(stored?.custom, pending.custom);
  assert.equal(stored?.createdAt, pending.createdAt);
});

test("pending mobile mint intent from another Solana network is cleared", () => {
  const storage = new MemoryStorage();
  storage.setItem(
    PENDING_MOBILE_MINT_KEY,
    JSON.stringify({
      ...makePending(),
      network: SOLANA_NETWORK === "testnet" ? "devnet" : "testnet",
    }),
  );

  assert.equal(readPendingMobileMint({ storage, now: NOW }), null);
  assert.equal(storage.getItem(PENDING_MOBILE_MINT_KEY), null);
});

test("expired pending mobile mint intent is cleared and ignored", () => {
  const storage = new MemoryStorage();
  writePendingMobileMint(makePending(), storage);

  const expired = readPendingMobileMint({
    storage,
    now: NOW + PENDING_MINT_MAX_AGE_MS + 1,
  });

  assert.equal(expired, null);
  assert.equal(storage.getItem(PENDING_MOBILE_MINT_KEY), null);
});

test("invalid pending mobile mint intent is cleared and ignored", () => {
  const storage = new MemoryStorage();
  storage.setItem(PENDING_MOBILE_MINT_KEY, "{not valid json");

  assert.equal(readPendingMobileMint({ storage, now: NOW }), null);
  assert.equal(storage.getItem(PENDING_MOBILE_MINT_KEY), null);

  storage.setItem(
    PENDING_MOBILE_MINT_KEY,
    JSON.stringify({ version: 1, stage: "saving", pledgeText: "", createdAt: NOW }),
  );

  assert.equal(readPendingMobileMint({ storage, now: NOW }), null);
  assert.equal(storage.getItem(PENDING_MOBILE_MINT_KEY), null);
});

test("markPendingMobileMintSaving persists tx hash to guard duplicate redirects", () => {
  const storage = new MemoryStorage();
  const pending = makePending({
    stage: "sign",
    walletAddress: "3".repeat(44),
    memo: '{"app":"thisyear.earth"}',
    confirmation: {
      blockhash: "2".repeat(32),
      lastValidBlockHeight: 123,
    },
  });
  const txHash = "4".repeat(88);

  const saving = markPendingMobileMintSaving(pending, txHash, storage);
  const stored = readPendingMobileMint({ storage, now: NOW });

  assert.equal(saving.stage, "saving");
  assert.equal(saving.txHash, txHash);
  assert.equal(stored?.stage, "saving");
  assert.equal(stored?.txHash, txHash);
});

test("clearPendingMobileMint removes the pending intent", () => {
  const storage = new MemoryStorage();
  writePendingMobileMint(makePending(), storage);

  clearPendingMobileMint(storage);

  assert.equal(readPendingMobileMint({ storage, now: NOW }), null);
});
