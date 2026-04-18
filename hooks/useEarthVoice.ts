"use client";

import { VOICE_QUOTES } from "@/constants/quotes";
import type { CardId, VoiceTone } from "@/types";

export function useEarthVoice(cardId: CardId, tone: VoiceTone): string {
  return VOICE_QUOTES[cardId]?.[tone] ?? "";
}
