"use client";

import { motion } from "framer-motion";

type GrainProps = { opacity?: number };

export function LargeGrain({ opacity = 0.55 }: GrainProps) {
  return (
    <svg
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        mixBlendMode: "soft-light",
        opacity,
        zIndex: 1,
      }}
    >
      <filter id="ew-haze">
        <motion.feTurbulence
          type="fractalNoise"
          numOctaves={3}
          seed={3}
          initial={{ baseFrequency: 0.011 }}
          animate={{ baseFrequency: [0.011, 0.014, 0.011] }}
          transition={{ duration: 18, ease: "easeInOut", repeat: Infinity }}
        />
        <feColorMatrix values="0 0 0 0 1  0 0 0 0 0.95  0 0 0 0 0.82  0 0 0 1.2 -0.1" />
      </filter>
      <rect width="100%" height="100%" filter="url(#ew-haze)" />
    </svg>
  );
}

export function GrainTexture({ opacity = 0.32 }: GrainProps) {
  return (
    <svg
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        mixBlendMode: "overlay",
        opacity,
        zIndex: 2,
      }}
    >
      <filter id="ew-grain">
        <motion.feTurbulence
          type="fractalNoise"
          numOctaves={2}
          seed={7}
          stitchTiles="stitch"
          initial={{ baseFrequency: 0.88 }}
          animate={{ baseFrequency: [0.88, 0.92, 0.88] }}
          transition={{ duration: 9, ease: "easeInOut", repeat: Infinity }}
        />
        <feColorMatrix values="0 0 0 0 0.9  0 0 0 0 0.88  0 0 0 0 0.82  0 0 0 0.7 0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#ew-grain)" />
    </svg>
  );
}
