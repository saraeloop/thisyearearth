import type { Accent, CardId } from "@/types";
import type { CSSProperties } from "react";

export const PALETTE = {
  BG_TOP: "#0A0E1A",
  BG_MID: "#0D1322",
  BG_BOTTOM: "#070A12",
  ASH: "#E6D6BE",
  ASH_DIM: "rgba(230, 214, 190, 0.55)",
  ASH_DIMMER: "rgba(230, 214, 190, 0.32)",
  ASH_FAINT: "rgba(230, 214, 190, 0.18)",
} as const;

export const LEDGER_PALETTE = {
  BG_0: "#070C18",
  BG_1: "#0A1628",
  BG_2: "#0D1A2E",
  ASH: "#E6D6BE",
  ASH_70: "rgba(230, 214, 190, 0.70)",
  ASH_55: "rgba(230, 214, 190, 0.55)",
  ASH_40: "rgba(230, 214, 190, 0.40)",
  ASH_28: "rgba(230, 214, 190, 0.28)",
  ASH_18: "rgba(230, 214, 190, 0.18)",
  ASH_10: "rgba(230, 214, 190, 0.10)",
  ASH_06: "rgba(230, 214, 190, 0.06)",
  MOSS: "#8BA577",
  AMBER: "#C66A2E",
  GLACIER: "#9AC4D4",
} as const;

export const LEDGER_CSS_VARS: CSSProperties & Record<`--${string}`, string> = {
  "--ledger-bg-0": LEDGER_PALETTE.BG_0,
  "--ledger-bg-1": LEDGER_PALETTE.BG_1,
  "--ledger-bg-2": LEDGER_PALETTE.BG_2,
  "--ledger-ash": LEDGER_PALETTE.ASH,
  "--ledger-ash-70": LEDGER_PALETTE.ASH_70,
  "--ledger-ash-55": LEDGER_PALETTE.ASH_55,
  "--ledger-ash-40": LEDGER_PALETTE.ASH_40,
  "--ledger-ash-28": LEDGER_PALETTE.ASH_28,
  "--ledger-ash-18": LEDGER_PALETTE.ASH_18,
  "--ledger-ash-10": LEDGER_PALETTE.ASH_10,
  "--ledger-ash-06": LEDGER_PALETTE.ASH_06,
  "--ledger-moss": LEDGER_PALETTE.MOSS,
  "--ledger-amber": LEDGER_PALETTE.AMBER,
  "--ledger-glacier": LEDGER_PALETTE.GLACIER,
};

export const FONTS = {
  SERIF: '"DM Serif Display", "Playfair Display", Georgia, serif',
  MONO: '"JetBrains Mono", ui-monospace, monospace',
} as const;

export const ACCENTS: Record<CardId, Accent> = {
  intro: { hex: "#E6D6BE", glow: "rgba(230,214,190,0.28)", name: "ASH" },
  location: { hex: "#7EC4A8", glow: "rgba(126,196,168,0.32)", name: "AURORA" },
  temp: { hex: "#D4573E", glow: "rgba(212,87,62,0.38)", name: "CRIMSON" },
  co2: { hex: "#C66A2E", glow: "rgba(198,106,46,0.38)", name: "AMBER" },
  ice: { hex: "#9AC4D4", glow: "rgba(154,196,212,0.32)", name: "GLACIER" },
  forest: { hex: "#8BA577", glow: "rgba(139,165,119,0.32)", name: "MOSS" },
  pledge: { hex: "#D4B87A", glow: "rgba(212,184,122,0.30)", name: "GOLD" },
  species: { hex: "#A896B4", glow: "rgba(168,150,180,0.28)", name: "VIOLET" },
  plastic: { hex: "#C4C472", glow: "rgba(196,196,114,0.30)", name: "SULFUR" },
  renewables: { hex: "#E8A838", glow: "rgba(232,168,56,0.38)", name: "SUN" },
  final: { hex: "#E6D6BE", glow: "rgba(230,214,190,0.30)", name: "ASH" },
};
