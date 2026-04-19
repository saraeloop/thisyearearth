'use client';

import { Suspense, useEffect, useState } from 'react';
import { PALETTE, FONTS, ACCENTS } from '@/constants/colors';
import type { CardCommonProps, Location, Pledge } from '@/types';
import { VOICE_QUOTES } from '@/constants/quotes';
import { CardShell } from './CardShell';
import { FinalGlobe } from './FinalGlobe';
import { usePledgeCount } from '@/hooks/usePledge';
import { ENDPOINTS } from '@/constants/endpoints';
import { useMediaMin } from '@/hooks/useBreakpoint';

type FinalCardProps = CardCommonProps & {
  userLocation: Location | null;
  userPledge: Pledge | null;
};

const accent = ACCENTS.final;

function locationId(location: Location) {
  return `${location.countryCode}:${location.lat.toFixed(4)}:${location.lon.toFixed(4)}`;
}

function isDrawableLocation(location: Location) {
  return (
    Number.isFinite(location.lat) &&
    Number.isFinite(location.lon) &&
    !(location.lat === 0 && location.lon === 0)
  );
}

type LocationRow = {
  country: string;
  countryCode: string;
  lat: number | string | null;
  lng: number | string | null;
};

function rowToLocation(row: LocationRow): Location | null {
  const lat = row.lat === null ? NaN : Number(row.lat);
  const lon = row.lng === null ? NaN : Number(row.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (lat === 0 && lon === 0) return null;
  return {
    city: row.country,
    region: row.country,
    country: row.country,
    countryCode: row.countryCode,
    lat,
    lon,
    tz: 'UTC',
  };
}

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
  const [globeLocations, setGlobeLocations] = useState<Location[]>([]);
  const isDesktop = useMediaMin(1024);
  const closingLine = VOICE_QUOTES.final?.[voiceTone] ?? '';

  useEffect(() => {
    let cancelled = false;

    const loadLocations = async () => {
      try {
        const res = await fetch(ENDPOINTS.LOCATIONS);
        if (!res.ok) return;
        const data = (await res.json()) as { locations: LocationRow[] };
        if (cancelled) return;
        setGlobeLocations(data.locations.map(rowToLocation).filter((loc): loc is Location => loc !== null));
      } catch {
        // The final card can still render without live location points.
      }
    };

    void loadLocations();
    return () => {
      cancelled = true;
    };
  }, []);

  const finalGlobeLocations = userLocation
    ? [
        userLocation,
        ...globeLocations.filter((location) => locationId(location) !== locationId(userLocation)),
      ].filter(isDrawableLocation)
    : globeLocations.filter(isDrawableLocation);

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
          top: isDesktop ? 112 : 130,
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
          top: isDesktop ? 160 : '190px',
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
        <Suspense fallback={null}>
          <FinalGlobe
            accent={accent}
            locations={finalGlobeLocations}
          />
        </Suspense>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: isDesktop
            ? 168
            : 'calc(env(safe-area-inset-bottom, 0px) + 168px)',
          left: 0,
          right: 0,
          zIndex: 15,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: FONTS.MONO,
            fontSize: 10,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: PALETTE.ASH_DIM,
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

      <div
        style={{
          position: 'absolute',
          bottom: isDesktop
            ? 56
            : 'calc(env(safe-area-inset-bottom, 0px) + 56px)',
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
            written from {userLocation.city}
          </div>
        )}
      </div>
    </CardShell>
  );
}
