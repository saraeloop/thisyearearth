"use client";

import { useCallback, useState } from "react";
import { ENDPOINTS } from "@/constants/endpoints";
import type { Location } from "@/types";

type LocationState = {
  loading: boolean;
  error: string | null;
  location: Location | null;
};

const FAKE_LOCATIONS: Location[] = [
  {
    city: "San Francisco",
    region: "North America",
    country: "United States",
    countryCode: "US",
    lat: 37.77,
    lon: -122.42,
    tz: "UTC-08",
  },
  {
    city: "Berlin",
    region: "Europe",
    country: "Germany",
    countryCode: "DE",
    lat: 52.52,
    lon: 13.4,
    tz: "UTC+01",
  },
  {
    city: "Lagos",
    region: "Africa",
    country: "Nigeria",
    countryCode: "NG",
    lat: 6.52,
    lon: 3.37,
    tz: "UTC+01",
  },
  {
    city: "Tokyo",
    region: "Asia",
    country: "Japan",
    countryCode: "JP",
    lat: 35.68,
    lon: 139.69,
    tz: "UTC+09",
  },
];

async function persistLocation(loc: Location) {
  try {
    await fetch(ENDPOINTS.LOCATIONS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        country: loc.country,
        country_code: loc.countryCode,
        lat: loc.lat,
        lng: loc.lon,
      }),
    });
  } catch {
    // Location storage should not block the story.
  }
}

export function useLocation(initial: Location | null = null) {
  const [state, setState] = useState<LocationState>({
    loading: false,
    error: null,
    location: initial,
  });

  const detect = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    await new Promise((r) => setTimeout(r, 1200));
    const pick = FAKE_LOCATIONS[Math.floor(Math.random() * FAKE_LOCATIONS.length)];
    setState({ loading: false, error: null, location: pick });
    void persistLocation(pick);
    return pick;
  }, []);

  const setManual = useCallback((loc: Location) => {
    setState({ loading: false, error: null, location: loc });
    void persistLocation(loc);
  }, []);

  return { ...state, detect, setManual };
}
