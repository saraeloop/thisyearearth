"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PALETTE, FONTS, ACCENTS } from "@/constants/colors";
import type { Accent, CardId } from "@/types";
import { SHARE_DATA } from "@/constants/share";
import { SITE } from "@/config/site";
import { backdrop, sheetSlideUp, EASE_OUT } from "@/constants/variants";
import { LargeGrain, GrainTexture } from "./Grain";

type ShareSheetProps = {
  open: boolean;
  cardId: CardId;
  onClose: () => void;
};

export function ShareSheet({ open, cardId, onClose }: ShareSheetProps) {
  return (
    <AnimatePresence>
      {open && <Sheet cardId={cardId} onClose={onClose} />}
    </AnimatePresence>
  );
}

function Sheet({ cardId, onClose }: { cardId: CardId; onClose: () => void }) {
  const accent: Accent = ACCENTS[cardId];
  const { stat, label, quote } = SHARE_DATA[cardId];
  const [copied, setCopied] = useState(false);

  return (
    <motion.div
      variants={backdrop}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.3 }}
      onClick={onClose}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 100,
        background: "rgba(5,6,8,0.72)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "flex-end",
      }}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        variants={sheetSlideUp}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.4, ease: EASE_OUT }}
        style={{
          width: "100%",
          borderRadius: "24px 24px 0 0",
          background: "linear-gradient(180deg, #0e1220 0%, #070a12 100%)",
          border: "1px solid rgba(230,214,190,0.12)",
          borderBottom: "none",
          padding: "16px 20px 28px",
        }}
      >
        <div
          style={{
            width: 36,
            height: 4,
            borderRadius: 2,
            background: "rgba(230,214,190,0.2)",
            margin: "0 auto 16px",
          }}
        />
        <div
          style={{
            fontFamily: FONTS.MONO,
            fontSize: 10,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: PALETTE.ASH_DIM,
            textAlign: "center",
            marginBottom: 14,
          }}
        >
          Share to the record
        </div>

        <div
          style={{
            width: "100%",
            aspectRatio: "9 / 14",
            borderRadius: 14,
            overflow: "hidden",
            position: "relative",
            background: `
              radial-gradient(ellipse 120% 60% at 50% 115%, ${accent.glow} 0%, transparent 55%),
              linear-gradient(180deg, ${PALETTE.BG_TOP} 0%, ${PALETTE.BG_MID} 50%, ${PALETTE.BG_BOTTOM} 100%)
            `,
            border: "1px solid rgba(230,214,190,0.14)",
            marginBottom: 16,
          }}
        >
          <LargeGrain opacity={0.4} />
          <GrainTexture opacity={0.25} />

          <div
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              right: 16,
              display: "flex",
              justifyContent: "space-between",
              fontFamily: FONTS.MONO,
              fontSize: 7.5,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: PALETTE.ASH_DIM,
              zIndex: 5,
            }}
          >
            <span>
              {SITE.name} · {SITE.edition}
            </span>
            <span style={{ color: PALETTE.ASH_DIMMER }}>{label.slice(0, 8)}</span>
          </div>

          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 5,
              padding: "0 20px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: FONTS.SERIF,
                fontSize: 68,
                lineHeight: 0.9,
                color: PALETTE.ASH,
                letterSpacing: "-0.05em",
                textShadow: `0 2px 20px ${accent.glow}`,
              }}
            >
              {stat}
            </div>
            <div
              style={{
                marginTop: 10,
                fontFamily: FONTS.MONO,
                fontSize: 8,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: PALETTE.ASH_DIM,
              }}
            >
              {label}
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              bottom: 60,
              left: 20,
              right: 20,
              fontFamily: FONTS.SERIF,
              fontSize: 11,
              fontStyle: "italic",
              color: PALETTE.ASH,
              textAlign: "center",
              lineHeight: 1.35,
              zIndex: 5,
              textWrap: "balance",
            }}
          >
            &ldquo;{quote}&rdquo;
          </div>

          <div
            style={{
              position: "absolute",
              bottom: 20,
              left: 0,
              right: 0,
              zIndex: 5,
              textAlign: "center",
              fontFamily: FONTS.MONO,
              fontSize: 7,
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: PALETTE.ASH_DIM,
            }}
          >
            {SITE.domain}
          </div>

          <div
            style={{
              position: "absolute",
              bottom: 42,
              left: "50%",
              transform: "translateX(-50%)",
              width: 18,
              height: 1,
              background: accent.hex,
              zIndex: 5,
            }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <ShareAction label="Instagram" sub="Stories" onClick={() => {}} />
          <ShareAction label="X" sub="Post" onClick={() => {}} />
          <ShareAction label="Copy Image" sub="PNG · 1080×1920" onClick={() => {}} />
          <ShareAction
            label={copied ? "Copied ✓" : "Copy Link"}
            sub={SITE.domain}
            onClick={() => {
              if (typeof window !== "undefined") {
                window.navigator.clipboard
                  ?.writeText(`https://${SITE.domain}`)
                  .catch(() => {});
              }
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          />
        </div>

        <button
          onClick={onClose}
          style={{
            all: "unset",
            cursor: "pointer",
            display: "block",
            margin: "16px auto 0",
            padding: "8px 16px",
            fontFamily: FONTS.MONO,
            fontSize: 9,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: PALETTE.ASH_DIMMER,
          }}
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}

function ShareAction({
  label,
  sub,
  onClick,
}: {
  label: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        all: "unset",
        cursor: "pointer",
        textAlign: "center",
        padding: "12px 10px",
        borderRadius: 12,
        background: "rgba(230,214,190,0.04)",
        border: "1px solid rgba(230,214,190,0.14)",
      }}
    >
      <div
        style={{
          fontFamily: FONTS.MONO,
          fontSize: 10.5,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: PALETTE.ASH,
          fontWeight: 500,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: FONTS.MONO,
          fontSize: 7.5,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: PALETTE.ASH_DIMMER,
          marginTop: 3,
        }}
      >
        {sub}
      </div>
    </button>
  );
}
