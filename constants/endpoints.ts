export const ENDPOINTS = {
  CO2: "/api/co2",
  LOCATIONS: "/api/locations",
  PLEDGES: "/api/pledges",
  NOAA_CO2_CSV:
    "https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_daily_mlo.csv",
} as const;

export const EXTERNAL = {
  NOAA_CO2:
    "https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_trend_gl.txt",
  SOLANA_DEVNET: "https://api.devnet.solana.com",
  IP_GEO: "https://ipapi.co/json/",
} as const;
