"use client";

import { PALETTE, ACCENTS } from "@/constants/colors";
import type { CardCommonProps } from "@/types";
import { CardShell } from "./CardShell";
import { StatBlock, StatLadder, StatSourceMeta } from "./StatBlock";
import { EarthQuote, StatLabel, HorizonLine } from "@/components/ui/CardTypography";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { useEarthVoice } from "@/hooks/useEarthVoice";

const accent = ACCENTS.species;

export function SpeciesCard({ active, onNext, onShare, grainLevel, voiceTone }: CardCommonProps) {
  const quote = useEarthVoice("species", voiceTone);

  return (
    <CardShell
      cardId="species"
      active={active}
      grainLevel={grainLevel}
      onNext={onNext}
      onShare={onShare}
    >
      <StatBlock
        accent={accent}
        underline="species threatened"
        fontSize={170}
        desktopFontSize="clamp(300px, 30vw, 430px)"
        translateY={-20}
      >
        <AnimatedNumber value={41046} format="grouped" />
      </StatBlock>

      <svg
        style={{
          position: "absolute",
          bottom: 200,
          left: 20,
          right: 20,
          height: 44,
          zIndex: 8,
          pointerEvents: "none",
        }}
        viewBox="0 0 350 44"
        preserveAspectRatio="none"
      >
        {Array.from({ length: 180 }).map((_, i) => {
          const x = (i % 36) * 9.8 + 3;
          const y = Math.floor(i / 36) * 8.5 + 3;
          const gone = i % 11 === 0;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={gone ? 1 : 0.8}
              fill={gone ? PALETTE.ASH : accent.hex}
              opacity={gone ? 0.15 : 0.4}
            />
          );
        })}
      </svg>

      <StatLadder
        accent={accent}
        rows={[
          { left: "— AMPHIBIANS", right: "· 41%" },
          { left: "— CORALS", right: "· 36%" },
          { left: "— MAMMALS", right: "· 26%" },
          { left: "— BIRDS", right: "· 12%" },
          { left: "— FUNGI", right: "· 47%", active: true },
        ]}
      />
      <StatSourceMeta
        rows={["SRC: IUCN RED LIST", "SRC: WWF LPR"]}
        dim={["v2026-1", "157,100 ASSESSED"]}
      />

      <StatLabel>Species on my list</StatLabel>
      <HorizonLine accent={accent} />
      <EarthQuote>&ldquo;{quote}&rdquo;</EarthQuote>
    </CardShell>
  );
}
