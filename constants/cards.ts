import type { CardId } from "@/types";

export const CARD_IDS = [
  "intro",
  "location",
  "temp",
  "co2",
  "ice",
  "forest",
  "pledge",
  "species",
  "plastic",
  "renewables",
  "final",
] as const;

export const TOTAL_CARDS = CARD_IDS.length;

export const INTERACTIVE_CARD_IDS = new Set<CardId>([
  "location",
  "pledge",
  "final",
]);

export const CARD_CHAPTERS: Record<CardId, string> = {
  intro: "Preface · The Record",
  location: "Chapter II · Coordinates",
  temp: "Chapter III · The Fever",
  co2: "Chapter IV · The Atmosphere",
  ice: "Chapter V · The Melt",
  forest: "Chapter VI · The Canopy",
  pledge: "Chapter VII · The Ledger",
  species: "Chapter VIII · The Roll Call",
  plastic: "Chapter IX · The Residue",
  renewables: "Chapter X · The Turn",
  final: "Epilogue · Sincerely",
};

export const ACTIVE_STORAGE_KEY = "ew-active";
