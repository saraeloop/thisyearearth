"use client";

import { useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";

type UseLenisOptions = {
  enabled: boolean;
  lerp?: number;
  duration?: number;
};

export function useLenis({
  enabled,
  lerp = 0.08,
  duration = 1.2,
}: UseLenisOptions) {
  const ref = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const lenis = new Lenis({
      lerp,
      duration,
      smoothWheel: true,
    });
    ref.current = lenis;

    let rafId = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      ref.current = null;
    };
  }, [enabled, lerp, duration]);

  return ref;
}
