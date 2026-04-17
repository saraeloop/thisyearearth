"use client";

import { useEffect, useState } from "react";
import { ENDPOINTS } from "@/constants/endpoints";
import type { Co2Data } from "@/types";

const SEED: Co2Data = {
  latest: 429.36,
  latestDate: "2026-04-16",
  ytdHigh: 433.24,
  ytdHighDate: "2026-04-05",
  ytdAvg: 429.63,
  sinceStartDelta: 95.9,
  sparkline: [],
  source: "NOAA GML · Mauna Loa · preliminary daily readings",
};

export function useCo2(): Co2Data {
  const [reading, setReading] = useState<Co2Data>(SEED);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(ENDPOINTS.CO2, { signal: controller.signal });
        if (!res.ok) return;
        const data = (await res.json()) as Co2Data;
        if (!cancelled) setReading(data);
      } catch {
        // keep seed
      }
    })();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  return reading;
}
