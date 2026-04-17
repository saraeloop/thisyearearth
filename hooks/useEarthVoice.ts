"use client";

import { useEffect, useState } from "react";
import { ENDPOINTS } from "@/constants/endpoints";
import { VOICE_QUOTES } from "@/constants/quotes";
import type { CardId, VoiceTone } from "@/types";

export function useEarthVoice(cardId: CardId, tone: VoiceTone): string {
  const fallback = VOICE_QUOTES[cardId]?.[tone] ?? "";
  const key = `${cardId}:${tone}`;
  const [generated, setGenerated] = useState<{ key: string; quote: string } | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    (async () => {
      try {
        const url = `${ENDPOINTS.EARTH_VOICE}?cardId=${cardId}&tone=${tone}`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) return;
        const data = (await res.json()) as { quote?: string };
        if (!cancelled && data.quote) setGenerated({ key, quote: data.quote });
      } catch {
        // keep fallback
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [cardId, tone, key]);

  return generated?.key === key ? generated.quote : fallback;
}
