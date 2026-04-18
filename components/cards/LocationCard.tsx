'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { PALETTE, FONTS, ACCENTS } from '@/constants/colors';
import type { CardCommonProps, Location } from '@/types';
import { CardShell } from './CardShell';
import { Globe } from './Globe';
import { useLocation } from '@/hooks/useLocation';
import { useMediaMin } from '@/hooks/useBreakpoint';
import { getLocationPhraseParagraphs } from '@/constants/locationPhrases';
import { LOCATION_REGIONS, REGION_LOCATIONS } from '@/constants/locationRegions';

type LocationCardProps = CardCommonProps & {
  userLocation: Location | null;
  onLocationSet: (loc: Location) => void;
};

const accent = ACCENTS.location;

export function LocationCard({
  active,
  onNext,
  onShare,
  grainLevel,
  userLocation,
  onLocationSet,
}: LocationCardProps) {
  const locState = useLocation(userLocation);
  const detected = locState.location;
  const detecting = locState.loading;
  const [picking, setPicking] = useState(false);
  const isDesktop = useMediaMin(1024);
  const locationPhraseParagraphs = useMemo(
    () => (detected ? getLocationPhraseParagraphs(detected) : []),
    [detected],
  );

  const handleDetect = async () => {
    const loc = await locState.detect();
    onLocationSet(loc);
  };

  const handlePick = (region: string) => {
    const loc = REGION_LOCATIONS[region as keyof typeof REGION_LOCATIONS];
    if (!loc) return;
    locState.setManual(loc);
    onLocationSet(loc);
  };

  return (
    <CardShell
      cardId="location"
      active={active}
      grainLevel={grainLevel}
      onNext={onNext}
      onShare={onShare}
      clickable={false}
      nextLabel={detected ? 'Next' : 'Skip'}
    >
      <Globe accent={accent} active={!!detected} />

      <div
        style={{
          position: 'absolute',
          top: 200,
          left: 32,
          right: 32,
          textAlign: 'center',
          zIndex: 15,
        }}
      >
        {!detected ?
          <>
            <div
              style={{
                fontFamily: FONTS.MONO,
                fontSize: 10,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: PALETTE.ASH_DIM,
                marginBottom: 18,
              }}
            >
              Earth asks
            </div>
            <div
              style={{
                fontFamily: FONTS.SERIF,
                fontSize: 42,
                lineHeight: 1.1,
                fontStyle: 'italic',
                color: PALETTE.ASH,
                letterSpacing: '-0.02em',
                textWrap: 'balance',
              }}
            >
              Where are
              <br />
              you writing from?
            </div>
          </>
        : <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div
              style={{
                fontFamily: FONTS.MONO,
                fontSize: 10,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: accent.hex,
                marginBottom: 18,
              }}
            >
              · Coordinates received ·
            </div>
            <div
              style={{
                fontFamily: FONTS.SERIF,
                fontSize: 44,
                lineHeight: 1.05,
                color: PALETTE.ASH,
                letterSpacing: '-0.02em',
              }}
            >
              {detected.city}
            </div>
            <div
              style={{
                fontFamily: FONTS.MONO,
                fontSize: 11,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: PALETTE.ASH_DIM,
                marginTop: 14,
              }}
            >
              {detected.lat.toFixed(2)}° · {detected.lon.toFixed(2)}° ·{' '}
              {detected.tz}
            </div>
            <div
              style={{
                marginTop: 32,
                fontFamily: FONTS.SERIF,
                fontSize: 18,
                fontStyle: 'italic',
                color: PALETTE.ASH,
                lineHeight: 1.4,
                textWrap: 'balance',
              }}
            >
              {locationPhraseParagraphs.map((paragraph, index) => (
                <span
                  key={paragraph}
                  style={{
                    display: 'block',
                    marginTop: index === 0 ? 0 : 8,
                  }}
                >
                  {index === 0 ? '\u201c' : ''}
                  {paragraph}
                  {index === locationPhraseParagraphs.length - 1 ? '\u201d' : ''}
                </span>
              ))}
            </div>
          </motion.div>
        }
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 110,
          left: isDesktop ? '50%' : 32,
          right: isDesktop ? 'auto' : 32,
          width: isDesktop ? 'min(480px, calc(100vw - 96px))' : 'auto',
          transform: isDesktop ? 'translateX(-50%)' : undefined,
          zIndex: 15,
        }}
      >
        {!detected && !picking && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDetect();
              }}
              disabled={detecting}
              style={{
                all: 'unset',
                cursor: detecting ? 'wait' : 'pointer',
                textAlign: 'center',
                padding: '14px',
                borderRadius: 99,
                background: `${accent.hex}28`,
                border: `1px solid ${accent.hex}80`,
                fontFamily: FONTS.MONO,
                fontSize: 10.5,
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                color: PALETTE.ASH,
                fontWeight: 500,
                backdropFilter: 'blur(8px)',
              }}
            >
              {detecting ? 'Triangulating…' : 'Use my location'}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPicking(true);
              }}
              style={{
                all: 'unset',
                cursor: 'pointer',
                textAlign: 'center',
                padding: '12px',
                borderRadius: 99,
                border: '1px solid rgba(230,214,190,0.2)',
                fontFamily: FONTS.MONO,
                fontSize: 10,
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                color: PALETTE.ASH_DIM,
                fontWeight: 500,
              }}
            >
              Pick manually
            </button>
          </div>
        )}

        {!detected && picking && (
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}
          >
            {LOCATION_REGIONS.map((r) => (
              <button
                key={r}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePick(r);
                }}
                style={{
                  all: 'unset',
                  cursor: 'pointer',
                  textAlign: 'center',
                  padding: '11px 8px',
                  borderRadius: 10,
                  border: '1px solid rgba(230,214,190,0.18)',
                  background: 'rgba(230,214,190,0.03)',
                  fontFamily: FONTS.MONO,
                  fontSize: 9,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: PALETTE.ASH_DIM,
                  fontWeight: 500,
                }}
              >
                {r}
              </button>
            ))}
          </div>
        )}

        {detected && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            style={{
              all: 'unset',
              cursor: 'pointer',
              textAlign: 'center',
              display: 'block',
              margin: '0 auto',
              padding: '14px 28px',
              borderRadius: 99,
              background: `${accent.hex}30`,
              border: `1px solid ${accent.hex}80`,
              fontFamily: FONTS.MONO,
              fontSize: 10.5,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: PALETTE.ASH,
              fontWeight: 500,
              backdropFilter: 'blur(8px)',
            }}
          >
            Continue →
          </motion.button>
        )}
      </div>
    </CardShell>
  );
}
