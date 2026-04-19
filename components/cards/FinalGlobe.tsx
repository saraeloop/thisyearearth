"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import type { GlobeMethods } from "react-globe.gl";
import type { Accent, Location } from "@/types";
import { useMediaMin } from "@/hooks/useBreakpoint";

const Globe = dynamic(() => import("react-globe.gl"), {
  ssr: false,
  loading: () => null,
});

const EARTH_IMAGE_URL = "/earth-blue-marble.jpg";
const EARTH_BUMP_URL = "/earth-topology.png";

type FinalGlobeProps = {
  accent: Accent;
  locations: Location[];
};

type Point = {
  id: string;
  lat: number;
  lng: number;
  radius: number;
  altitude: number;
  color: string;
};

export function FinalGlobe({ accent, locations }: FinalGlobeProps) {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [ready, setReady] = useState(false);
  const [dragging, setDragging] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const isDesktop = useMediaMin(1024);

  useEffect(() => {
    if (!boxRef.current) return;
    const el = boxRef.current;

    const apply = (w: number, h: number) => {
      const minSize = isDesktop ? 320 : 360;
      const scale = isDesktop ? 0.91 : 1;
      const nw = Math.max(minSize, Math.round(w * scale));
      const nh = Math.max(minSize, Math.round(h * scale));
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
    const enableRotation = () => {
      const instance = globeRef.current;
      if (!instance) return;
      instance.resumeAnimation();
      const ctrl = instance.controls() as {
        autoRotate: boolean;
        autoRotateSpeed: number;
        enableDamping: boolean;
        enableRotate: boolean;
        enablePan: boolean;
        enableZoom: boolean;
      };
      ctrl.autoRotate = true;
      ctrl.autoRotateSpeed = 0.35;
      ctrl.enableDamping = true;
      ctrl.enableRotate = true;
      ctrl.enablePan = false;
      ctrl.enableZoom = false;
    };

    enableRotation();
    const id = window.setInterval(enableRotation, 1000);
    return () => window.clearInterval(id);
  }, [ready]);

  const points = useMemo<Point[]>(() => {
    return locations
      .filter((l) => Number.isFinite(l.lat) && Number.isFinite(l.lon))
      .map((l, i) => ({
        id: `${l.countryCode}-${l.lat.toFixed(4)}-${l.lon.toFixed(4)}-${i}`,
        lat: l.lat,
        lng: l.lon,
        radius: i === 0 ? 0.28 : 0.2,
        altitude: i === 0 ? 0.018 : 0.012,
        color: i === 0 ? accent.hex : "#F6EFDE",
      }));
  }, [locations, accent.hex]);

  const boxStyle: CSSProperties = isDesktop
    ? {
        position: "absolute",
        inset: 0,
        transform: "translateY(6dvh)",
        zIndex: 2,
        pointerEvents: "auto",
        cursor: dragging ? "grabbing" : "grab",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        touchAction: "none",
      }
    : {
        position: "absolute",
        top: "28dvh",
        left: "50%",
        width: "min(122vw, 460px)",
        height: "min(122vw, 460px)",
        transform: "translateX(-50%)",
        zIndex: 2,
        pointerEvents: "auto",
        cursor: dragging ? "grabbing" : "grab",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        touchAction: "none",
      };

  return (
    <div
      ref={boxRef}
      onPointerDown={(e) => {
        e.stopPropagation();
        setDragging(true);
      }}
      onPointerMove={(e) => e.stopPropagation()}
      onPointerUp={(e) => {
        e.stopPropagation();
        setDragging(false);
      }}
      onPointerCancel={(e) => {
        e.stopPropagation();
        setDragging(false);
      }}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
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
            globeImageUrl={EARTH_IMAGE_URL}
            bumpImageUrl={EARTH_BUMP_URL}
            pointsData={points}
            pointLat="lat"
            pointLng="lng"
            pointAltitude="altitude"
            pointRadius="radius"
            pointColor="color"
            pointResolution={10}
            pointsMerge
            enablePointerInteraction
            animateIn={false}
            onGlobeReady={() => setReady(true)}
          />
        </motion.div>
      )}
    </div>
  );
}
