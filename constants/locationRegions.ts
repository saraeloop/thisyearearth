import type { Location } from "@/types";

export const LOCATION_REGIONS = [
  "North America",
  "South America",
  "Europe",
  "Africa",
  "Asia",
  "Oceania",
] as const;

export type LocationRegion = (typeof LOCATION_REGIONS)[number];

export const REGION_LOCATIONS: Record<LocationRegion, Location> = {
  "North America": {
    city: "North America",
    region: "North America",
    country: "North America",
    countryCode: "XN",
    lat: 39.83,
    lon: -98.58,
    tz: "UTC-06",
  },
  "South America": {
    city: "South America",
    region: "South America",
    country: "South America",
    countryCode: "XS",
    lat: -15.78,
    lon: -47.93,
    tz: "UTC-03",
  },
  Europe: {
    city: "Europe",
    region: "Europe",
    country: "Europe",
    countryCode: "XE",
    lat: 50.11,
    lon: 8.68,
    tz: "UTC+01",
  },
  Africa: {
    city: "Africa",
    region: "Africa",
    country: "Africa",
    countryCode: "XF",
    lat: 9.08,
    lon: 8.68,
    tz: "UTC+01",
  },
  Asia: {
    city: "Asia",
    region: "Asia",
    country: "Asia",
    countryCode: "XA",
    lat: 28.61,
    lon: 77.21,
    tz: "UTC+05",
  },
  Oceania: {
    city: "Oceania",
    region: "Oceania",
    country: "Oceania",
    countryCode: "XO",
    lat: -25.27,
    lon: 133.78,
    tz: "UTC+09",
  },
};
