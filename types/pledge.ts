export type Pledge = {
  choice: string | null;
  custom: string | null;
  name?: string | null;
  country?: string | null;
  countryCode?: string | null;
  minted: boolean;
  ts: number;
  txHash?: string;
  mintStatus?: "none" | "minted";
  co2PpmAtMint?: number | null;
  mintNetwork?: "devnet" | "testnet";
  walletAddress?: string | null;
  mintMemo?: string | null;
  memoProgramId?: string | null;
  explorerUrl?: string | null;
  mintedAt?: Date | string | null;
};
