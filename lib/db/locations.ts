import { getSql } from "./client";

export type LocationRow = {
  id: string;
  country: string;
  countryCode: string;
  lat: number | null;
  lng: number | null;
  createdAt: Date | string;
};

type RecordLocationInput = {
  country: string;
  countryCode: string;
  lat?: number | null;
  lng?: number | null;
};

let memoryStore: LocationRow[] = [];

export async function recordLocation(loc: RecordLocationInput): Promise<void> {
  const sql = getSql();
  if (!sql) {
    memoryStore = [
      {
        id: crypto.randomUUID(),
        country: loc.country,
        countryCode: loc.countryCode,
        lat: loc.lat ?? null,
        lng: loc.lng ?? null,
        createdAt: new Date().toISOString(),
      },
      ...memoryStore,
    ].slice(0, 1000);
    return;
  }
  await sql`
    INSERT INTO locations (country, country_code, lat, lng)
    VALUES (${loc.country}, ${loc.countryCode}, ${loc.lat ?? null}, ${loc.lng ?? null})
  `;
}

export async function recentLocations(limit = 20): Promise<LocationRow[]> {
  const sql = getSql();
  if (!sql) return memoryStore.slice(0, limit);
  const rows = (await sql`
    SELECT id, country, country_code, lat, lng, created_at
    FROM locations
    ORDER BY created_at DESC
    LIMIT ${limit}
  `) as {
    id: string;
    country: string;
    country_code: string;
    lat: string | number | null;
    lng: string | number | null;
    created_at: Date | string;
  }[];

  return rows.map((row) => ({
    id: row.id,
    country: row.country,
    countryCode: row.country_code,
    lat: row.lat === null ? null : Number(row.lat),
    lng: row.lng === null ? null : Number(row.lng),
    createdAt: row.created_at,
  }));
}
