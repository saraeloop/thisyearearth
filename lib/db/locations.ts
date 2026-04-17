import { getSql } from "./client";
import type { Location } from "@/types";

let memoryStore: Location[] = [];

export async function recordLocation(loc: Location): Promise<void> {
  const sql = getSql();
  if (!sql) {
    memoryStore = [loc, ...memoryStore].slice(0, 1000);
    return;
  }
  await sql`
    INSERT INTO locations (city, region, lat, lon, tz, created_at)
    VALUES (${loc.city}, ${loc.region}, ${loc.lat}, ${loc.lon}, ${loc.tz}, NOW())
  `;
}

export async function recentLocations(limit = 20): Promise<Location[]> {
  const sql = getSql();
  if (!sql) return memoryStore.slice(0, limit);
  const rows = (await sql`
    SELECT city, region, lat, lon, tz
    FROM locations
    ORDER BY created_at DESC
    LIMIT ${limit}
  `) as Location[];
  return rows;
}
