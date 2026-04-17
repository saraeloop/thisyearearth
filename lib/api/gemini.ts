import { EXTERNAL } from "@/constants/endpoints";
import type { CardId, VoiceTone } from "@/types";
import { VOICE_QUOTES } from "@/constants/quotes";

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
};

function staticFallback(cardId: CardId, tone: VoiceTone): string {
  const set = VOICE_QUOTES[cardId];
  if (!set) return "";
  return set[tone];
}

export async function generateEarthVoice(
  cardId: CardId,
  tone: VoiceTone,
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return staticFallback(cardId, tone);

  const prompt =
    `You are Earth, writing one sentence to a human reading a "wrapped" card about "${cardId}". ` +
    `Tone: ${tone}. Keep it under 18 words. No quotation marks. First person.`;

  try {
    const url = `${EXTERNAL.GEMINI_BASE}/${EXTERNAL.GEMINI_MODEL}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.85, maxOutputTokens: 80 },
      }),
      next: { revalidate: 60 * 60 },
    });
    if (!res.ok) return staticFallback(cardId, tone);
    const data = (await res.json()) as GeminiResponse;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return text || staticFallback(cardId, tone);
  } catch {
    return staticFallback(cardId, tone);
  }
}
