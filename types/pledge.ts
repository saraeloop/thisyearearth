export type Pledge = {
  choice: string | null;
  custom: string | null;
  name?: string | null;
  country?: string | null;
  countryCode?: string | null;
  minted: boolean;
  ts: number;
  txHash?: string;
};
