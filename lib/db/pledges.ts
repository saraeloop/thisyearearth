import { getSql } from "./client";
import { cacheLife, cacheTag } from "next/cache";
import { PLEDGE_TEXT_MAX_LENGTH, PLEDGE_TEXT_MIN_LENGTH } from "@/constants/pledge";
import type { PledgeMintMetadata, SolanaNetwork } from "@/lib/solana/mint";

export const TOTAL_PLEDGE_COUNT_CACHE_TAG = "pledge-count-total";
export const MINTED_PLEDGE_COUNT_CACHE_TAG = "pledge-count-minted";

export type MintStatus = "none" | "minted";

export type PledgeRow = {
  id: string;
  pledgeText: string;
  name: string | null;
  country: string | null;
  countryCode: string | null;
  createdAt: Date | string;
  txHash: string | null;
  mintStatus: MintStatus;
  walletAddress: string | null;
  co2PpmAtMint: number | null;
  mintNetwork: SolanaNetwork | null;
  mintMemo: string | null;
  memoProgramId: string | null;
  explorerUrl: string | null;
  mintedAt: Date | string | null;
};

let memoryStore: PledgeRow[] = [];

type InsertPledgeInput = {
  pledgeText: string;
  name?: string | null;
  country?: string | null;
  countryCode?: string | null;
  mint?: PledgeMintMetadata | null;
  co2PpmAtMint?: number | null;
};

type PledgeDbRow = {
  id: string;
  pledge_text: string;
  name: string | null;
  country: string | null;
  country_code: string | null;
  created_at: Date | string;
  tx_hash: string | null;
  mint_status: MintStatus;
  minted_at: Date | string | null;
  co2_ppm_at_mint: number | null;
  mint_network: SolanaNetwork | null;
  wallet_address: string | null;
  mint_memo: string | null;
  memo_program_id: string | null;
  explorer_url: string | null;
};

function mapPledgeRow(row: PledgeDbRow): PledgeRow {
  return {
    id: row.id,
    pledgeText: row.pledge_text,
    name: row.name,
    country: row.country,
    countryCode: row.country_code,
    createdAt: row.created_at,
    txHash: row.tx_hash,
    mintStatus: row.mint_status,
    mintedAt: row.minted_at,
    co2PpmAtMint: row.co2_ppm_at_mint,
    mintNetwork: row.mint_network,
    walletAddress: row.wallet_address,
    mintMemo: row.mint_memo,
    memoProgramId: row.memo_program_id,
    explorerUrl: row.explorer_url,
  };
}

export async function insertPledge(input: InsertPledgeInput): Promise<PledgeRow> {
  if (input.pledgeText.length < PLEDGE_TEXT_MIN_LENGTH) {
    throw new Error("pledgeText is shorter than the supported minimum length");
  }
  if (input.pledgeText.length > PLEDGE_TEXT_MAX_LENGTH) {
    throw new Error("pledgeText exceeds the supported maximum length");
  }

  const row: PledgeRow = {
    id: crypto.randomUUID(),
    pledgeText: input.pledgeText,
    name: input.name ?? null,
    country: input.country ?? null,
    countryCode: input.countryCode ?? null,
    createdAt: new Date().toISOString(),
    txHash: input.mint?.txHash ?? null,
    mintStatus: input.mint ? "minted" : "none",
    mintedAt: input.mint?.mintedAt ?? null,
    co2PpmAtMint: input.co2PpmAtMint ?? null,
    mintNetwork: input.mint?.network ?? null,
    walletAddress: input.mint?.walletAddress ?? null,
    mintMemo: input.mint?.memo ?? null,
    memoProgramId: input.mint?.memoProgramId ?? null,
    explorerUrl: input.mint?.explorerUrl ?? null,
  };

  const sql = getSql();
  if (!sql) {
    memoryStore = [row, ...memoryStore].slice(0, 1000);
    return row;
  }

  const rows = (await sql`
    INSERT INTO pledges (
      pledge_text,
      name,
      country,
      country_code,
      tx_hash,
      mint_status,
      minted_at,
      co2_ppm_at_mint,
      mint_network,
      wallet_address,
      mint_memo,
      memo_program_id,
      explorer_url
    )
    VALUES (
      ${row.pledgeText},
      ${row.name},
      ${row.country},
      ${row.countryCode},
      ${row.txHash},
      ${row.mintStatus},
      ${row.mintedAt},
      ${row.co2PpmAtMint},
      ${row.mintNetwork},
      ${row.walletAddress},
      ${row.mintMemo},
      ${row.memoProgramId},
      ${row.explorerUrl}
    )
    RETURNING
      id,
      pledge_text,
      name,
      country,
      country_code,
      created_at,
      tx_hash,
      mint_status,
      minted_at,
      co2_ppm_at_mint,
      mint_network,
      wallet_address,
      mint_memo,
      memo_program_id,
      explorer_url
  `) as PledgeDbRow[];

  const saved = rows[0];
  if (!saved) return row;
  return mapPledgeRow(saved);
}

export async function countTotalPledges(): Promise<number> {
  const sql = getSql();
  if (!sql) return memoryStore.length;
  const rows = (await sql`SELECT COUNT(*)::int AS n FROM pledges`) as {
    n: number;
  }[];
  return rows[0]?.n ?? 0;
}

export async function countMintedPledges(): Promise<number> {
  const sql = getSql();
  if (!sql) {
    return memoryStore.filter(
      (pledge) => pledge.mintStatus === "minted" && pledge.txHash,
    ).length;
  }

  const rows = (await sql`
    SELECT COUNT(*)::int AS n
    FROM pledges
    WHERE mint_status = 'minted' AND tx_hash IS NOT NULL
  `) as { n: number }[];
  return rows[0]?.n ?? 0;
}

export async function listMintedPledges(limit = 50): Promise<PledgeRow[]> {
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);
  const sql = getSql();
  if (!sql) {
    return memoryStore
      .filter((pledge) => pledge.mintStatus === "minted" && pledge.txHash)
      .slice(0, safeLimit);
  }

  const rows = (await sql`
    SELECT
      id,
      pledge_text,
      name,
      country,
      country_code,
      created_at,
      tx_hash,
      mint_status,
      minted_at,
      co2_ppm_at_mint,
      mint_network,
      wallet_address,
      mint_memo,
      memo_program_id,
      explorer_url
    FROM pledges
    WHERE mint_status = 'minted' AND tx_hash IS NOT NULL
    ORDER BY minted_at DESC, created_at DESC
    LIMIT ${safeLimit}
  `) as PledgeDbRow[];

  return rows.map(mapPledgeRow);
}

export async function listPledges(limit = 50): Promise<PledgeRow[]> {
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);
  const sql = getSql();
  if (!sql) return memoryStore.slice(0, safeLimit);

  const rows = (await sql`
    SELECT
      id,
      pledge_text,
      name,
      country,
      country_code,
      created_at,
      tx_hash,
      mint_status,
      minted_at,
      co2_ppm_at_mint,
      mint_network,
      wallet_address,
      mint_memo,
      memo_program_id,
      explorer_url
    FROM pledges
    ORDER BY created_at DESC
    LIMIT ${safeLimit}
  `) as PledgeDbRow[];

  return rows.map(mapPledgeRow);
}

export async function cachedCountTotalPledges(): Promise<number> {
  "use cache";
  cacheTag(TOTAL_PLEDGE_COUNT_CACHE_TAG);
  cacheLife({ stale: 30, revalidate: 30, expire: 60 });
  return countTotalPledges();
}

export async function cachedCountMintedPledges(): Promise<number> {
  "use cache";
  cacheTag(MINTED_PLEDGE_COUNT_CACHE_TAG);
  cacheLife({ stale: 30, revalidate: 30, expire: 60 });
  return countMintedPledges();
}
