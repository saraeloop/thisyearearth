"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PALETTE, FONTS, ACCENTS } from "@/constants/colors";
import type { CardId, Pledge } from "@/types";
import { SITE } from "@/config/site";
import { backdrop, sheetSlideUp, EASE_OUT } from "@/constants/variants";
import { LargeGrain, GrainTexture } from "./Grain";
import { usePledgeCount } from "@/hooks/usePledge";
import { useMediaMin } from "@/hooks/useBreakpoint";

type ShareSheetProps = {
  open: boolean;
  cardId: CardId;
  pledge?: Pledge | null;
  onClose: () => void;
};

const SHARE_STATS = [
  ["CO2", "429 PPM"],
  ["TEMP", "+1.55C"],
  ["ICE LOST", "1.17T"],
  ["FOREST", "14.9M HA"],
  ["SPECIES", "41,046"],
  ["PLASTIC", "413 MT"],
  ["RENEWABLES", "+32%"],
];

const PRESET_PLEDGE_LINES: Record<string, string[]> = {
  eat: ["I will eat less meat", "this year. Every", "meal counts."],
  fly: ["I will fly less", "this year. Every", "mile counts."],
  plant: ["I will plant something", "this year. Every", "root counts."],
  vote: ["I will vote climate", "this year. Every", "ballot counts."],
  repair: ["I will repair more", "this year. Every", "thing kept counts."],
};

export function ShareSheet({ open, cardId, pledge, onClose }: ShareSheetProps) {
  return (
    <AnimatePresence>
      {open && <Sheet cardId={cardId} pledge={pledge} onClose={onClose} />}
    </AnimatePresence>
  );
}

function Sheet({
  cardId,
  pledge,
  onClose,
}: {
  cardId: CardId;
  pledge?: Pledge | null;
  onClose: () => void;
}) {
  void cardId;
  const [copied, setCopied] = useState(false);
  const pledgeCount = usePledgeCount(3000);
  const pledgeLines = getPledgeLines(pledge);
  const isDesktop = useMediaMin(1024);

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
        alignItems: isDesktop ? "center" : "flex-end",
        justifyContent: isDesktop ? "center" : undefined,
        padding: isDesktop ? 24 : 0,
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
          width: isDesktop ? "min(460px, calc(100vw - 48px))" : "100%",
          maxHeight: isDesktop ? "calc(100dvh - 48px)" : undefined,
          overflowY: isDesktop ? "auto" : undefined,
          borderRadius: isDesktop ? 18 : "24px 24px 0 0",
          background: "linear-gradient(180deg, #0e1220 0%, #070a12 100%)",
          border: "1px solid rgba(230,214,190,0.12)",
          borderBottom: isDesktop ? "1px solid rgba(230,214,190,0.12)" : "none",
          padding: isDesktop ? "14px 14px 18px" : "16px 20px 28px",
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
            maxWidth: isDesktop ? 420 : undefined,
            margin: isDesktop ? "0 auto 14px" : "0 0 16px",
            aspectRatio: "9 / 14",
            borderRadius: 14,
            overflow: "hidden",
            position: "relative",
            background: `
              radial-gradient(ellipse 75% 48% at 52% 48%, rgba(230,214,190,0.10) 0%, transparent 55%),
              radial-gradient(ellipse 120% 60% at 50% 115%, ${ACCENTS.final.glow} 0%, transparent 55%),
              linear-gradient(180deg, ${PALETTE.BG_TOP} 0%, ${PALETTE.BG_MID} 50%, ${PALETTE.BG_BOTTOM} 100%)
            `,
            border: "1px solid rgba(230,214,190,0.14)",
          }}
        >
          <LargeGrain opacity={0.4} />
          <GrainTexture opacity={0.25} />
          <ShareGlobe />

          <div
            style={{
              position: "absolute",
              top: 22,
              left: 20,
              right: 20,
              fontFamily: FONTS.MONO,
              fontSize: 8,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: PALETTE.ASH,
              zIndex: 5,
            }}
          >
            Earth Wrapped · {SITE.edition}
            <div
              style={{
                marginTop: 10,
                height: 1,
                background:
                  "linear-gradient(90deg, rgba(230,214,190,0.15), rgba(230,214,190,0.74), rgba(230,214,190,0.15))",
              }}
            />
          </div>

          <div
            style={{
              position: "absolute",
              top: isDesktop ? "23%" : "20%",
              left: 26,
              width: "46%",
              zIndex: 5,
            }}
          >
            <div
              style={{
                fontFamily: FONTS.SERIF,
                fontSize: "clamp(18px, 5vw, 24px)",
                lineHeight: 1.22,
                fontStyle: "italic",
                color: PALETTE.ASH,
                letterSpacing: "-0.01em",
                textWrap: "balance",
              }}
            >
              &ldquo;
              {pledgeLines.map((line, index) => (
                <span key={line}>
                  {line}
                  {index < pledgeLines.length - 1 && <br />}
                </span>
              ))}
              &rdquo;
              <div
                style={{
                  marginTop: 30,
                  fontSize: "0.78em",
                  textAlign: "center",
                  color: PALETTE.ASH_DIM,
                }}
              >
                — Sara
              </div>
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              top: isDesktop ? "49%" : "56%",
              right: 24,
              width: "42%",
              zIndex: 5,
            }}
          >
            <div
              style={{
                fontFamily: FONTS.MONO,
                fontSize: "clamp(7px, 2.25vw, 10px)",
                lineHeight: 1.8,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: PALETTE.ASH,
                textAlign: "right",
              }}
            >
              {SHARE_STATS.map(([name, value]) => (
                <div key={name}>
                  <span style={{ color: PALETTE.ASH_DIM }}>{name}</span>
                  <span style={{ color: PALETTE.ASH_DIMMER }}> · </span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              left: 20,
              right: 20,
              bottom: 48,
              zIndex: 5,
              height: 1,
              background:
                "linear-gradient(90deg, rgba(230,214,190,0.15), rgba(230,214,190,0.74), rgba(230,214,190,0.15))",
            }}
          />

          <div
            style={{
              position: "absolute",
              bottom: 19,
              left: 0,
              right: 0,
              zIndex: 5,
              textAlign: "center",
              fontFamily: FONTS.MONO,
              fontSize: 7.2,
              lineHeight: 1.8,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: PALETTE.ASH_DIM,
            }}
          >
            <div>{SITE.domain}</div>
            <div>Pledges minted · live · {pledgeCount.toLocaleString("en-US")}</div>
          </div>
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

function getPledgeLines(pledge?: Pledge | null) {
  if (!pledge) return PRESET_PLEDGE_LINES.eat;
  if (pledge.custom?.trim()) return wrapPledge(pledge.custom.trim());
  if (pledge.choice && PRESET_PLEDGE_LINES[pledge.choice]) {
    return PRESET_PLEDGE_LINES[pledge.choice];
  }
  return PRESET_PLEDGE_LINES.eat;
}

function wrapPledge(text: string) {
  const normalized = text.replace(/\s+/g, " ");
  if (normalized.length <= 26) return [normalized, "Every action counts."];
  const words = normalized.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > 24 && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
    if (lines.length === 2) break;
  }
  if (current && lines.length < 3) lines.push(current);
  return lines.slice(0, 3);
}

function ShareGlobe() {
  return (
    <svg
      aria-hidden="true"
      viewBox="-100 -100 200 200"
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: "86%",
        transform: "translate(-50%, -50%)",
        zIndex: 3,
        opacity: 0.2,
        color: PALETTE.ASH,
      }}
    >
      <circle
        cx="0"
        cy="0"
        r="86"
        fill="rgba(230,214,190,0.03)"
        stroke="currentColor"
        strokeWidth="0.45"
      />
      {[0, 30, 60, 90, 120, 150].map((angle) => (
        <ellipse
          key={angle}
          cx="0"
          cy="0"
          rx={86 * Math.abs(Math.cos((angle * Math.PI) / 180)) || 0.5}
          ry="86"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.28"
        />
      ))}
      {[-60, -30, 0, 30, 60].map((lat) => (
        <ellipse
          key={lat}
          cx="0"
          cy={(lat * 86) / 90}
          rx={86 * Math.cos((lat * Math.PI) / 180)}
          ry="4"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.28"
        />
      ))}
    </svg>
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
