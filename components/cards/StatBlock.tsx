"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion } from "framer-motion";
import { PALETTE, FONTS } from "@/constants/colors";
import type { Accent } from "@/types";

type StatBlockProps = {
  accent: Accent;
  children: ReactNode;
  overline?: string;
  underline?: string;
  translateY?: number;
  fontSize?: number;
  desktopFontSize?: CSSProperties["fontSize"];
};

type StatLadderProps = {
  accent: Accent;
  rows: Array<{ left: string; right: string; active?: boolean; warn?: boolean }>;
  top?: number;
};

type StatSourceMetaProps = {
  top?: number;
  rows: string[];
  dim?: string[];
};

export function StatBlock({
  accent,
  children,
  overline,
  underline = "parts per million",
  translateY = -18,
  fontSize = 200,
  desktopFontSize,
}: StatBlockProps) {
  const halo: CSSProperties = {
    position: "absolute",
    inset: "-40px -20px",
    background: `radial-gradient(ellipse at center, ${accent.glow} 0%, transparent 65%)`,
    filter: "blur(30px)",
    zIndex: -1,
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 5,
        pointerEvents: "none",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
        style={{
          position: "relative",
          textAlign: "center",
          transform: `translateY(${translateY}px)`,
        }}
      >
        <div style={halo} />
        {overline && (
          <div
            style={{
              fontFamily: FONTS.MONO,
              fontSize: 10,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: PALETTE.ASH_DIM,
              marginBottom: 14,
            }}
          >
            {overline}
          </div>
        )}
        <div
          className="ew-stat-number"
          style={{
            "--ew-stat-mobile-size": `${fontSize}px`,
            "--ew-stat-desktop-size": desktopFontSize ?? `${fontSize}px`,
            fontFamily: FONTS.SERIF,
            fontWeight: 400,
            fontSize: "var(--ew-stat-mobile-size)",
            lineHeight: 0.82,
            letterSpacing: "-0.05em",
            color: PALETTE.ASH,
            textShadow: `0 2px 40px ${accent.glow}`,
            fontVariantNumeric: "lining-nums tabular-nums",
            whiteSpace: "nowrap",
          } as CSSProperties}
        >
          {children}
        </div>
        <div
          style={{
            marginTop: 18,
            fontFamily: FONTS.MONO,
            fontSize: 10.5,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: PALETTE.ASH_DIM,
          }}
        >
          {underline}
        </div>
      </motion.div>
    </div>
  );
}

export function StatLadder({ accent, rows, top = 258 }: StatLadderProps) {
  return (
    <div
      className="ew-stat-ladder"
      style={{
        position: "absolute",
        top,
        left: 24,
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        gap: 5,
        fontFamily: FONTS.MONO,
        fontSize: 8.5,
        letterSpacing: "0.12em",
        color: PALETTE.ASH_DIMMER,
        lineHeight: 1.2,
      }}
    >
      {rows.map((r, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: r.active ? accent.hex : r.warn ? "#C4C472" : PALETTE.ASH_DIMMER,
          }}
        >
          <span style={{ fontVariantNumeric: "tabular-nums" }}>{r.left}</span>
          <span>{r.right}</span>
        </div>
      ))}
    </div>
  );
}

export function StatSourceMeta({ top = 258, rows, dim = [] }: StatSourceMetaProps) {
  return (
    <div
      className="ew-stat-sources"
      style={{
        position: "absolute",
        top,
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
      {rows.map((r, i) => (
        <div key={i}>{r}</div>
      ))}
      {dim.length > 0 && (
        <div style={{ marginTop: 6, color: PALETTE.ASH_DIM }}>{dim[0]}</div>
      )}
      {dim.slice(1).map((d, i) => (
        <div key={i}>{d}</div>
      ))}
    </div>
  );
}
