"use client";

import { useEffect, useState } from "react";

type UseCountUpOptions = {
  from?: number;
  to: number;
  durationMs?: number;
  overshoot?: number;
};

export function useCountUp({
  from = 0,
  to,
  durationMs = 1800,
  overshoot = 0.04,
}: UseCountUpOptions) {
  const [value, setValue] = useState(from);

  useEffect(() => {
    let raf = 0;

    if (to === from) {
      raf = requestAnimationFrame(() => setValue(to));
      return () => cancelAnimationFrame(raf);
    }

    const peak = to + (to - from) * overshoot;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const v = springPhase(t, from, peak, to);
      setValue(v);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setValue(to);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [from, to, durationMs, overshoot]);

  return value;
}

function springPhase(t: number, from: number, peak: number, target: number) {
  const riseCut = 0.62;
  if (t <= riseCut) {
    const r = t / riseCut;
    const eased = 1 - Math.pow(1 - r, 3);
    return from + (peak - from) * eased;
  }
  const r = (t - riseCut) / (1 - riseCut);
  const damped = Math.cos(r * Math.PI * 1.5) * Math.exp(-r * 3);
  return target + (peak - target) * damped;
}
