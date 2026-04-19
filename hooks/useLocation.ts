"use client";

import { useCallback, useState } from "react";
import { ENDPOINTS } from "@/constants/endpoints";
import { resolveBrowserLocation } from "@/lib/location";
import type { Location } from "@/types";

type LocationState = {
  loading: boolean;
  error: string | null;
  location: Location | null;
};

const SESSION_LOCATION_KEY = "thisyearearth:session-location";
const SAVED_LOCATION_KEY = "thisyearearth:session-location-saved";
const GEOLOCATION_TIMEOUT_MS = 12_000;

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

function isPermissionDenied(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 1
  );
}

export function useLocation(initial: Location | null = null) {
  const [state, setState] = useState<LocationState>({
    loading: false,
    error: null,
    location: initial,
  });

  const detect = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));

    if (!navigator.geolocation) {
      const error = "Your browser cannot read location. Pick manually instead.";
      setState((s) => ({ ...s, loading: false, error }));
      throw new Error(error);
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          maximumAge: 60_000,
          timeout: GEOLOCATION_TIMEOUT_MS,
        });
      });
      const loc = await resolveBrowserLocation(position.coords);
      setState({ loading: false, error: null, location: loc });
      storeSessionLocation(loc);
      void persistLocation(loc);
      return loc;
    } catch (cause) {
      const error =
        isPermissionDenied(cause)
          ? "Location permission was denied. Pick manually instead."
          : "Could not read your location. Pick manually instead.";
      setState((s) => ({ ...s, loading: false, error }));
      throw new Error(error);
    }
  }, []);

  const setManual = useCallback((loc: Location) => {
    setState({ loading: false, error: null, location: loc });
    storeSessionLocation(loc);
    void persistLocation(loc);
  }, []);

  return { ...state, detect, setManual };
}
