'use client';

import { PALETTE, FONTS, ACCENTS } from '@/constants/colors';
import type { CardCommonProps, Location, Pledge } from '@/types';
import { VOICE_QUOTES } from '@/constants/quotes';
import { CardShell } from './CardShell';
import { FinalGlobe } from './FinalGlobe';
import { HorizonLine } from '@/components/ui/CardTypography';
import { usePledgeCount } from '@/hooks/usePledge';

type FinalCardProps = CardCommonProps & {
  userLocation: Location | null;
  userPledge: Pledge | null;
};

const accent = ACCENTS.final;

export function FinalCard({
  active,
  onNext,
  onShare,
  grainLevel,
  voiceTone,
  userLocation,
  userPledge,
}: FinalCardProps) {
  const pledgeCount = usePledgeCount();
  const closingLine = VOICE_QUOTES.final?.[voiceTone] ?? '';

  return (
    <CardShell
      cardId="final"
      active={active}
      grainLevel={grainLevel}
      onNext={onNext}
      onShare={onShare}
      clickable={false}
      nextLabel="Restart"
    >
      <div
        style={{
          position: 'absolute',
          top: 172,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONTS.SERIF,
          fontSize: 50,
          lineHeight: 1,
          color: PALETTE.ASH_FAINT,
          fontStyle: 'italic',
          letterSpacing: '0.1em',
          zIndex: 4,
        }}
      >
        XI · fin
      </div>

      <div
        style={{
          position: 'absolute',
          top: 220,
          left: 32,
          right: 32,
          zIndex: 10,
          fontFamily: FONTS.SERIF,
          fontSize: 28,
          lineHeight: 1.2,
          color: PALETTE.ASH,
          fontStyle: 'italic',
          fontWeight: 400,
          letterSpacing: '-0.02em',
          textAlign: 'center',
          textWrap: 'balance',
          whiteSpace: 'pre-line',
        }}
      >
        {closingLine}
      </div>

      <div className="ew-final-globe">
        <FinalGlobe
          accent={accent}
          locations={userLocation ? [userLocation] : []}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 198,
          left: 0,
          right: 0,
          zIndex: 15,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: FONTS.MONO,
            fontSize: 9,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: PALETTE.ASH_DIMMER,
            marginBottom: 6,
          }}
        >
          Pledges minted · live
        </div>
        <div
          style={{
            fontFamily: FONTS.SERIF,
            fontSize: 38,
            lineHeight: 1,
            color: accent.hex,
            letterSpacing: '-0.02em',
            fontVariantNumeric: 'tabular-nums',
            textShadow: `0 0 30px ${accent.glow}`,
          }}
        >
          {pledgeCount.toLocaleString()}
        </div>
        {userPledge?.minted && (
          <div
            style={{
              marginTop: 6,
              fontFamily: FONTS.MONO,
              fontSize: 9,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: accent.hex,
            }}
          >
            ↳ one of them is yours
          </div>
        )}
      </div>

      <HorizonLine accent={accent} bottom={138} />

      <div
        style={{
          position: 'absolute',
          bottom: 80,
          left: 32,
          right: 32,
          zIndex: 15,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: FONTS.MONO,
            fontSize: 9,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: PALETTE.ASH_DIMMER,
            marginBottom: 8,
          }}
        >
          Sincerely,
        </div>
        <div
          style={{
            fontFamily: FONTS.SERIF,
            fontSize: 28,
            fontStyle: 'italic',
            color: PALETTE.ASH,
            letterSpacing: '-0.01em',
          }}
        >
          Earth
        </div>
        {userLocation && (
          <div
            style={{
              marginTop: 8,
              fontFamily: FONTS.MONO,
              fontSize: 8.5,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: PALETTE.ASH_DIMMER,
            }}
          >
            read from {userLocation.city}
          </div>
        )}
      </div>
    </CardShell>
  );
}
