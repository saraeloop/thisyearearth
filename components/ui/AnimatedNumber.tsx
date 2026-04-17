"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import { useCountUp } from "@/hooks/useCountUp";

type AnimatedNumberProps = {
  value: number;
  decimals?: number;
  format?: "plain" | "grouped";
  durationMs?: number;
};

export function AnimatedNumber({
  value,
  decimals = 0,
  format = "plain",
  durationMs = 1800,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const target = inView ? value : 0;
  const live = useCountUp({ to: target, durationMs });
  const rounded = round(live, decimals);
  return (
    <span ref={ref}>
      {format === "grouped" ? group(rounded) : rounded.toFixed(decimals)}
    </span>
  );
}

function round(v: number, decimals: number) {
  const f = Math.pow(10, decimals);
  return Math.round(v * f) / f;
}

function group(v: number) {
  return v.toLocaleString(undefined, { maximumFractionDigits: 0 });
}
