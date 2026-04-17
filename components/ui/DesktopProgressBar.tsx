"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { CARD_IDS } from "@/constants/cards";
import { ACCENTS } from "@/constants/colors";

type DesktopProgressBarProps = {
  progress: MotionValue<number>;
};

export function DesktopProgressBar({ progress }: DesktopProgressBarProps) {
  const width = useTransform(
    progress,
    (v) => `${Math.max(0, Math.min(1, v)) * 100}%`,
  );

  const stops = CARD_IDS.map((_, i) => i / (CARD_IDS.length - 1));
  const accentStops = CARD_IDS.map((id) => ACCENTS[id].hex);
  const fillColor = useTransform(progress, stops, accentStops);

  const background = useTransform(
    fillColor,
    (c) => `linear-gradient(90deg, rgba(230,214,190,0.65), ${c})`,
  );

  return (
    <div
      style={{
        position: "fixed",
        top: 28,
        left: "4vw",
        right: "4vw",
        height: 2.5,
        zIndex: 60,
        borderRadius: 2,
        background: "rgba(230, 214, 190, 0.12)",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width,
          background,
          borderRadius: 2,
          filter: "blur(0.3px)",
        }}
      />
    </div>
  );
}
