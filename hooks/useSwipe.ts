"use client";

import { useCallback, useRef } from "react";

type Options = {
  onNext: () => void;
  onPrev: () => void;
  threshold?: number;
  timeout?: number;
};

export function useSwipe({
  onNext,
  onPrev,
  threshold = 50,
  timeout = 500,
}: Options) {
  const start = useRef({ x: 0, y: 0, t: 0 });

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    start.current = { x: t.clientX, y: t.clientY, t: Date.now() };
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const t = e.changedTouches[0];
      const dx = t.clientX - start.current.x;
      const dy = t.clientY - start.current.y;
      const dt = Date.now() - start.current.t;
      if (Math.abs(dx) > threshold && Math.abs(dx) > Math.abs(dy) && dt < timeout) {
        if (dx < 0) onNext();
        else onPrev();
      }
    },
    [onNext, onPrev, threshold, timeout],
  );

  return { onTouchStart, onTouchEnd };
}
