import type { CardId } from "@/types";
import { ACCENTS, PALETTE } from "./colors";

const FOREST_STOPS = {
  top: "#0F2A1C",
  mid: "#0A1F14",
  bottom: "#05120A",
  overlayTint: "#122E1F",
} as const;

const DEFAULT_OVERLAY_TINT = "#1A1D2E";

export type StoryBgVars = {
  "--ew-story-bg-top": string;
  "--ew-story-bg-mid": string;
  "--ew-story-bg-bottom": string;
  "--ew-story-accent-glow": string;
  "--ew-story-overlay-tint": string;
};

export function getStoryBgVars(cardId: CardId): StoryBgVars {
  const isForest = cardId === "renewables";
  return {
    "--ew-story-bg-top": isForest ? FOREST_STOPS.top : PALETTE.BG_TOP,
    "--ew-story-bg-mid": isForest ? FOREST_STOPS.mid : PALETTE.BG_MID,
    "--ew-story-bg-bottom": isForest ? FOREST_STOPS.bottom : PALETTE.BG_BOTTOM,
    "--ew-story-accent-glow": ACCENTS[cardId].glow,
    "--ew-story-overlay-tint": isForest
      ? FOREST_STOPS.overlayTint
      : DEFAULT_OVERLAY_TINT,
  };
}

export function getPhoneStoryBgVars(cardId: CardId): StoryBgVars {
  const vars = getStoryBgVars(cardId);
  if (cardId !== "renewables") return vars;

  return {
    ...vars,
    "--ew-story-bg-top": PALETTE.BG_TOP,
    "--ew-story-bg-mid": PALETTE.BG_MID,
    "--ew-story-bg-bottom": PALETTE.BG_BOTTOM,
    "--ew-story-overlay-tint": DEFAULT_OVERLAY_TINT,
  };
}
