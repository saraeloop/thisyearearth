import { EXTERNAL } from "@/constants/endpoints";
import type { ClimateData } from "@/types";

const FALLBACK: ClimateData = {
  ppm: 426,
  source: "fallback",
  observedAt: new Date().toISOString(),
};

export async function fetchLatestCo2(): Promise<ClimateData> {
  try {
    const res = await fetch(EXTERNAL.NOAA_CO2, {
      next: { revalidate: 60 * 60 * 6 },
    });
    if (!res.ok) return FALLBACK;
    const text = await res.text();
    const rows = text
      .split("\n")
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => line.trim().split(/\s+/));
    const last = rows[rows.length - 1];
    if (!last || last.length < 4) return FALLBACK;
    const ppm = Number.parseFloat(last[3]);
    if (!Number.isFinite(ppm)) return FALLBACK;
    const [year, month, day] = last;
    return {
      ppm: Math.round(ppm),
      source: "NOAA Mauna Loa",
      observedAt: `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`,
    };
  } catch {
    return FALLBACK;
  }
}
