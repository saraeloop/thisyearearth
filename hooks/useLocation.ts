"use client";

import { useCallback, useState } from "react";
import { ENDPOINTS } from "@/constants/endpoints";
import type { Location } from "@/types";

type LocationState = {
  loading: boolean;
  error: string | null;
  location: Location | null;
};

const SESSION_LOCATION_KEY = "thisyearearth:session-location";
const SAVED_LOCATION_KEY = "thisyearearth:session-location-saved";

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
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SAVED_LOCATION_KEY, locationKey(loc));
    }
  } catch {
    // Location storage should not block the story.
  }
}

function locationKey(loc: Location) {
  return `${loc.countryCode}:${loc.lat.toFixed(4)}:${loc.lon.toFixed(4)}`;
}

function storeSessionLocation(loc: Location) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_LOCATION_KEY, JSON.stringify(loc));
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
    storeSessionLocation(pick);
    void persistLocation(pick);
    return pick;
  }, []);

  const setManual = useCallback((loc: Location) => {
    setState({ loading: false, error: null, location: loc });
    storeSessionLocation(loc);
    void persistLocation(loc);
  }, []);

  return { ...state, detect, setManual };
}
