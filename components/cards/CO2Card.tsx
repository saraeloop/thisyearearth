'use client';

import { useMemo } from 'react';
import { ACCENTS, FONTS, PALETTE } from '@/constants/colors';
import type { CardCommonProps } from '@/types';
import { CardShell } from './CardShell';
import { StatBlock } from './StatBlock';
import {
  EarthQuote,
  StatLabel,
  HorizonLine,
} from '@/components/ui/CardTypography';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { useEarthVoice } from '@/hooks/useEarthVoice';
import { useCo2 } from '@/hooks/useCo2';
import { useMediaMin } from '@/hooks/useBreakpoint';

const accent = ACCENTS.co2;
const ppmFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
});

function sparklinePath(values: number[]) {
  if (values.length < 2) return '';

  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min;

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = spread === 0 ? 40 : 72 - ((value - min) / spread) * 64;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(3)} ${y.toFixed(3)}`;
    })
    .join(' ');
}

export function CO2Card({
  active,
  onNext,
  onShare,
  grainLevel,
  voiceTone,
}: CardCommonProps) {
  const quote = useEarthVoice('co2', voiceTone);
  const co2 = useCo2();
  const isDesktop = useMediaMin(1024);
  const latest = Math.round(co2.latest);
  const path = useMemo(() => sparklinePath(co2.sparkline), [co2.sparkline]);

  return (
    <CardShell
      cardId="co2"
      active={active}
      grainLevel={grainLevel}
      onNext={onNext}
      onShare={onShare}
    >
      {path && (
        <svg
          aria-hidden="true"
          viewBox="0 0 100 80"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: isDesktop ? 222 : 230,
            zIndex: 8,
            width: '100%',
            height: 80,
            pointerEvents: 'none',
          }}
        >
          <path
            d={path}
            fill="none"
            stroke={accent.hex}
            strokeOpacity={0.3}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}

      <div
        style={{
          position: 'absolute',
          top: isDesktop ? 166 : 'calc(50% + 132px)',
          left: 24,
          right: 24,
          zIndex: 16,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: isDesktop ? 7 : 5,
          fontFamily: FONTS.MONO,
          fontSize: isDesktop ? 11 : 8.5,
          letterSpacing: isDesktop ? '0.26em' : '0.18em',
          lineHeight: 1.35,
          textTransform: 'uppercase',
          color: accent.hex,
          opacity: 0.82,
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        <span>PEAK THIS YEAR · {ppmFormatter.format(co2.ytdHigh)} PPM </span>
        <span>
          SINCE 1974 · +{ppmFormatter.format(co2.sinceStartDelta)} PPM
        </span>
      </div>

      <StatBlock
        accent={accent}
        underline="parts per million"
        fontSize={230}
        desktopFontSize="clamp(360px, 36vw, 460px)"
        translateY={isDesktop ? -54 : -18}
      >
        <AnimatedNumber value={latest} />
      </StatBlock>

      <StatLabel>Above preindustrial</StatLabel>
      <HorizonLine accent={accent} />
      <EarthQuote>&ldquo;{quote}&rdquo;</EarthQuote>
      <div
        style={{
          position: 'absolute',
          right: 24,
          bottom: 78,
          zIndex: 16,
          maxWidth: isDesktop ? '42vw' : 260,
          textAlign: 'right',
          fontFamily: FONTS.MONO,
          fontSize: isDesktop ? 10 : 8.5,
          letterSpacing: isDesktop ? '0.18em' : '0.12em',
          lineHeight: 1.35,
          textTransform: 'uppercase',
          color: PALETTE.ASH,
          opacity: 0.4,
          pointerEvents: 'none',
        }}
      >
        NOAA GML · MAUNA LOA · PRELIMINARY
      </div>
    </CardShell>
  );
}
