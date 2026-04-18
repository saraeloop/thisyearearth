import type { CardId, VoiceTone } from "@/types";

type QuoteSet = Record<VoiceTone, string>;

export const VOICE_QUOTES: Partial<Record<CardId, QuoteSet>> = {
  temp: {
    hopeful: "A tenth of a degree. Small to you. Not to me.",
    default: "A tenth of a degree is never small.",
    darker: "I am 0.55°C warmer than I was when your grandparents were born.",
  },
  co2: {
    hopeful: "I've been keeping count. You can help me count down.",
    default: "I've been keeping count since before you had numbers.",
    darker: "428 ppm. The last time I was this warm, sea levels were 20 meters higher.",
  },
  ice: {
    hopeful: "I lost 1.17 trillion tonnes this year. Less than last year. Keep going.",
    default: "I used to hold so much more.",
    darker: "1.17 trillion tonnes. Gone into the ocean. Into the coasts. Into your cities.",
  },
  forest: {
    hopeful: "They grew back after the last extinction. They can again.",
    default: "They were here before your grandparents' grandparents.",
    darker: "14.9 million hectares. Every second of this year, I lost an area the size of a football pitch.",
  },
  species: {
    hopeful: "I knew each one. Some I may know again, if you give them room.",
    default: "I knew each one. Now I'm learning to unknow them.",
    darker: "41,046 species threatened. I am losing them 1,000 times faster than before you arrived.",
  },
  plastic: {
    hopeful: "413 million tonnes made this year. You recycled 9% of it. That number can grow.",
    default: "It outlives you. By centuries.",
    darker: "413 million tonnes. 9% recycled. The rest is in me. In the fish. In you.",
  },
  renewables: {
    hopeful: "You're trying. I see it. Keep going.",
    default: "You're trying. I see it. Keep going.",
    darker: "32% more clean energy. Still 80% of your power from fossil fuels. I see both numbers.",
  },
  final: {
    hopeful: "Another year recorded. See you next year. Make it count.",
    default: "Another year recorded. See you next year. \nMake it count.",
    darker: "Another year recorded. \nThe window is narrowing. I am still here. For now.",
  },
};
