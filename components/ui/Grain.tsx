"use client";

import { useEffect, useId, useState } from "react";

type GrainProps = { opacity?: number };

const HAZE_DURATION = 18;
const GRAIN_DURATION = 9;
const HAZE_BASE_FREQUENCY = 0.011;
const GRAIN_BASE_FREQUENCY = 0.88;
let grainEpochMs = 0;
let grainClockReady = false;

function nowMs() {
  return typeof performance === "undefined" ? 0 : performance.now();
}

function getLoopBegin(duration: number) {
  if (!grainEpochMs) grainEpochMs = nowMs();
  const elapsed = (nowMs() - grainEpochMs) / 1000;
  return -(elapsed % duration);
}

function formatBegin(delay: number) {
  return `${delay.toFixed(3)}s`;
}

function useLoopBegin(duration: number) {
  const [begin, setBegin] = useState(() => {
    if (!grainClockReady) return "0s";
    return formatBegin(getLoopBegin(duration));
  });

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      grainClockReady = true;
      setBegin(formatBegin(getLoopBegin(duration)));
    });
    return () => cancelAnimationFrame(raf);
  }, [duration]);

  return begin;
}

export function LargeGrain({ opacity = 0.55 }: GrainProps) {
  const hazeId = useId().replace(/:/g, "");
  const begin = useLoopBegin(HAZE_DURATION);

  return (
    <svg
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        mixBlendMode: "soft-light",
        opacity,
        zIndex: 1,
      }}
    >
      <filter id={hazeId}>
        <feTurbulence
          type="fractalNoise"
          numOctaves={3}
          seed={3}
          baseFrequency={HAZE_BASE_FREQUENCY}
        >
          <animate
            attributeName="baseFrequency"
            values={`${HAZE_BASE_FREQUENCY};0.014;${HAZE_BASE_FREQUENCY}`}
            dur={`${HAZE_DURATION}s`}
            begin={begin}
            repeatCount="indefinite"
          />
        </feTurbulence>
        <feColorMatrix values="0 0 0 0 1  0 0 0 0 0.95  0 0 0 0 0.82  0 0 0 1.2 -0.1" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${hazeId})`} />
    </svg>
  );
}

export function GrainTexture({ opacity = 0.32 }: GrainProps) {
  const grainId = useId().replace(/:/g, "");
  const begin = useLoopBegin(GRAIN_DURATION);

  return (
    <svg
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        mixBlendMode: "overlay",
        opacity,
        zIndex: 2,
      }}
    >
      <filter id={grainId}>
        <feTurbulence
          type="fractalNoise"
          numOctaves={2}
          seed={7}
          stitchTiles="stitch"
          baseFrequency={GRAIN_BASE_FREQUENCY}
        >
          <animate
            attributeName="baseFrequency"
            values={`${GRAIN_BASE_FREQUENCY};0.92;${GRAIN_BASE_FREQUENCY}`}
            dur={`${GRAIN_DURATION}s`}
            begin={begin}
            repeatCount="indefinite"
          />
        </feTurbulence>
        <feColorMatrix values="0 0 0 0 0.9  0 0 0 0 0.88  0 0 0 0 0.82  0 0 0 0.7 0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${grainId})`} />
    </svg>
  );
}
