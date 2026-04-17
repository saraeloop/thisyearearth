"use client";

import { ACCENTS } from "@/constants/colors";
import type { CardCommonProps } from "@/types";
import { CardShell } from "./CardShell";
import { StatBlock, StatLadder, StatSourceMeta } from "./StatBlock";
import { EarthQuote, StatLabel, HorizonLine } from "@/components/ui/CardTypography";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { useEarthVoice } from "@/hooks/useEarthVoice";

const accent = ACCENTS.ice;

export function IceCard({ active, onNext, onShare, grainLevel, voiceTone }: CardCommonProps) {
  const quote = useEarthVoice("ice", voiceTone);

  return (
    <CardShell
      cardId="ice"
      active={active}
      grainLevel={grainLevel}
      onNext={onNext}
      onShare={onShare}
    >
      <StatBlock
        accent={accent}
        overline="lost this year"
        underline="tonnes of ice"
        fontSize={200}
        translateY={-20}
      >
        <AnimatedNumber value={1.17} decimals={2} />
        <span style={{ color: accent.hex }}>T</span>
      </StatBlock>

      <svg
        style={{
          position: "absolute",
          bottom: 200,
          left: 0,
          right: 0,
          width: "100%",
          height: 80,
          zIndex: 8,
          pointerEvents: "none",
          opacity: 0.4,
        }}
        viewBox="0 0 390 80"
        preserveAspectRatio="none"
      >
        {Array.from({ length: 24 }).map((_, i) => {
          const x = 20 + i * 15;
          const h = 20 + Math.sin(i * 1.3) * 25 + (i % 3) * 10;
          return <line key={i} x1={x} y1={0} x2={x} y2={h} stroke={accent.hex} strokeWidth="0.6" />;
        })}
      </svg>

      <StatLadder
        accent={accent}
        top={260}
        rows={[
          { left: "— GREENLAND", right: "· 270 GT" },
          { left: "— ANTARCTICA", right: "· 150 GT" },
          { left: "— GLACIERS", right: "· 335 GT" },
          { left: "— SEA ICE", right: "· 415 GT" },
          { left: "— TOTAL", right: "· 1170 GT", active: true },
        ]}
      />
      <StatSourceMeta
        top={260}
        rows={["SRC: NASA GRACE-FO", "SRC: NSIDC"]}
        dim={["CRYOSPHERE", "ANNUAL NET"]}
      />

      <StatLabel>Ice lost from my shoulders</StatLabel>
      <HorizonLine accent={accent} />
      <EarthQuote>&ldquo;{quote}&rdquo;</EarthQuote>
    </CardShell>
  );
}
