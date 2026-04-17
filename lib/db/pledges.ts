import { getSql } from "./client";

export type PledgeRow = {
  id: string;
  text: string;
  txHash: string;
  createdAt: string;
};

let memoryStore: PledgeRow[] = [];

export async function insertPledge(
  text: string,
  txHash: string,
): Promise<PledgeRow> {
  const row: PledgeRow = {
    id: crypto.randomUUID(),
    text,
    txHash,
    createdAt: new Date().toISOString(),
  };

  const sql = getSql();
  if (!sql) {
    memoryStore = [row, ...memoryStore].slice(0, 1000);
    return row;
  }

  await sql`
    INSERT INTO pledges (id, text, tx_hash, created_at)
    VALUES (${row.id}, ${row.text}, ${row.txHash}, ${row.createdAt})
  `;
  return row;
}

export async function countPledges(): Promise<number> {
  const sql = getSql();
  if (!sql) return memoryStore.length + 1_247_392;
  const rows = (await sql`SELECT COUNT(*)::int AS n FROM pledges`) as {
    n: number;
  }[];
  return (rows[0]?.n ?? 0) + 1_247_392;
}
