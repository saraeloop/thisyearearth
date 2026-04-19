"use client";

import { ACCENTS } from "@/constants/colors";
import type { CardCommonProps } from "@/types";
import { CardShell } from "./CardShell";
import { StatBlock, StatLadder, StatSourceMeta } from "./StatBlock";
import { EarthQuote, StatLabel, HorizonLine } from "@/components/ui/CardTypography";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { useEarthVoice } from "@/hooks/useEarthVoice";

const accent = ACCENTS.forest;

export function ForestCard({ active, onNext, onShare, grainLevel, voiceTone }: CardCommonProps) {
  const quote = useEarthVoice("forest", voiceTone);

  return (
    <CardShell
      cardId="forest"
      active={active}
      grainLevel={grainLevel}
      onNext={onNext}
      onShare={onShare}
    >
      <StatBlock
        accent={accent}
        underline="hectares of forest"
        fontSize={190}
        desktopFontSize="clamp(340px, 36vw, 480px)"
      >
        <AnimatedNumber value={14.9} decimals={1} />
        <span style={{ color: accent.hex, fontSize: "0.58em" }}>M</span>
      </StatBlock>

      <svg
        style={{
          position: "absolute",
          bottom: 195,
          left: 20,
          right: 20,
          height: 40,
          zIndex: 8,
          pointerEvents: "none",
          opacity: 0.55,
        }}
        viewBox="0 0 350 40"
        preserveAspectRatio="none"
      >
        {Array.from({ length: 120 }).map((_, i) => {
          const x = (i % 30) * 12 + 4;
          const y = Math.floor(i / 30) * 10 + 4;
          const lost = i % 7 < 3;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={lost ? 1.2 : 1}
              fill={lost ? "rgba(212,87,62,0.6)" : accent.hex}
              opacity={lost ? 0.7 : 0.35}
            />
          );
        })}
      </svg>

      <StatLadder
        accent={accent}
        rows={[
          { left: "— AMAZON", right: "· 3.7 MHA" },
          { left: "— CONGO", right: "· 1.1 MHA" },
          { left: "— BOREAL", right: "· 5.2 MHA" },
          { left: "— S.E. ASIA", right: "· 2.3 MHA" },
          { left: "— PRIMARY", right: "· 3.7 MHA", active: true },
        ]}
      />
      <StatSourceMeta
        rows={["SRC: GLOBAL FOREST WATCH", "SRC: WRI"]}
        dim={["TREE COVER LOSS", "ANNUAL"]}
      />

      <StatLabel>Forest I lost this year</StatLabel>
      <HorizonLine accent={accent} />
      <EarthQuote>&ldquo;{quote}&rdquo;</EarthQuote>
    </CardShell>
  );
}
