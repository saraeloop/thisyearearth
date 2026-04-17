"use client";

import { ACCENTS } from "@/constants/colors";
import type { CardCommonProps } from "@/types";
import { CardShell } from "./CardShell";
import { StatBlock, StatLadder, StatSourceMeta } from "./StatBlock";
import { EarthQuote, StatLabel, HorizonLine } from "@/components/ui/CardTypography";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { useEarthVoice } from "@/hooks/useEarthVoice";

const accent = ACCENTS.plastic;

export function PlasticCard({ active, onNext, onShare, grainLevel, voiceTone }: CardCommonProps) {
  const quote = useEarthVoice("plastic", voiceTone);

  return (
    <CardShell
      cardId="plastic"
      active={active}
      grainLevel={grainLevel}
      onNext={onNext}
      onShare={onShare}
    >
      <StatBlock
        accent={accent}
        underline="plastic produced"
        fontSize={210}
        desktopFontSize="clamp(440px, 42vw, 600px)"
      >
        <AnimatedNumber value={413} />
        <span style={{ color: accent.hex, fontSize: "0.44em" }}>Mt</span>
      </StatBlock>

      <StatLadder
        accent={accent}
        rows={[
          { left: "— RECYCLED", right: "· 9%" },
          { left: "— INCINERATED", right: "· 19%" },
          { left: "— LANDFILLED", right: "· 50%" },
          { left: "— IN NATURE", right: "· 22%", active: true },
          { left: "— IN YOUR BLOOD", right: "· yes" },
        ]}
      />
      <StatSourceMeta
        rows={["SRC: OECD", "SRC: UNEP"]}
        dim={["PRODUCTION", "ANNUAL · TONNES"]}
      />

      <StatLabel>Plastic you made this year</StatLabel>
      <HorizonLine accent={accent} />
      <EarthQuote>&ldquo;{quote}&rdquo;</EarthQuote>
    </CardShell>
  );
}
