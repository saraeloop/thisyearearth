"use client";

import { motion } from "framer-motion";
import { PALETTE, FONTS } from "@/constants/colors";
import type { Accent } from "@/types";

type MintButtonProps = {
  accent: Accent;
  disabled?: boolean;
  minting?: boolean;
  onClick: () => void;
};

export function MintButton({ accent, disabled, minting, onClick }: MintButtonProps) {
  const active = !disabled && !minting;
  return (
    <motion.button
      onClick={(e) => {
        e.stopPropagation();
        if (active) onClick();
      }}
      disabled={!active}
      whileTap={active ? { scale: 0.97 } : undefined}
      style={{
        all: "unset",
        cursor: active ? "pointer" : "not-allowed",
        textAlign: "center",
        display: "block",
        width: "100%",
        boxSizing: "border-box",
        padding: "16px",
        borderRadius: 12,
        background: active ? `${accent.hex}40` : "rgba(230,214,190,0.04)",
        border: `1px solid ${active ? accent.hex : "rgba(230,214,190,0.14)"}`,
        fontFamily: FONTS.MONO,
        fontSize: 11,
        letterSpacing: "0.28em",
        textTransform: "uppercase",
        color: active ? PALETTE.ASH : PALETTE.ASH_DIMMER,
        fontWeight: 500,
        backdropFilter: "blur(8px)",
        transition: "all 0.3s ease",
      }}
    >
      {minting ? "Writing to ledger…" : "Mint to the ledger →"}
    </motion.button>
  );
}
