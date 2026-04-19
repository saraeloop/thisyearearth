'use client';

import { motion } from 'framer-motion';
import { PALETTE, FONTS, ACCENTS } from '@/constants/colors';
import { TOTAL_CARDS } from '@/constants/cards';
import type { CardCommonProps } from '@/types';
import { CardShell } from './CardShell';
import { EarthQuote } from '@/components/ui/CardTypography';
import { useMediaMin } from '@/hooks/useBreakpoint';

const accent = ACCENTS.intro;

export function IntroCard({
  active,
  onNext,
  onShare,
  grainLevel,
}: CardCommonProps) {
  const isDesktop = useMediaMin(1024);

  return (
    <CardShell
      cardId="intro"
      active={active}
      grainLevel={grainLevel}
      onNext={onNext}
      onShare={onShare}
      nextLabel="Begin"
    >
      <div
        style={{
          position: 'absolute',
          top: 170,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONTS.SERIF,
          fontSize: 80,
          lineHeight: 1,
          color: PALETTE.ASH_FAINT,
          fontStyle: 'italic',
          letterSpacing: '0.05em',
          zIndex: 4,
        }}
      >
        I
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 1 }}
        style={{
          position: 'absolute',
          top: 270,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONTS.MONO,
          fontSize: 10,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: PALETTE.ASH_DIMMER,
          zIndex: 4,
        }}
      >
        Year 4,543,000,000
      </motion.div>

      <div
        style={{
          position: 'absolute',
          top: isDesktop ? 285 : 310,
          left: 32,
          right: 32,
          fontFamily: FONTS.SERIF,
          fontSize: isDesktop ? 'clamp(54px, 5vw, 76px)' : 36,
          lineHeight: isDesktop ? 1.05 : 1.15,
          color: PALETTE.ASH,
          fontStyle: 'italic',
          fontWeight: 400,
          letterSpacing: '-0.02em',
          textAlign: 'center',
          zIndex: 5,
          textWrap: 'balance',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 1.2 }}
        >
          This year,
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.2, duration: 1.2 }}
          style={{ color: accent.hex }}
        >
          I kept a record.
        </motion.div>
      </div>

      <EarthQuote bottom={180}>
        Signed,
        <br />
        the planet.
      </EarthQuote>

      <div
        style={{
          position: 'absolute',
          bottom: 100,
          left: isDesktop ? '4vw' : 24,
          zIndex: 15,
          fontFamily: FONTS.MONO,
          fontSize: 8.5,
          letterSpacing: '0.18em',
          color: PALETTE.ASH_DIMMER,
          lineHeight: 1.8,
          textTransform: 'uppercase',
        }}
      >
        {isDesktop ? (
          <>
            <MetaLine label="Filed" value="2026.04.17" />
            <MetaLine label="Cycles" value="4.543 · 10⁹" />
          </>
        ) : (
          <>
            <div>Filed: 2026.04.17</div>
            <div>Cycles: 4.543 · 10⁹</div>
          </>
        )}
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 100,
          right: isDesktop ? '4vw' : 24,
          zIndex: 15,
          fontFamily: FONTS.MONO,
          fontSize: 8.5,
          letterSpacing: '0.18em',
          color: PALETTE.ASH_DIMMER,
          lineHeight: 1.8,
          textTransform: 'uppercase',
          textAlign: 'right',
        }}
      >
        {isDesktop ? (
          <>
            <MetaLine label="Vol." value="MMXXVI" align="right" />
            <MetaLine
              label="Entries"
              value={String(TOTAL_CARDS).padStart(2, '0')}
              align="right"
            />
          </>
        ) : (
          <>
            <div>Vol. MMXXVI</div>
            <div>{String(TOTAL_CARDS).padStart(2, '0')} Entries</div>
          </>
        )}
      </div>
    </CardShell>
  );
}

function MetaLine({
  label,
  value,
  align = 'left',
}: {
  label: string;
  value: string;
  align?: 'left' | 'right';
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: align === 'right' ? 'auto minmax(42px, max-content)' : 'auto auto',
        columnGap: 8,
        justifyContent: align === 'right' ? 'end' : 'start',
      }}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
