import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  PLEDGE_COUNT_CACHE_TAG,
  cachedCountPledges,
  insertPledge,
  listMintedPledges,
} from "@/lib/db/pledges";
import { recordLocation } from "@/lib/db/locations";
import { fetchLatestCo2 } from "@/lib/api/co2";
import type { Pledge } from "@/types";
import { PLEDGE_TEXT_MAX_LENGTH, PLEDGE_TEXT_MIN_LENGTH } from "@/constants/pledge";
import { revalidateTag } from "next/cache";
import {
  isLikelySolanaSignature,
  isValidPledgeMintMetadata,
  SOLANA_MEMO_PROGRAM_ID,
  SOLANA_NETWORK,
  type PledgeMintMetadata,
} from "@/lib/solana/mint";

function optionalCoordinate(value: unknown, min: number, max: number): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < min || n > max) return null;
  return n;
}

function optionalMintMetadata(value: unknown, pledgeText: string): PledgeMintMetadata | null {
  if (!value || typeof value !== "object") return null;
  const mint = value as Partial<PledgeMintMetadata>;
  if (
    typeof mint.txHash !== "string" ||
    typeof mint.walletAddress !== "string" ||
    typeof mint.memo !== "string" ||
    typeof mint.explorerUrl !== "string" ||
    typeof mint.mintedAt !== "string"
  ) {
    return null;
  }

  const metadata: PledgeMintMetadata = {
    txHash: mint.txHash,
    network: mint.network === SOLANA_NETWORK ? mint.network : SOLANA_NETWORK,
    walletAddress: mint.walletAddress,
    memo: mint.memo,
    memoProgramId:
      mint.memoProgramId === SOLANA_MEMO_PROGRAM_ID
        ? mint.memoProgramId
        : SOLANA_MEMO_PROGRAM_ID,
    explorerUrl: mint.explorerUrl,
    mintedAt: mint.mintedAt,
  };

  if (!isLikelySolanaSignature(metadata.txHash)) return null;
  if (!isValidPledgeMintMetadata(metadata, pledgeText)) return null;
  return metadata;
}

export async function GET(req: NextRequest) {
  const count = await cachedCountPledges();
  if (req.nextUrl.searchParams.get("ledger") !== "1") {
    return NextResponse.json({ count });
  }

  const limit = Number(req.nextUrl.searchParams.get("limit") ?? 50);
  const pledges = await listMintedPledges(Number.isFinite(limit) ? limit : 50);
  return NextResponse.json({
    count,
    pledges: pledges.map((pledge) => ({
      id: pledge.id,
      pledgeText: pledge.pledgeText,
      name: pledge.name,
      country: pledge.country,
      countryCode: pledge.countryCode,
      createdAt: pledge.createdAt,
      minted: pledge.mintStatus === "minted",
      txHash: pledge.txHash,
      mintStatus: pledge.mintStatus,
      co2PpmAtMint: pledge.co2PpmAtMint,
      mintNetwork: pledge.mintNetwork,
      walletAddress: pledge.walletAddress,
      mintMemo: pledge.mintMemo,
      memoProgramId: pledge.memoProgramId,
      explorerUrl: pledge.explorerUrl,
      mintedAt: pledge.mintedAt,
    })),
  });
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
    mint?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const pledgeTextSource =
    typeof body.pledge_text === "string" ? body.pledge_text : body.text;
  const pledgeText =
    typeof pledgeTextSource === "string" ? pledgeTextSource.trim() : "";
  if (pledgeText.length < PLEDGE_TEXT_MIN_LENGTH) {
    return NextResponse.json({ error: "pledge too short" }, { status: 400 });
  }
  if (pledgeText.length > PLEDGE_TEXT_MAX_LENGTH) {
    return NextResponse.json({ error: "pledge too long" }, { status: 400 });
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

  const mint = optionalMintMetadata(body.mint, pledgeText);
  if (body.mint !== undefined && !mint) {
    return NextResponse.json({ error: "invalid mint metadata" }, { status: 400 });
  }
  const co2PpmAtMint = mint ? (await fetchLatestCo2()).ppm : null;
  let saved: Awaited<ReturnType<typeof insertPledge>>;
  try {
    saved = await insertPledge({
      pledgeText,
      name: name || null,
      country: country || null,
      countryCode: countryCode || null,
      mint,
      co2PpmAtMint,
    });
  } catch (error) {
    console.error("Failed to insert pledge", error);
    return NextResponse.json({ error: "pledge storage failed" }, { status: 500 });
  }
  revalidateTag(PLEDGE_COUNT_CACHE_TAG, { expire: 0 });

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
    minted: saved.mintStatus === "minted",
    ts: Date.now(),
    txHash: saved.txHash ?? undefined,
    mintStatus: saved.mintStatus,
    co2PpmAtMint: saved.co2PpmAtMint,
    mintNetwork: saved.mintNetwork ?? undefined,
    walletAddress: saved.walletAddress,
    mintMemo: saved.mintMemo,
    memoProgramId: saved.memoProgramId,
    explorerUrl: saved.explorerUrl,
    mintedAt: saved.mintedAt,
  };
  return NextResponse.json({ pledge });
}
