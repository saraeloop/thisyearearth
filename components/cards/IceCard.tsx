"use client";

import { ACCENTS } from "@/constants/colors";
import type { CardCommonProps } from "@/types";
import { CardShell } from "./CardShell";
import { StatBlock, StatLadder, StatSourceMeta } from "./StatBlock";
import { EarthQuote, StatLabel, HorizonLine } from "@/components/ui/CardTypography";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { useEarthVoice } from "@/hooks/useEarthVoice";
import { useMediaMin } from "@/hooks/useBreakpoint";

const accent = ACCENTS.ice;

export function IceCard({ active, onNext, onShare, grainLevel, voiceTone }: CardCommonProps) {
  const quote = useEarthVoice("ice", voiceTone);
  const isDesktop = useMediaMin(1024);

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
        desktopFontSize="clamp(360px, 38vw, 500px)"
        translateY={-20}
      >
        <AnimatedNumber value={1.17} decimals={2} />
        <span style={{ color: accent.hex, fontSize: "0.9em" }}>T</span>
      </StatBlock>

      <svg
        style={{
          position: "absolute",
          bottom: isDesktop ? 190 : 205,
          left: 0,
          right: 0,
          width: "100%",
          height: isDesktop ? 58 : 54,
          zIndex: 4,
          pointerEvents: "none",
          opacity: isDesktop ? 0.32 : 0.34,
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

      <StatLabel bottom={isDesktop ? 148 : undefined}>Ice lost from my shoulders</StatLabel>
      <HorizonLine accent={accent} bottom={isDesktop ? 124 : undefined} />
      <EarthQuote bottom={isDesktop ? 62 : undefined}>&ldquo;{quote}&rdquo;</EarthQuote>
    </CardShell>
  );
}
