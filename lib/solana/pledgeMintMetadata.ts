import {
  buildPledgeMemo,
  getSolanaDevnetExplorerUrl,
  isLikelySolanaPublicKey,
  isLikelySolanaSignature,
  SOLANA_MEMO_PROGRAM_ID,
  SOLANA_NETWORK,
  type PledgeMintMetadata,
} from "./mint";

export function normalizePledgeMintMetadata(
  value: unknown,
  pledgeText: string,
): PledgeMintMetadata | null {
  if (!value || typeof value !== "object") return null;
  const mint = value as Partial<PledgeMintMetadata>;
  if (
    typeof mint.txHash !== "string" ||
    typeof mint.walletAddress !== "string" ||
    typeof mint.mintedAt !== "string"
  ) {
    return null;
  }

  const metadata: PledgeMintMetadata = {
    txHash: mint.txHash,
    network: mint.network === SOLANA_NETWORK ? mint.network : SOLANA_NETWORK,
    walletAddress: mint.walletAddress,
    memo: buildPledgeMemo(pledgeText),
    memoProgramId:
      mint.memoProgramId === SOLANA_MEMO_PROGRAM_ID
        ? mint.memoProgramId
        : SOLANA_MEMO_PROGRAM_ID,
    explorerUrl: getSolanaDevnetExplorerUrl(mint.txHash),
    mintedAt: mint.mintedAt,
  };

  if (!isLikelySolanaSignature(metadata.txHash)) return null;
  if (!isLikelySolanaPublicKey(metadata.walletAddress)) return null;
  if (!Number.isFinite(Date.parse(metadata.mintedAt))) return null;
  return metadata;
}
