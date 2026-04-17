import { PALETTE } from "@/constants/colors";
import type { Accent } from "@/types";
import { LargeGrain, GrainTexture } from "./Grain";

type CardBackgroundProps = {
  accent: Accent;
  grainLevel?: number;
};

export function CardBackground({ accent, grainLevel = 1 }: CardBackgroundProps) {
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background: `
            radial-gradient(ellipse 120% 60% at 50% 115%, ${accent.glow} 0%, rgba(0,0,0,0.02) 35%, transparent 58%),
            radial-gradient(ellipse 140% 90% at 50% 100%, #1a1d2e 0%, transparent 60%),
            linear-gradient(180deg, ${PALETTE.BG_TOP} 0%, ${PALETTE.BG_MID} 45%, ${PALETTE.BG_BOTTOM} 100%)
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
