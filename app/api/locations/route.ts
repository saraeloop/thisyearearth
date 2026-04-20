import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { recentLocations, recordLocation } from "@/lib/db/locations";
import {
  checkRateLimit,
  LOCATION_WRITE_RATE_LIMIT,
  rateLimitResponse,
} from "@/lib/rateLimit";

function optionalCoordinate(value: unknown, min: number, max: number): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < min || n > max) return null;
  return n;
}

export async function GET() {
  const locations = await recentLocations(50);
  return NextResponse.json({ locations });
}

export async function POST(req: NextRequest) {
  const rateLimit = checkRateLimit(req, LOCATION_WRITE_RATE_LIMIT);
  if (!rateLimit.ok) return rateLimitResponse(rateLimit);

  let body: {
    country?: unknown;
    country_code?: unknown;
    countryCode?: unknown;
    lat?: unknown;
    lng?: unknown;
    lon?: unknown;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const country = typeof body.country === "string" ? body.country.trim() : "";
  const countryCodeSource =
    typeof body.country_code === "string" ? body.country_code : body.countryCode;
  const countryCode =
    typeof countryCodeSource === "string"
      ? countryCodeSource.trim().toUpperCase()
      : "";

  if (!country) {
    return NextResponse.json({ error: "country required" }, { status: 400 });
  }

  if (countryCode.length !== 2) {
    return NextResponse.json({ error: "country_code must be 2 characters" }, { status: 400 });
  }

  const lat = optionalCoordinate(body.lat, -90, 90);
  const lng = optionalCoordinate(body.lng ?? body.lon, -180, 180);
  await recordLocation({
    country,
    countryCode,
    lat,
    lng,
  });
  return NextResponse.json({ ok: true });
}
