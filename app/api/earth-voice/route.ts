import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { CARD_IDS } from "@/constants/cards";
import type { CardId, VoiceTone } from "@/types";
import { generateEarthVoice } from "@/lib/api/gemini";

const TONES: VoiceTone[] = ["hopeful", "default", "darker"];

function isCardId(value: string): value is CardId {
  return (CARD_IDS as readonly string[]).includes(value);
}

function isTone(value: string): value is VoiceTone {
  return (TONES as string[]).includes(value);
}

export async function GET(req: NextRequest) {
  const cardId = req.nextUrl.searchParams.get("cardId");
  const tone = req.nextUrl.searchParams.get("tone");

  if (!cardId || !isCardId(cardId)) {
    return NextResponse.json({ error: "bad cardId" }, { status: 400 });
  }
  if (!tone || !isTone(tone)) {
    return NextResponse.json({ error: "bad tone" }, { status: 400 });
  }

  const quote = await generateEarthVoice(cardId, tone);
  return NextResponse.json({ quote });
}
