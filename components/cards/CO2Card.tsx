"use client";

import { ACCENTS } from "@/constants/colors";
import type { CardCommonProps } from "@/types";
import { CardShell } from "./CardShell";
import { StatBlock, StatLadder, StatSourceMeta } from "./StatBlock";
import { EarthQuote, StatLabel, HorizonLine } from "@/components/ui/CardTypography";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { useEarthVoice } from "@/hooks/useEarthVoice";
import { useCo2 } from "@/hooks/useCo2";

const accent = ACCENTS.co2;

export function CO2Card({ active, onNext, onShare, grainLevel, voiceTone }: CardCommonProps) {
  const quote = useEarthVoice("co2", voiceTone);
  const { ppm } = useCo2();

  return (
    <CardShell
      cardId="co2"
      active={active}
      grainLevel={grainLevel}
      onNext={onNext}
      onShare={onShare}
    >
      <StatBlock accent={accent} underline="parts per million" fontSize={230}>
        <AnimatedNumber value={ppm} />
      </StatBlock>

      <StatLadder
        accent={accent}
        rows={[
          { left: "— 280", right: "preindustrial" },
          { left: "— 315", right: "1958" },
          { left: "— 369", right: "2000" },
          { left: `— ${ppm}`, right: "now", active: true },
        ]}
      />
      <StatSourceMeta
        rows={["LAT 19.5362°N", "LON 155.5763°W"]}
        dim={["MAUNA LOA", "OBSERVATORY"]}
      />

      <StatLabel>CO₂ in our atmosphere</StatLabel>
      <HorizonLine accent={accent} />
      <EarthQuote>&ldquo;{quote}&rdquo;</EarthQuote>
    </CardShell>
  );
}
