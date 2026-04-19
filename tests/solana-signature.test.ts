import assert from "node:assert/strict";
import test from "node:test";

import { encodeBase58, normalizeWalletSignature } from "../lib/solana/signature";

test("encodes Solana signatures as base58", () => {
  assert.equal(encodeBase58(new Uint8Array([])), "");
  assert.equal(encodeBase58(new Uint8Array([0])), "1");
  assert.equal(encodeBase58(new Uint8Array([1])), "2");
  assert.equal(encodeBase58(new Uint8Array([0, 1])), "12");
});

test("normalizes wallet signatures across provider return shapes", () => {
  assert.equal(normalizeWalletSignature("2".repeat(88)), "2".repeat(88));
  assert.equal(normalizeWalletSignature(new Uint8Array([1])), "2");
  assert.equal(normalizeWalletSignature([1]), "2");
});
