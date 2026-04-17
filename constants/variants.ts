import type { Variants, Transition } from "framer-motion";

export const EASE_OUT: Transition["ease"] = [0.2, 0.8, 0.2, 1];

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const sheetSlideUp: Variants = {
  hidden: { y: "100%" },
  visible: { y: 0 },
  exit: { y: "100%" },
};

export const backdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const cardEnter: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const pulseDot: Variants = {
  animate: {
    opacity: [1, 0.4, 1],
    scale: [1, 0.85, 1],
    transition: { duration: 2.4, ease: "easeInOut", repeat: Infinity },
  },
};

export const slowRotate: Variants = {
  animate: {
    rotate: 360,
    transition: { duration: 80, ease: "linear", repeat: Infinity },
  },
};

export const chevronDrift: Variants = {
  animate: {
    x: [0, 3, 0],
    transition: { duration: 2.6, ease: "easeInOut", repeat: Infinity },
  },
};

export const stampRotate: Variants = {
  animate: {
    rotate: 360,
    transition: { duration: 60, ease: "linear", repeat: Infinity },
  },
};
