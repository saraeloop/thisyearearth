"use client";

import { motion } from "framer-motion";
import { PALETTE, FONTS } from "@/constants/colors";
import { TOTAL_CARDS } from "@/constants/cards";
import type { Accent } from "@/types";
import { pulseDot } from "@/constants/variants";

type CardMetaProps = {
  active: number;
  accent: Accent;
  chapter?: string;
};

export function CardMeta({ active, accent, chapter }: CardMetaProps) {
  const label = String(active + 1).padStart(2, "0");
  return (
    <>
      <div
        className="ew-card-meta"
        style={{
          position: "absolute",
          top: 82,
          left: 24,
          right: 24,
          zIndex: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: FONTS.MONO,
          fontSize: 10,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: PALETTE.ASH_DIM,
          fontWeight: 500,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <motion.div
            variants={pulseDot}
            animate="animate"
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: accent.hex,
              boxShadow: `0 0 8px ${accent.hex}`,
            }}
          />
          <span>Wrapped · MMXXVI</span>
        </div>
        <span style={{ color: PALETTE.ASH_DIMMER }}>
          {label} / {String(TOTAL_CARDS).padStart(2, "0")}
        </span>
      </div>
      {chapter && (
        <div
          className="ew-card-chapter"
          style={{
            position: "absolute",
            top: 132,
            left: 24,
            zIndex: 20,
            fontFamily: FONTS.MONO,
            fontSize: 10.5,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: PALETTE.ASH_DIM,
            fontWeight: 500,
          }}
        >
          {chapter}
        </div>
      )}
    </>
  );
}
