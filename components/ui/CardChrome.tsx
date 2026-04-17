"use client";

import { motion } from "framer-motion";
import { PALETTE, FONTS } from "@/constants/colors";
import { SITE } from "@/config/site";
import { ShareIcon, ChevronIcon } from "./icons";
import { chevronDrift } from "@/constants/variants";

type CardChromeProps = {
  onShare?: () => void;
  onNext?: () => void;
  label?: string;
  hideNext?: boolean;
};

export function CardChrome({
  onShare,
  onNext,
  label = "Next",
  hideNext = false,
}: CardChromeProps) {
  return (
    <>
      <div
        style={{
          position: "absolute",
          bottom: 28,
          left: 0,
          right: 0,
          zIndex: 25,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 24px",
        }}
      >
        <button
          type="button"
          className="ew-share-button"
          onClick={(e) => {
            e.stopPropagation();
            onShare?.();
          }}
          style={{
            all: "unset",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "9px 13px",
            borderRadius: 99,
            background: "rgba(230, 214, 190, 0.06)",
            border: "1px solid rgba(230, 214, 190, 0.14)",
            backdropFilter: "blur(6px)",
            fontFamily: FONTS.MONO,
            fontSize: 9.5,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: PALETTE.ASH_DIM,
            fontWeight: 500,
          }}
        >
          <ShareIcon size={12} color={PALETTE.ASH_DIM} />
          Share
        </button>
        {!hideNext && (
          <div
            className="ew-card-next"
            onClick={(e) => {
              e.stopPropagation();
              onNext?.();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
              fontFamily: FONTS.MONO,
              fontSize: 9.5,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: PALETTE.ASH_DIMMER,
              fontWeight: 500,
            }}
          >
            <span>{label}</span>
            <motion.div
              variants={chevronDrift}
              animate="animate"
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: `1px solid ${PALETTE.ASH_DIMMER}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ChevronIcon size={12} color={PALETTE.ASH} />
            </motion.div>
          </div>
        )}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 8,
          left: 0,
          right: 0,
          zIndex: 25,
          textAlign: "center",
          fontFamily: FONTS.MONO,
          fontSize: 8,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "rgba(230, 214, 190, 0.22)",
          fontWeight: 500,
          pointerEvents: "none",
        }}
      >
        {SITE.domain}
      </div>
    </>
  );
}
