import type { CardData, CardId } from "@/types";

export const SHARE_DATA: Record<CardId, CardData> = {
  intro: {
    stat: "I",
    label: "This year, I kept a record",
    quote: "Signed, the planet.",
  },
  location: {
    stat: "⚲",
    label: "Where you are",
    quote: "I know this place. I've rained on it a billion times.",
  },
  temp: {
    stat: "+1.55°",
    label: "Degrees above baseline",
    quote: "A tenth of a degree is never small.",
  },
  co2: {
    stat: "426",
    label: "Parts per million",
    quote: "I've been keeping count since before you had numbers.",
  },
  ice: {
    stat: "1.17T",
    label: "Tonnes of ice",
    quote: "I used to hold so much more.",
  },
  forest: {
    stat: "14.9M",
    label: "Hectares lost",
    quote: "They were here before your grandparents' grandparents.",
  },
  pledge: {
    stat: "✓",
    label: "Pledge recorded",
    quote: "One small thing. For next year.",
  },
  species: {
    stat: "41,046",
    label: "Species threatened",
    quote: "I knew each one. Now I'm learning to unknow them.",
  },
  plastic: {
    stat: "413Mt",
    label: "Plastic produced",
    quote: "It outlives us all. Even me, for a while.",
  },
  renewables: {
    stat: "+32%",
    label: "More clean energy",
    quote: "You're trying. I see it. Keep going.",
  },
  final: {
    stat: "XI",
    label: "Sincerely, Earth",
    quote: "This was the year. There will be another. Make it count.",
  },
};
