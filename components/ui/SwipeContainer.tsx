"use client";

import type { CSSProperties, ReactNode } from "react";
import { useSwipe } from "@/hooks/useSwipe";

type SwipeContainerProps = {
  onNext: () => void;
  onPrev: () => void;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export function SwipeContainer({ onNext, onPrev, children, className, style }: SwipeContainerProps) {
  const handlers = useSwipe({ onNext, onPrev });
  return (
    <div className={className} {...handlers} style={{ ...style, touchAction: "pan-y" }}>
      {children}
    </div>
  );
}
