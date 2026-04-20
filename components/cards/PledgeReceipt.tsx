"use client";

import { motion } from "framer-motion";
import { PALETTE, FONTS } from "@/constants/colors";
import type { Accent } from "@/types";
import { stampRotate } from "@/constants/variants";

type PledgeReceiptProps = {
  accent: Accent;
  pledge: string;
  txHash?: string | null;
  returnHref?: string | null;
  onNext: () => void;
};

export function PledgeReceipt({
  accent,
  pledge,
  txHash,
  returnHref,
  onNext,
}: PledgeReceiptProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 32px",
      }}
    >
      <div
        style={{
          fontFamily: FONTS.MONO,
          fontSize: 10,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: accent.hex,
          marginBottom: 14,
        }}
      >
        · Pledge recorded ·
      </div>

      <div
        style={{
          width: 180,
          height: 180,
          marginBottom: 30,
          position: "relative",
        }}
      >
        <motion.div
          variants={stampRotate}
          animate="animate"
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: `1px dashed ${accent.hex}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: "50%",
              border: `1px solid ${PALETTE.ASH_DIMMER}`,
            }}
          />
        </motion.div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONTS.SERIF,
            fontSize: 42,
            fontStyle: "italic",
            color: accent.hex,
          }}
        >
          ✓
        </div>
      </div>

      <div
        style={{
          fontFamily: FONTS.SERIF,
          fontSize: 22,
          fontStyle: "italic",
          color: PALETTE.ASH,
          textAlign: "center",
          lineHeight: 1.35,
          letterSpacing: "-0.01em",
          maxWidth: 280,
          textWrap: "balance",
        }}
      >
        &ldquo;{pledge}&rdquo;
      </div>

      <div
        style={{
          marginTop: 24,
          fontFamily: FONTS.MONO,
          fontSize: 9,
          letterSpacing: "0.2em",
          color: PALETTE.ASH_DIMMER,
          textTransform: "uppercase",
        }}
      >
        {txHash ? `TX · ${txHash}` : "Public record"}
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        style={{
          all: "unset",
          cursor: "pointer",
          marginTop: 32,
          padding: "12px 26px",
          borderRadius: 99,
          background: `${accent.hex}30`,
          border: `1px solid ${accent.hex}80`,
          fontFamily: FONTS.MONO,
          fontSize: 10.5,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          color: PALETTE.ASH,
          fontWeight: 500,
        }}
      >
        Continue →
      </button>

      {returnHref && (
        <a
          href={returnHref}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{
            marginTop: 14,
            fontFamily: FONTS.MONO,
            fontSize: 9,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: PALETTE.ASH_DIM,
            textDecoration: "none",
          }}
        >
          Continue in browser ↗
        </a>
      )}
    </div>
  );
}
