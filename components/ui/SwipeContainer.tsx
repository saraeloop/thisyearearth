"use client";

import type { ReactNode } from "react";
import { useSwipe } from "@/hooks/useSwipe";

type SwipeContainerProps = {
  onNext: () => void;
  onPrev: () => void;
  children: ReactNode;
  className?: string;
};

export function SwipeContainer({ onNext, onPrev, children, className }: SwipeContainerProps) {
  const handlers = useSwipe({ onNext, onPrev });
  return (
    <div className={className} {...handlers} style={{ touchAction: "pan-y" }}>
      {children}
    </div>
  );
}
