"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import type { Accent } from "@/types";

type CustomCursorProps = { accent: Accent };

const INTERACTIVE_SELECTOR =
  'button, a, [role="button"], [data-cursor="hover"], textarea, input';

export function CustomCursor({ accent }: CustomCursorProps) {
  const [enabled, setEnabled] = useState(false);
  const [hover, setHover] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 450, damping: 35, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 450, damping: 35, mass: 0.4 });
  const readyRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px) and (pointer: fine)");
    const apply = () => setEnabled(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const onMove = (e: MouseEvent) => {
      if (!readyRef.current) {
        x.jump(e.clientX);
        y.jump(e.clientY);
        readyRef.current = true;
      } else {
        x.set(e.clientX);
        y.set(e.clientY);
      }
      const el = e.target as HTMLElement | null;
      setHover(!!el && !!el.closest(INTERACTIVE_SELECTOR));
    };

    window.addEventListener("mousemove", onMove);
    document.body.classList.add("ew-has-cursor");
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.body.classList.remove("ew-has-cursor");
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        x: springX,
        y: springY,
        pointerEvents: "none",
        zIndex: 9999,
        translateX: "-50%",
        translateY: "-50%",
        mixBlendMode: "difference",
      }}
    >
      <motion.div
        animate={{
          width: hover ? 24 : 8,
          height: hover ? 24 : 8,
          borderWidth: hover ? 1 : 0,
          backgroundColor: hover ? "rgba(0, 0, 0, 0)" : accent.hex,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        style={{
          borderRadius: "50%",
          borderStyle: "solid",
          borderColor: accent.hex,
          boxShadow: `0 0 10px ${accent.glow}`,
        }}
      />
    </motion.div>
  );
}
