import type { CSSProperties, ReactNode } from "react";
import { PALETTE, FONTS } from "@/constants/colors";
import type { Accent } from "@/types";

type EarthQuoteProps = {
  children: ReactNode;
  bottom?: number;
  left?: number;
  right?: number;
};

type StatLabelProps = {
  children: ReactNode;
  bottom?: number;
};

type HorizonLineProps = {
  accent: Accent;
  bottom?: number;
};

export function EarthQuote({
  children,
  bottom = 90,
  left = 32,
  right = 32,
}: EarthQuoteProps) {
  const style: CSSProperties = {
    position: "absolute",
    bottom,
    left,
    right,
    zIndex: 15,
    textAlign: "center",
    fontFamily: FONTS.SERIF,
    fontSize: 19,
    lineHeight: 1.35,
    color: PALETTE.ASH,
    fontStyle: "italic",
    fontWeight: 400,
    letterSpacing: "-0.01em",
    textWrap: "balance",
  };
  return (
    <div style={style}>
      <span
        style={{
          display: "block",
          fontFamily: FONTS.MONO,
          fontStyle: "normal",
          fontSize: 9,
          letterSpacing: "0.3em",
          color: PALETTE.ASH_DIMMER,
          marginBottom: 14,
          textTransform: "uppercase",
          fontWeight: 500,
        }}
      >
        — Earth
      </span>
      {children}
    </div>
  );
}

export function StatLabel({ children, bottom = 180 }: StatLabelProps) {
  return (
    <div
      style={{
        position: "absolute",
        bottom,
        left: 0,
        right: 0,
        zIndex: 15,
        textAlign: "center",
        fontFamily: FONTS.MONO,
        fontSize: 12.5,
        letterSpacing: "0.24em",
        textTransform: "uppercase",
        color: PALETTE.ASH,
        fontWeight: 500,
      }}
    >
      {children}
    </div>
  );
}

export function HorizonLine({ accent, bottom = 158 }: HorizonLineProps) {
  return (
    <div
      style={{
        position: "absolute",
        bottom,
        left: 40,
        right: 40,
        zIndex: 15,
        height: 1,
        background: `linear-gradient(90deg, transparent, ${PALETTE.ASH_DIMMER}, ${accent.hex}, ${PALETTE.ASH_DIMMER}, transparent)`,
      }}
    />
  );
}
