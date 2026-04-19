'use client';

import { PALETTE, FONTS } from '@/constants/colors';
import { TOTAL_CARDS } from '@/constants/cards';
import type { Accent } from '@/types';
import { useMediaMin } from '@/hooks/useBreakpoint';

type CardMetaProps = {
  active: number;
  accent: Accent;
  chapter?: string;
};

export function CardMeta({ active, chapter }: CardMetaProps) {
  const isDesktop = useMediaMin(1024);
  const label = String(active + 1).padStart(2, '0');
  return (
    <>
      <div
        className="ew-card-meta"
        style={{
          position: 'absolute',
          top: isDesktop ? 48 : 'calc(env(safe-area-inset-top, 0px) + 30px)',
          left: isDesktop ? '4vw' : 24,
          right: isDesktop ? '4vw' : 24,
          zIndex: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: FONTS.MONO,
          fontSize: 10,
          letterSpacing: isDesktop ? '0.28em' : '0.22em',
          textTransform: 'uppercase',
          color: PALETTE.ASH_DIM,
          fontWeight: 500,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: PALETTE.ASH }}>Wrapped · MMXXVI</span>
        </div>
        <span className="ew-card-counter" style={{ color: PALETTE.ASH_DIMMER }}>
          {label} / {String(TOTAL_CARDS).padStart(2, '0')}
        </span>
      </div>
      {chapter && (
        <div
          className="ew-card-chapter"
          style={{
            position: 'absolute',
            top: isDesktop ? 48 : 'calc(env(safe-area-inset-top, 0px) + 68px)',
            left: isDesktop ? '50%' : 24,
            transform: isDesktop ? 'translateX(-50%)' : undefined,
            width: isDesktop ? 'min(52vw, 620px)' : undefined,
            zIndex: 20,
            fontFamily: FONTS.MONO,
            fontSize: 10.5,
            letterSpacing: '0.3em',
            textAlign: isDesktop ? 'center' : undefined,
            textTransform: 'uppercase',
            color: PALETTE.ASH_DIM,
            fontWeight: 500,
            whiteSpace: isDesktop ? 'nowrap' : undefined,
          }}
        >
          {chapter}
        </div>
      )}
    </>
  );
}
