"use client";

import { useMemo } from "react";
import { PALETTE, FONTS } from "@/constants/colors";
import type { Accent } from "@/types";

type PledgeConstellationProps = {
  accent: Accent;
  yourPledge: boolean;
};

export function PledgeConstellation({ accent, yourPledge }: PledgeConstellationProps) {
  const dots = useMemo(() => {
    const arr: {
      x: number;
      y: number;
      brightness: number;
      size: number;
      delay: number;
    }[] = [];
    const cols = 22;
    const rows = 6;
    for (let i = 0; i < cols * rows; i++) {
      arr.push({
        x: (i % cols) / (cols - 1),
        y: Math.floor(i / cols) / (rows - 1),
        brightness: 0.2 + Math.random() * 0.8,
        size: 0.6 + Math.random() * 1.4,
        delay: Math.random() * 4,
      });
    }
    return arr;
  }, []);

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
