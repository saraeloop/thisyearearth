const configuredSolanaNetwork =
  process.env.NEXT_PUBLIC_SOLANA_NETWORK?.trim().toLowerCase() || "devnet";

export type SolanaNetwork = "devnet" | "testnet";

function normalizeSolanaNetwork(value: string): SolanaNetwork {
  return value === "testnet" ? "testnet" : "devnet";
}

function defaultRpcUrl(network: SolanaNetwork) {
  return `https://api.${network}.solana.com`;
}

export const SOLANA_NETWORK = normalizeSolanaNetwork(configuredSolanaNetwork);
export const SOLANA_CONFIGURED_NETWORK = configuredSolanaNetwork;
export const SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.trim() ||
  defaultRpcUrl(SOLANA_NETWORK);
export const SOLANA_DEVNET_RPC_URL = SOLANA_RPC_URL;
export const SOLANA_MEMO_PROGRAM_ID =
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr";
export const PLEDGE_MEMO_VERSION = 1;
export const SOLANA_DEBUG_MEMO_ENABLED =
  process.env.NEXT_PUBLIC_SOLANA_DEBUG_MEMO === "1";

export type PledgeMintMetadata = {
  txHash: string;
  network: SolanaNetwork;
  walletAddress: string;
  memo: string;
  memoProgramId: typeof SOLANA_MEMO_PROGRAM_ID;
  explorerUrl: string;
  mintedAt: string;
};

export function buildPledgeMemo(pledgeText: string) {
  if (SOLANA_DEBUG_MEMO_ENABLED) return "earth-wrapped-test";

  return JSON.stringify({
    app: "thisyear.earth",
    type: "earth-pledge",
    version: PLEDGE_MEMO_VERSION,
    pledge: pledgeText,
  });
}

export function getSolanaDevnetExplorerUrl(txHash: string) {
  return `https://explorer.solana.com/tx/${txHash}?cluster=${SOLANA_NETWORK}`;
}

export function isLikelySolanaSignature(value: string) {
  return /^[1-9A-HJ-NP-Za-km-z]{64,88}$/.test(value);
}

export function isLikelySolanaPublicKey(value: string) {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value);
}

export function isValidPledgeMintMetadata(
  value: PledgeMintMetadata,
  pledgeText: string,
) {
  return (
    value.network === SOLANA_NETWORK &&
    value.memoProgramId === SOLANA_MEMO_PROGRAM_ID &&
    value.explorerUrl === getSolanaDevnetExplorerUrl(value.txHash) &&
    isLikelySolanaSignature(value.txHash) &&
    isLikelySolanaPublicKey(value.walletAddress) &&
    Number.isFinite(Date.parse(value.mintedAt)) &&
    value.memo === buildPledgeMemo(pledgeText)
  );
}
