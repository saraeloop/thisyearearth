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
      className="ew-progress-discrete"
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
              originX: 0,
              background:
                i === active
                  ? `linear-gradient(90deg, ${accent.hex}, rgba(230,214,190,0.85))`
                  : "rgba(230, 214, 190, 0.85)",
              borderRadius: 2,
            }}
            initial={false}
            animate={{ scaleX: i < active ? 1 : i === active ? 1 : 0 }}
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 22,
              mass: 0.6,
            }}
          />
        </div>
      ))}
    </div>
  );
}
