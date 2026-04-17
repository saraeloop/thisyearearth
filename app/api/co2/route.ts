import { NextResponse } from "next/server";
import { ENDPOINTS } from "@/constants/endpoints";
import type { Co2Data } from "@/types";

const REPORT_YEAR = 2026;
const SOURCE = "NOAA GML · Mauna Loa · preliminary daily readings";

type Co2Reading = {
  date: string;
  year: number;
  ppm: number;
};

const FALLBACK: Co2Data = {
  latest: 429.36,
  latestDate: "2026-04-16",
  ytdHigh: 433.24,
  ytdHighDate: "2026-04-05",
  ytdAvg: 429.63,
  sinceStartDelta: 95.9,
  sparkline: [],
  source: SOURCE,
};

function roundPpm(value: number) {
  return Math.round(value * 100) / 100;
}

function toIsoDate(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseNoaaDailyCsv(csv: string): Co2Reading[] {
  return csv
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && !line.toLowerCase().startsWith("year"))
    .map((line) => line.split(",").map((cell) => cell.trim()))
    .flatMap((row) => {
      if (row.length < 5) return [];

      const year = Number.parseInt(row[0], 10);
      const month = Number.parseInt(row[1], 10);
      const day = Number.parseInt(row[2], 10);
      const ppm = Number.parseFloat(row[4]);

      if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
        return [];
      }

      if (!Number.isFinite(ppm) || ppm < 0) return [];

      return [{ date: toIsoDate(year, month, day), year, ppm }];
    });
}

function buildCo2Response(csv: string): Co2Data {
  const readings = parseNoaaDailyCsv(csv);
  const latest = readings.at(-1);
  const first = readings[0];
  const yearReadings = readings.filter((reading) => reading.year === REPORT_YEAR);

  if (!latest || !first || yearReadings.length === 0) return FALLBACK;

  const ytdHigh = yearReadings.reduce((high, reading) =>
    reading.ppm > high.ppm ? reading : high,
  );
  const ytdTotal = yearReadings.reduce((total, reading) => total + reading.ppm, 0);

  return {
    latest: roundPpm(latest.ppm),
    latestDate: latest.date,
    ytdHigh: roundPpm(ytdHigh.ppm),
    ytdHighDate: ytdHigh.date,
    ytdAvg: roundPpm(ytdTotal / yearReadings.length),
    sinceStartDelta: roundPpm(latest.ppm - first.ppm),
    sparkline: yearReadings.map((reading) => roundPpm(reading.ppm)),
    source: SOURCE,
  };
}

export async function GET() {
  try {
    const response = await fetch(ENDPOINTS.NOAA_CO2_CSV, {
      next: { revalidate: 86400 },
    });

    if (!response.ok) return NextResponse.json(FALLBACK);

    const csv = await response.text();
    return NextResponse.json(buildCo2Response(csv));
  } catch {
    return NextResponse.json(FALLBACK);
  }
}
