"use client";

import { ACCENTS } from "@/constants/colors";
import type { CardCommonProps } from "@/types";
import { CardShell } from "./CardShell";
import { StatBlock, StatLadder, StatSourceMeta } from "./StatBlock";
import { EarthQuote, StatLabel, HorizonLine } from "@/components/ui/CardTypography";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { useEarthVoice } from "@/hooks/useEarthVoice";

const accent = ACCENTS.temp;

export function TempCard({ active, onNext, onShare, grainLevel, voiceTone }: CardCommonProps) {
  const quote = useEarthVoice("temp", voiceTone);

  return (
    <CardShell
      cardId="temp"
      active={active}
      grainLevel={grainLevel}
      onNext={onNext}
      onShare={onShare}
    >
      <StatBlock
        accent={accent}
        underline="above preindustrial"
        fontSize={180}
        desktopFontSize="clamp(360px, 38vw, 500px)"
      >
        <span style={{ fontSize: "0.48em", verticalAlign: "top", color: accent.hex, marginRight: 4 }}>+</span>
        <AnimatedNumber value={1.55} decimals={2} />
        <span style={{ fontSize: "0.42em", verticalAlign: "top", marginLeft: 4 }}>°C</span>
      </StatBlock>

      <StatLadder
        accent={accent}
        rows={[
          { left: "— 0.00", right: "baseline" },
          { left: "— 0.54", right: "1980" },
          { left: "— 0.98", right: "2015" },
          { left: "— 1.55", right: "now", active: true },
          { left: "— 1.50", right: "paris goal", warn: true },
        ]}
      />
      <StatSourceMeta rows={["SRC: NASA GISS", "SRC: NOAA"]} dim={["ANOMALY", "CAL. 2026"]} />

      <StatLabel>Global Surface Temperature</StatLabel>
      <HorizonLine accent={accent} />
      <EarthQuote>&ldquo;{quote}&rdquo;</EarthQuote>
    </CardShell>
  );
}
