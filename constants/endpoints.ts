export const ENDPOINTS = {
  CO2: "/api/co2",
  EARTH_VOICE: "/api/earth-voice",
  PLEDGES: "/api/pledges",
  NOAA_CO2_CSV:
    "https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_daily_mlo.csv",
} as const;

export const EXTERNAL = {
  NOAA_CO2:
    "https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_trend_gl.txt",
  GEMINI_BASE:
    "https://generativelanguage.googleapis.com/v1beta/models",
  GEMINI_MODEL: "gemini-2.5-flash",
  SOLANA_DEVNET: "https://api.devnet.solana.com",
  IP_GEO: "https://ipapi.co/json/",
} as const;
