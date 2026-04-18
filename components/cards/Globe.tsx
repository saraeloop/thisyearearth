'use client';

import { motion } from 'framer-motion';
import { PALETTE } from '@/constants/colors';
import type { Accent } from '@/types';
import { slowRotate } from '@/constants/variants';
import { useMediaMin } from '@/hooks/useBreakpoint';

type GlobeProps = {
  accent: Accent;
  active: boolean;
};

export function Globe({ accent, active }: GlobeProps) {
  const isDesktop = useMediaMin(1024);

  return (
    <div
      style={{
        position: 'absolute',
        top: isDesktop ? '53%' : '53%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: isDesktop ? 'clamp(220px, 38vw, 360px)' : 'clamp(250px, 72vw, 340px)',
        height: isDesktop ? 'clamp(220px, 38vw, 360px)' : 'clamp(250px, 72vw, 340px)',
        zIndex: 5,
        pointerEvents: 'none',
      }}
    >
      <motion.svg
        viewBox="-100 -100 200 200"
        width="100%"
        height="100%"
        variants={slowRotate}
        animate="animate"
        style={{
          filter: active ? `drop-shadow(0 0 20px ${accent.glow})` : 'none',
        }}
      >
        <circle
          cx="0"
          cy="0"
          r="88"
          fill="none"
          stroke={PALETTE.ASH_DIMMER}
          strokeWidth="0.5"
        />
        <circle cx="0" cy="0" r="88" fill={`${accent.hex}08`} stroke="none" />
        {[0, 30, 60, 90, 120, 150].map((a) => (
          <ellipse
            key={a}
            cx="0"
            cy="0"
            rx={88 * Math.abs(Math.cos((a * Math.PI) / 180)) || 0.5}
            ry="88"
            fill="none"
            stroke={PALETTE.ASH_FAINT}
            strokeWidth="0.4"
          />
        ))}
        {[-60, -30, 0, 30, 60].map((lat) => (
          <ellipse
            key={lat}
            cx="0"
            cy={(lat * 88) / 90}
            rx={88 * Math.cos((lat * Math.PI) / 180)}
            ry={4}
            fill="none"
            stroke={PALETTE.ASH_FAINT}
            strokeWidth="0.4"
          />
        ))}
        {active && (
          <circle cx="30" cy="-18" r="3" fill={accent.hex}>
            <animate
              attributeName="r"
              values="3;6;3"
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="1;0.3;1"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
        )}
      </motion.svg>
    </div>
  );
}
