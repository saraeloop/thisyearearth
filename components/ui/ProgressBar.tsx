"use client";

import { motion } from "framer-motion";
import type { Accent } from "@/types";

type ProgressBarProps = {
  total: number;
  active: number;
  accent: Accent;
};

export function ProgressBar({ total, active, accent }: ProgressBarProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: 58,
        left: 20,
        right: 20,
        zIndex: 30,
        display: "flex",
        gap: 3.5,
        pointerEvents: "none",
      }}
    >
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: 2.5,
            borderRadius: 2,
            background: "rgba(230, 214, 190, 0.14)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <motion.div
            style={{
              position: "absolute",
              inset: 0,
              background: i === active ? accent.hex : "rgba(230, 214, 190, 0.85)",
            }}
            initial={false}
            animate={{ width: i <= active ? "100%" : "0%" }}
            transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          />
        </div>
      ))}
    </div>
  );
}
