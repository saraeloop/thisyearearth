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
  let body: { text?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const text =
    typeof body.text === "string" ? body.text.trim().slice(0, 200) : "";
  if (text.length < 3) {
    return NextResponse.json({ error: "pledge too short" }, { status: 400 });
  }

  const result = await mintPledge(text);
  try {
    await insertPledge(text, result.txHash);
  } catch {
    // fall through — still return the receipt
  }

  const pledge: Pledge = {
    choice: null,
    custom: text,
    minted: true,
    ts: Date.now(),
    txHash: result.txHash,
  };
  return NextResponse.json({ pledge });
}
