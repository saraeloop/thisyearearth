'use client';

import { FONTS, ACCENTS } from '@/constants/colors';
import type { CardCommonProps } from '@/types';
import { CardShell } from './CardShell';
import { StatBlock, StatLadder, StatSourceMeta } from './StatBlock';
import {
  EarthQuote,
  StatLabel,
  HorizonLine,
} from '@/components/ui/CardTypography';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { useEarthVoice } from '@/hooks/useEarthVoice';

const accent = ACCENTS.renewables;

export function RenewablesCard({
  active,
  onNext,
  onShare,
  grainLevel,
  voiceTone,
}: CardCommonProps) {
  const quote = useEarthVoice('renewables', voiceTone);

  return (
    <CardShell
      cardId="renewables"
      active={active}
      grainLevel={grainLevel}
      onNext={onNext}
      onShare={onShare}
    >
      <div
        style={{
          position: 'absolute',
          top: 170,
          left: 0,
          right: 0,
          textAlign: 'center',
          zIndex: 10,
          fontFamily: FONTS.MONO,
          fontSize: 10,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: accent.hex,
          fontWeight: 500,
        }}
      >
        · A number going up, for once ·
      </div>

      <StatBlock
        accent={accent}
        underline="more clean energy"
        fontSize={220}
        desktopFontSize="clamp(380px, 40vw, 520px)"
        translateY={-10}
      >
        <span
          style={{ color: accent.hex, fontSize: '0.5em', verticalAlign: 'top' }}
        >
          +
        </span>
        <AnimatedNumber value={32} />
        <span style={{ color: accent.hex, fontSize: '0.5em' }}>%</span>
      </StatBlock>

      <svg
        style={{
          position: 'absolute',
          bottom: 195,
          left: 40,
          right: 40,
          height: 44,
          zIndex: 8,
          pointerEvents: 'none',
        }}
        viewBox="0 0 310 44"
        preserveAspectRatio="none"
      >
        {[6, 9, 11, 14, 19, 24, 28, 33, 38, 44].map((h, i) => (
          <rect
            key={i}
            x={i * 32 + 2}
            y={44 - h}
            width={20}
            height={h}
            fill={accent.hex}
            opacity={0.4 + i * 0.06}
          />
        ))}
      </svg>

      <StatLadder
        accent={accent}
        top={260}
        rows={[
          { left: '— SOLAR', right: '· +42%' },
          { left: '— WIND', right: '· +18%' },
          { left: '— BATTERIES', right: '· +76%' },
          { left: '— EV SALES', right: '· +24%' },
          { left: '— COAL', right: '· −3%', active: true },
        ]}
      />
      <StatSourceMeta
        top={260}
        rows={['SRC: IEA', 'SRC: IRENA']}
        dim={['CAPACITY ADDED', 'YOY · GW']}
      />

      <StatLabel>The energy you chose</StatLabel>
      <HorizonLine accent={accent} />
      <EarthQuote>&ldquo;{quote}&rdquo;</EarthQuote>
    </CardShell>
  );
}
