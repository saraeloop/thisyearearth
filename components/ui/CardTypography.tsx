'use client';

import type { CSSProperties, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { PALETTE, FONTS } from '@/constants/colors';
import type { Accent } from '@/types';
import { useMediaMax } from '@/hooks/useBreakpoint';

type EarthQuoteProps = {
  children: ReactNode;
  bottom?: CSSProperties['bottom'];
  left?: number;
  right?: number;
  belowHorizonOnMobile?: boolean;
};

type StatLabelProps = {
  children: ReactNode;
  bottom?: CSSProperties['bottom'];
};

type HorizonLineProps = {
  accent: Accent;
  bottom?: CSSProperties['bottom'];
};

export function EarthQuote({
  children,
  bottom = 'var(--ew-story-quote-bottom, 90px)',
  left = 32,
  right = 32,
  belowHorizonOnMobile = false,
}: EarthQuoteProps) {
  const isPhone = useMediaMax(767);
  const pinBelowHorizon = belowHorizonOnMobile && isPhone;
  const style: CSSProperties = {
    position: 'absolute',
    top: pinBelowHorizon
      ? 'calc(100% - var(--ew-story-horizon-bottom, 158px) + 18px)'
      : undefined,
    bottom: pinBelowHorizon ? 'auto' : bottom,
    left,
    right,
    zIndex: 15,
    textAlign: 'center',
    fontFamily: FONTS.SERIF,
    fontSize: 19,
    lineHeight: 1.35,
    color: PALETTE.ASH,
    fontStyle: 'italic',
    fontWeight: 400,
    letterSpacing: '-0.01em',
    textWrap: 'balance',
  };
  return (
    <motion.div
      className={
        belowHorizonOnMobile
          ? 'ew-earth-quote ew-earth-quote--below-horizon-mobile'
          : 'ew-earth-quote'
      }
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1], delay: 0.3 }}
      style={style}
    >
      <span
        className="ew-earth-quote-source"
        style={{
          display: 'block',
          fontFamily: FONTS.MONO,
          fontStyle: 'normal',
          fontSize: 9,
          letterSpacing: '0.3em',
          color: PALETTE.ASH_DIMMER,
          marginBottom: 14,
          textTransform: 'uppercase',
          fontWeight: 500,
        }}
      >
        — Earth
      </span>
      <span className="ew-earth-quote-text">{children}</span>
    </motion.div>
  );
}

export function StatLabel({
  children,
  bottom = 'var(--ew-story-stat-label-bottom, 180px)',
}: StatLabelProps) {
  return (
    <div
      className="ew-stat-label"
      style={{
        position: 'absolute',
        bottom,
        left: 0,
        right: 0,
        zIndex: 15,
        textAlign: 'center',
        fontFamily: FONTS.MONO,
        fontSize: 12.5,
        letterSpacing: '0.24em',
        textTransform: 'uppercase',
        color: PALETTE.ASH,
        fontWeight: 500,
      }}
    >
      {children}
    </div>
  );
}

export function HorizonLine({
  accent,
  bottom = 'var(--ew-story-horizon-bottom, 158px)',
}: HorizonLineProps) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom,
        left: 25,
        right: 25,
        zIndex: 15,
        height: 1,
        background: `linear-gradient(90deg, transparent, ${PALETTE.ASH_DIMMER}, ${accent.hex}, ${PALETTE.ASH_DIMMER}, transparent)`,
      }}
    />
  );
}
