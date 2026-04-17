"use client";

import { PALETTE, FONTS, ACCENTS } from "@/constants/colors";
import type { CardCommonProps } from "@/types";
import { CardShell } from "./CardShell";
import { StatBlock, StatLadder } from "./StatBlock";
import { EarthQuote, StatLabel, HorizonLine } from "@/components/ui/CardTypography";
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
      >
        <span style={{ fontSize: 140, verticalAlign: "top", color: accent.hex, marginRight: 4 }}>+</span>
        1.55
        <span style={{ fontSize: 110, verticalAlign: "top", marginLeft: 4 }}>°C</span>
      </StatBlock>

      <StatLadder
        accent={accent}
        top={230}
        rows={[
          { left: "— 0.00", right: "baseline" },
          { left: "— 0.54", right: "1980" },
          { left: "— 0.98", right: "2015" },
          { left: "— 1.55", right: "now", active: true },
          { left: "— 1.50", right: "paris goal", warn: true },
        ]}
      />
      <div
        style={{
          position: "absolute",
          top: 230,
          right: 24,
          textAlign: "right",
          zIndex: 10,
          fontFamily: FONTS.MONO,
          fontSize: 8.5,
          letterSpacing: "0.12em",
          color: PALETTE.ASH_DIMMER,
          lineHeight: 1.6,
        }}
      >
        <div>SRC: NASA GISS</div>
        <div>SRC: NOAA</div>
        <div style={{ marginTop: 6, color: PALETTE.ASH_DIM }}>ANOMALY</div>
        <div>CAL. 2026</div>
      </div>

      <StatLabel>Global Surface Temperature</StatLabel>
      <HorizonLine accent={accent} />
      <EarthQuote>&ldquo;{quote}&rdquo;</EarthQuote>
    </CardShell>
  );
}
