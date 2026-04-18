import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { countPledges, insertPledge } from "@/lib/db/pledges";
import { recordLocation } from "@/lib/db/locations";
import { mintPledge } from "@/lib/solana/mint";
import type { Pledge } from "@/types";

function optionalCoordinate(value: unknown, min: number, max: number): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < min || n > max) return null;
  return n;
}

export async function GET() {
  const count = await countPledges();
  return NextResponse.json({ count });
}

export async function POST(req: NextRequest) {
  let body: {
    pledge_text?: unknown;
    text?: unknown;
    name?: unknown;
    country?: unknown;
    country_code?: unknown;
    countryCode?: unknown;
    location?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const pledgeTextSource =
    typeof body.pledge_text === "string" ? body.pledge_text : body.text;
  const pledgeText =
    typeof pledgeTextSource === "string" ? pledgeTextSource.trim().slice(0, 200) : "";
  if (pledgeText.length < 3) {
    return NextResponse.json({ error: "pledge too short" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 80) : null;
  const country =
    typeof body.country === "string" ? body.country.trim().slice(0, 80) : null;
  const countryCodeSource =
    typeof body.country_code === "string" ? body.country_code : body.countryCode;
  const normalizedCountryCode =
    typeof countryCodeSource === "string"
      ? countryCodeSource.trim().toUpperCase()
      : "";
  const countryCode = normalizedCountryCode.length === 2 ? normalizedCountryCode : null;
  const location =
    body.location && typeof body.location === "object"
      ? (body.location as {
          country?: unknown;
          countryCode?: unknown;
          country_code?: unknown;
          lat?: unknown;
          lon?: unknown;
          lng?: unknown;
        })
      : null;

  const result = await mintPledge(pledgeText);
  let saved: Awaited<ReturnType<typeof insertPledge>>;
  try {
    saved = await insertPledge({
      pledgeText,
      name: name || null,
      country: country || null,
      countryCode: countryCode || null,
    });
  } catch (error) {
    console.error("Failed to insert pledge", error);
    return NextResponse.json({ error: "pledge storage failed" }, { status: 500 });
  }

  if (location) {
    const locationCountry =
      typeof location.country === "string" ? location.country.trim().slice(0, 80) : "";
    const locationCodeSource =
      typeof location.countryCode === "string" ? location.countryCode : location.country_code;
    const locationCountryCode =
      typeof locationCodeSource === "string"
        ? locationCodeSource.trim().toUpperCase()
        : "";
    const lat = optionalCoordinate(location.lat, -90, 90);
    const lng = optionalCoordinate(location.lng ?? location.lon, -180, 180);
    if (locationCountry && locationCountryCode.length === 2 && lat !== null && lng !== null) {
      try {
        await recordLocation({
          country: locationCountry,
          countryCode: locationCountryCode,
          lat,
          lng,
        });
      } catch (error) {
        console.error("Failed to record pledge location", error);
      }
    }
  }

  const pledge: Pledge = {
    choice: null,
    custom: pledgeText,
    name: saved.name,
    country: saved.country,
    countryCode: saved.countryCode,
    minted: true,
    ts: Date.now(),
    txHash: result.txHash,
  };
  return NextResponse.json({ pledge });
}
