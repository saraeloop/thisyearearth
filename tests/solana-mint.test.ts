import assert from "node:assert/strict";
import test from "node:test";

import {
  buildPledgeMemo,
  getSolanaDevnetExplorerUrl,
  isLikelySolanaPublicKey,
  isLikelySolanaSignature,
  SOLANA_MEMO_PROGRAM_ID,
  SOLANA_NETWORK,
} from "../lib/solana/mint";
import { normalizePledgeMintMetadata } from "../lib/solana/pledgeMintMetadata";

const VALID_SIGNATURE = "2".repeat(88);
const VALID_WALLET = "3".repeat(44);
const VALID_MINTED_AT = "2026-04-19T18:51:00.000Z";
const PLEDGE_TEXT = "I will repair before replacing.";

test("buildPledgeMemo produces the canonical pledge memo", () => {
  const memo = JSON.parse(buildPledgeMemo(PLEDGE_TEXT));

  assert.deepEqual(memo, {
    app: "thisyear.earth",
    type: "earth-pledge",
    version: 1,
    pledge: PLEDGE_TEXT,
  });
});

test("validates likely Solana identifiers by base58 shape", () => {
  assert.equal(isLikelySolanaSignature(VALID_SIGNATURE), true);
  assert.equal(isLikelySolanaSignature("0".repeat(88)), false);
  assert.equal(isLikelySolanaSignature("2".repeat(20)), false);

  assert.equal(isLikelySolanaPublicKey(VALID_WALLET), true);
  assert.equal(isLikelySolanaPublicKey("0".repeat(44)), false);
  assert.equal(isLikelySolanaPublicKey("3".repeat(20)), false);
});

test("normalizes client mint metadata and derives server-owned fields", () => {
  const metadata = normalizePledgeMintMetadata(
    {
      txHash: VALID_SIGNATURE,
      walletAddress: VALID_WALLET,
      memo: "client value should not be trusted",
      memoProgramId: "client value should not be trusted",
      explorerUrl: "https://client.example/tx",
      mintedAt: VALID_MINTED_AT,
    },
    PLEDGE_TEXT,
  );

  assert.ok(metadata);
  assert.equal(metadata.txHash, VALID_SIGNATURE);
  assert.equal(metadata.walletAddress, VALID_WALLET);
  assert.equal(metadata.network, SOLANA_NETWORK);
  assert.equal(metadata.memo, buildPledgeMemo(PLEDGE_TEXT));
  assert.equal(metadata.memoProgramId, SOLANA_MEMO_PROGRAM_ID);
  assert.equal(metadata.explorerUrl, getSolanaDevnetExplorerUrl(VALID_SIGNATURE));
  assert.equal(metadata.mintedAt, VALID_MINTED_AT);
});

test("rejects invalid mint metadata before saving a pledge", () => {
  assert.equal(normalizePledgeMintMetadata(null, PLEDGE_TEXT), null);
  assert.equal(
    normalizePledgeMintMetadata(
      {
        txHash: "0".repeat(88),
        walletAddress: VALID_WALLET,
        mintedAt: VALID_MINTED_AT,
      },
      PLEDGE_TEXT,
    ),
    null,
  );
  assert.equal(
    normalizePledgeMintMetadata(
      {
        txHash: VALID_SIGNATURE,
        walletAddress: "0".repeat(44),
        mintedAt: VALID_MINTED_AT,
      },
      PLEDGE_TEXT,
    ),
    null,
  );
  assert.equal(
    normalizePledgeMintMetadata(
      {
        txHash: VALID_SIGNATURE,
        walletAddress: VALID_WALLET,
        mintedAt: "not a date",
      },
      PLEDGE_TEXT,
    ),
    null,
  );
});
