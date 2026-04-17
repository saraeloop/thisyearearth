export type Pledge = {
  choice: string | null;
  custom: string | null;
  minted: boolean;
  ts: number;
  txHash?: string;
};
