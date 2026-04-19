import type { Location } from "@/types";

type BrowserCoordinates = {
  latitude: number;
  longitude: number;
};

type ReverseGeocodeResponse = {
  city?: string;
  locality?: string;
  principalSubdivision?: string;
  countryName?: string;
  countryCode?: string;
  continent?: string;
};

const REVERSE_GEOCODE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";
const LOOKUP_TIMEOUT_MS = 6_000;

function clean(value: string | null | undefined) {
  return value?.trim() || "";
}

function normalizeCountryCode(value: string | null | undefined) {
  const code = clean(value).toUpperCase();
  return /^[A-Z]{2}$/.test(code) ? code : "XX";
}

function roundCoordinate(value: number) {
  return Number(value.toFixed(5));
}

function localUtcOffset() {
  const offsetMinutes = -new Date().getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const hours = Math.floor(Math.abs(offsetMinutes) / 60);
  const minutes = Math.abs(offsetMinutes) % 60;
  return `UTC${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function regionFromReverseGeocode(data: ReverseGeocodeResponse | null) {
  const continent = clean(data?.continent);
  if (continent) return continent;
  return clean(data?.principalSubdivision) || clean(data?.countryName) || "Earth";
}

function locationFromCoordinates(
  coords: BrowserCoordinates,
  geocode: ReverseGeocodeResponse | null,
): Location {
  const country = clean(geocode?.countryName) || "Earth";
  const countryCode = normalizeCountryCode(geocode?.countryCode);
  const city =
    clean(geocode?.city) ||
    clean(geocode?.locality) ||
    clean(geocode?.principalSubdivision) ||
    country;

  return {
    city,
    region: regionFromReverseGeocode(geocode),
    country,
    countryCode,
    lat: roundCoordinate(coords.latitude),
    lon: roundCoordinate(coords.longitude),
    tz: localUtcOffset(),
  };
}

async function reverseGeocode(coords: BrowserCoordinates) {
  const url = new URL(REVERSE_GEOCODE_URL);
  url.searchParams.set("latitude", String(coords.latitude));
  url.searchParams.set("longitude", String(coords.longitude));
  url.searchParams.set("localityLanguage", "en");

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    return (await res.json()) as ReverseGeocodeResponse;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function resolveBrowserLocation(coords: BrowserCoordinates) {
  const geocode = await reverseGeocode(coords);
  return locationFromCoordinates(coords, geocode);
}
