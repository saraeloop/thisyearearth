import assert from "node:assert/strict";
import test from "node:test";

import {
  SOLANA_MEMO_PROGRAM_ID,
  SOLANA_NETWORK,
  getSolanaDevnetExplorerUrl,
} from "../lib/solana/mint";
import { buildPledgeMintMetadataFromSignature } from "../lib/solana/wallet";

test("buildPledgeMintMetadataFromSignature derives server-checkable mint metadata", () => {
  const txHash = "2".repeat(88);
  const walletAddress = "3".repeat(44);
  const memo = '{"app":"thisyear.earth","type":"earth-pledge"}';

  const metadata = buildPledgeMintMetadataFromSignature(
    txHash,
    walletAddress,
    memo,
  );

  assert.equal(metadata.txHash, txHash);
  assert.equal(metadata.walletAddress, walletAddress);
  assert.equal(metadata.memo, memo);
  assert.equal(metadata.network, SOLANA_NETWORK);
  assert.equal(metadata.memoProgramId, SOLANA_MEMO_PROGRAM_ID);
  assert.equal(metadata.explorerUrl, getSolanaDevnetExplorerUrl(txHash));
  assert.equal(Number.isFinite(Date.parse(metadata.mintedAt)), true);
});
