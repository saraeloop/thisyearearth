"use client";

import { useEffect, useState } from "react";
import { ENDPOINTS } from "@/constants/endpoints";
import type { ClimateData } from "@/types";

const SEED: ClimateData = {
  ppm: 426,
  source: "seed",
  observedAt: "2026-04-17",
};

export function useCo2(): ClimateData {
  const [reading, setReading] = useState<ClimateData>(SEED);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(ENDPOINTS.CO2, { signal: controller.signal });
        if (!res.ok) return;
        const data = (await res.json()) as ClimateData;
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
