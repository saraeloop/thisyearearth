"use client";

import { useEffect, useState } from "react";

export function useMediaMin(minWidthPx: number): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${minWidthPx}px)`);
    const apply = () => setMatches(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [minWidthPx]);

  return matches;
}
