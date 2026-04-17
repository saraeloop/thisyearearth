import { PALETTE } from "@/constants/colors";
import type { Accent, CardId } from "@/types";
import { LargeGrain, GrainTexture } from "./Grain";

type CardBackgroundProps = {
  accent: Accent;
  cardId?: CardId;
  grainLevel?: number;
};

const FOREST_STOPS = {
  top: "#0F2A1C",
  mid: "#0A1F14",
  bottom: "#05120A",
  mid2: "#122e1f",
};

export function CardBackground({
  accent,
  cardId,
  grainLevel = 1,
}: CardBackgroundProps) {
  const isForest = cardId === "renewables";
  const top = isForest ? FOREST_STOPS.top : PALETTE.BG_TOP;
  const mid = isForest ? FOREST_STOPS.mid : PALETTE.BG_MID;
  const bottom = isForest ? FOREST_STOPS.bottom : PALETTE.BG_BOTTOM;
  const overlayTint = isForest ? FOREST_STOPS.mid2 : "#1a1d2e";

  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background: `
            radial-gradient(ellipse 120% 60% at 50% 115%, ${accent.glow} 0%, rgba(0,0,0,0.02) 35%, transparent 58%),
            radial-gradient(ellipse 140% 90% at 50% 100%, ${overlayTint} 0%, transparent 60%),
            linear-gradient(180deg, ${top} 0%, ${mid} 45%, ${bottom} 100%)
          `,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -260,
          left: "-20%",
          right: "-20%",
          height: 380,
          borderRadius: "50%",
          zIndex: 1,
          background: `radial-gradient(ellipse at center top, ${accent.glow} 0%, rgba(0,0,0,0.02) 32%, transparent 60%)`,
          filter: "blur(2px)",
        }}
      />
      <LargeGrain opacity={0.55 * grainLevel} />
      <GrainTexture opacity={0.32 * grainLevel} />
    </>
  );
}
