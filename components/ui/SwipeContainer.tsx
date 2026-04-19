"use client";

import type { CSSProperties, ReactNode } from "react";
import { useSwipe } from "@/hooks/useSwipe";

type SwipeContainerProps = {
  onNext: () => void;
  onPrev: () => void;
  children: ReactNode;
  className?: string;
  touchAction?: CSSProperties["touchAction"];
};

export function SwipeContainer({
  onNext,
  onPrev,
  children,
  className,
  touchAction = "pan-y",
}: SwipeContainerProps) {
  const handlers = useSwipe({ onNext, onPrev });
  return (
    <div className={className} {...handlers} style={{ touchAction }}>
      {children}
    </div>
  );
}
