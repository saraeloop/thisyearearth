const HEX = "0123456789ABCDEF";

function randomHex(len: number): string {
  let out = "";
  for (let i = 0; i < len; i++) out += HEX[Math.floor(Math.random() * 16)];
  return out;
}

export type MintResult = {
  txHash: string;
  network: "devnet" | "mainnet" | "stub";
};

export async function mintPledge(text: string): Promise<MintResult> {
  void text;
  return {
    txHash: `${randomHex(8)}…${randomHex(6)}`,
    network: "stub",
  };
}
