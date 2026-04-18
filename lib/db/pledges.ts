import { getSql } from "./client";
import { cacheLife, cacheTag } from "next/cache";
import { PLEDGE_TEXT_MAX_LENGTH, PLEDGE_TEXT_MIN_LENGTH } from "@/constants/pledge";

export const PLEDGE_COUNT_CACHE_TAG = "pledge-count";

export type PledgeRow = {
  id: string;
  pledgeText: string;
  name: string | null;
  country: string | null;
  countryCode: string | null;
  createdAt: Date | string;
};

let memoryStore: PledgeRow[] = [];

type InsertPledgeInput = {
  pledgeText: string;
  name?: string | null;
  country?: string | null;
  countryCode?: string | null;
};

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
  };

  const sql = getSql();
  if (!sql) {
    memoryStore = [row, ...memoryStore].slice(0, 1000);
    return row;
  }

  const rows = (await sql`
    INSERT INTO pledges (pledge_text, name, country, country_code)
    VALUES (${row.pledgeText}, ${row.name}, ${row.country}, ${row.countryCode})
    RETURNING id, pledge_text, name, country, country_code, created_at
  `) as {
    id: string;
    pledge_text: string;
    name: string | null;
    country: string | null;
    country_code: string | null;
    created_at: Date | string;
  }[];

  const saved = rows[0];
  if (!saved) return row;
  return {
    id: saved.id,
    pledgeText: saved.pledge_text,
    name: saved.name,
    country: saved.country,
    countryCode: saved.country_code,
    createdAt: saved.created_at,
  };
}

export async function countPledges(): Promise<number> {
  const sql = getSql();
  if (!sql) return memoryStore.length;
  const rows = (await sql`SELECT COUNT(*)::int AS n FROM pledges`) as {
    n: number;
  }[];
  return rows[0]?.n ?? 0;
}

export async function cachedCountPledges(): Promise<number> {
  "use cache";
  cacheTag(PLEDGE_COUNT_CACHE_TAG);
  cacheLife({ stale: 30, revalidate: 30, expire: 60 });
  return countPledges();
}
