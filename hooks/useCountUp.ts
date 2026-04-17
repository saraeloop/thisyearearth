"use client";

import { useEffect, useState } from "react";

type Options = {
  from?: number;
  to: number;
  durationMs?: number;
};

export function useCountUp({ from = 0, to, durationMs = 1500 }: Options) {
  const [value, setValue] = useState(from);

  useEffect(() => {
    if (to === from) {
      setValue(to);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(from + (to - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [from, to, durationMs]);

  return value;
}
