"use client";

import { PALETTE, FONTS } from "@/constants/colors";
import type { Accent } from "@/types";

type PledgeConstellationProps = {
  accent: Accent;
  yourPledge: boolean;
};

const cols = 22;
const rows = 6;
const dots: {
  x: number;
  y: number;
  brightness: number;
  size: number;
  delay: number;
}[] = Array.from({ length: cols * rows }, (_, i) => ({
  x: (i % cols) / (cols - 1),
  y: Math.floor(i / cols) / (rows - 1),
  brightness: 0.2 + seededUnit(i, 1) * 0.8,
  size: 0.6 + seededUnit(i, 2) * 1.4,
  delay: seededUnit(i, 3) * 4,
}));

export function PledgeConstellation({ accent, yourPledge }: PledgeConstellationProps) {
  const yourIdx = 47;

  return (
    <div
      style={{
        position: "absolute",
        top: 340,
        left: 20,
        right: 20,
        height: 90,
        zIndex: 8,
        pointerEvents: "none",
      }}
    >
      <svg viewBox="0 0 350 90" preserveAspectRatio="none" width="100%" height="100%">
        {dots.map((d, i) => {
          const isYou = yourPledge && i === yourIdx;
          return (
            <circle
              key={i}
              cx={d.x * 340 + 5}
              cy={d.y * 80 + 5}
              r={isYou ? 2.4 : d.size}
              fill={accent.hex}
              opacity={isYou ? 1 : d.brightness * 0.8}
              style={isYou ? { filter: `drop-shadow(0 0 4px ${accent.hex})` } : undefined}
            >
              {isYou && (
                <animate
                  attributeName="opacity"
                  values="1;0.4;1"
                  dur="1.6s"
                  repeatCount="indefinite"
                />
              )}
              {!isYou && (
                <animate
                  attributeName="opacity"
                  values={`${d.brightness * 0.4};${d.brightness};${d.brightness * 0.4}`}
                  dur={`${3 + d.delay}s`}
                  repeatCount="indefinite"
                />
              )}
            </circle>
          );
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          top: -18,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONTS.MONO,
          fontSize: 8.5,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: PALETTE.ASH_DIMMER,
        }}
      >
        tonight&rsquo;s readers · the constellation
      </div>
    </div>
  );
}

function seededUnit(index: number, salt: number) {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}
