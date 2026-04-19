import type { Accent, CardId } from "@/types";
import { LargeGrain, GrainTexture } from "./Grain";

type CardBackgroundProps = {
  accent?: Accent;
  cardId?: CardId;
  grainLevel?: number;
};

export function CardBackground({ grainLevel = 1 }: CardBackgroundProps) {
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          backgroundColor: "var(--ew-story-bg-bottom)",
          backgroundImage: "var(--ew-story-atmosphere-image)",
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
          background:
            "radial-gradient(ellipse at center top, var(--ew-story-accent-glow) 0%, rgba(0,0,0,0.02) 32%, transparent 60%)",
          filter: "blur(2px)",
          pointerEvents: "none",
        }}
      />
      <LargeGrain opacity={0.55 * grainLevel} />
      <GrainTexture opacity={0.32 * grainLevel} />
    </>
  );
}
