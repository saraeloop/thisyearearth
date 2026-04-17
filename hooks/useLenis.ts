"use client";

import { useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";

type UseLenisOptions = {
  enabled: boolean;
  lerp?: number;
  duration?: number;
  smoothWheel?: boolean;
};

const expoOut = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

export function useLenis({
  enabled,
  lerp = 0.1,
  duration = 1.25,
  smoothWheel = false,
}: UseLenisOptions) {
  const ref = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const lenis = new Lenis({
      lerp,
      duration,
      smoothWheel,
      easing: expoOut,
      wheelMultiplier: 1,
      touchMultiplier: 1,
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
  }, [enabled, lerp, duration, smoothWheel]);

  return ref;
}
