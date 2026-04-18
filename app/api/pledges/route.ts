import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { countPledges, insertPledge } from "@/lib/db/pledges";
import { mintPledge } from "@/lib/solana/mint";
import type { Pledge } from "@/types";

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

  const result = await mintPledge(pledgeText);
  try {
    await insertPledge({
      pledgeText,
      name: name || null,
      country: country || null,
      countryCode: countryCode || null,
    });
  } catch (error) {
    console.error("Failed to insert pledge", error);
    return NextResponse.json({ error: "pledge storage failed" }, { status: 500 });
  }

  const pledge: Pledge = {
    choice: null,
    custom: pledgeText,
    minted: true,
    ts: Date.now(),
    txHash: result.txHash,
  };
  return NextResponse.json({ pledge });
}
