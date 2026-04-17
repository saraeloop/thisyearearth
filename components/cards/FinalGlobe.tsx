"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import * as THREE from "three";
import type { GlobeMethods } from "react-globe.gl";
import type { Accent, Location } from "@/types";
import { useMediaMin } from "@/hooks/useBreakpoint";

const Globe = dynamic(() => import("react-globe.gl"), {
  ssr: false,
  loading: () => null,
});

type FinalGlobeProps = {
  accent: Accent;
  locations: Location[];
};

type Point = {
  lat: number;
  lng: number;
  size: number;
  color: string;
};

const SEED_COUNT = 140;
const SEED_POINTS: Point[] = Array.from({ length: SEED_COUNT }).map(() => ({
  lat: (Math.random() * 2 - 1) * 68,
  lng: (Math.random() * 2 - 1) * 180,
  size: 0.2 + Math.random() * 0.3,
  color: "#E6D6BE",
}));

export function FinalGlobe({ accent, locations }: FinalGlobeProps) {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [ready, setReady] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const isDesktop = useMediaMin(1024);

  useEffect(() => {
    if (!boxRef.current) return;
    const el = boxRef.current;

    const apply = (w: number, h: number) => {
      const minSize = isDesktop ? 320 : 360;
      const nw = Math.max(minSize, Math.round(w));
      const nh = Math.max(minSize, Math.round(h));
      setSize((prev) => (prev && prev.w === nw && prev.h === nh ? prev : { w: nw, h: nh }));
    };

    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect) apply(rect.width, rect.height);
    });
    ro.observe(el);

    const rect = el.getBoundingClientRect();
    apply(rect.width, rect.height);

    return () => ro.disconnect();
  }, [isDesktop]);

  useEffect(() => {
    if (!ready) return;
    const instance = globeRef.current;
    if (!instance) return;
    const ctrl = instance.controls() as {
      autoRotate: boolean;
      autoRotateSpeed: number;
      enableZoom: boolean;
    };
    ctrl.autoRotate = true;
    ctrl.autoRotateSpeed = 0.3;
    ctrl.enableZoom = false;
  }, [ready]);

  const points = useMemo<Point[]>(() => {
    const user: Point[] = locations
      .filter((l) => Number.isFinite(l.lat) && Number.isFinite(l.lon))
      .map((l) => ({
        lat: l.lat,
        lng: l.lon,
        size: 0.6,
        color: accent.hex,
      }));
    return user.length > 0 ? [...SEED_POINTS, ...user] : SEED_POINTS;
  }, [locations, accent.hex]);

  const material = useMemo(
    () =>
      new THREE.MeshPhongMaterial({
        color: "#0a0e1a",
        emissive: "#050608",
        shininess: 4,
        transparent: true,
        opacity: 0.94,
      }),
    [],
  );

  const boxStyle: CSSProperties = isDesktop
    ? {
        position: "absolute",
        inset: 0,
        zIndex: 2,
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }
    : {
        position: "absolute",
        top: "24dvh",
        left: "50%",
        width: "min(122vw, 460px)",
        height: "min(122vw, 460px)",
        transform: "translateX(-50%)",
        zIndex: 2,
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      };

  return (
    <div
      ref={boxRef}
      style={boxStyle}
    >
      {size && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0 }}
          transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <Globe
            ref={globeRef}
            width={size.w}
            height={size.h}
            backgroundColor="rgba(0,0,0,0)"
            showAtmosphere
            atmosphereColor={accent.hex}
            atmosphereAltitude={0.2}
            showGlobe
            globeMaterial={material}
            pointsData={points}
            pointLat="lat"
            pointLng="lng"
            pointAltitude={0.01}
            pointRadius="size"
            pointColor="color"
            pointsMerge
            enablePointerInteraction={false}
            animateIn={false}
            onGlobeReady={() => setReady(true)}
          />
        </motion.div>
      )}
    </div>
  );
}
