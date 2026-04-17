"use client";

import type { ReactNode, CSSProperties } from "react";
import { motion } from "framer-motion";
import { PALETTE, FONTS, ACCENTS } from "@/constants/colors";
import { CARD_CHAPTERS, TOTAL_CARDS } from "@/constants/cards";
import type { Accent, CardId } from "@/types";
import { cardEnter } from "@/constants/variants";
import { CardBackground } from "@/components/ui/CardBackground";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { CardMeta } from "@/components/ui/CardMeta";
import { CardChrome } from "@/components/ui/CardChrome";
import { useMediaMin } from "@/hooks/useBreakpoint";

type CardShellProps = {
  cardId: CardId;
  active: number;
  grainLevel: number;
  onNext: () => void;
  onShare: () => void;
  nextLabel?: string;
  hideNext?: boolean;
  clickable?: boolean;
  children: ReactNode;
};

export function CardShell({
  cardId,
  active,
  grainLevel,
  onNext,
  onShare,
  nextLabel = "Next",
  hideNext = false,
  clickable = true,
  children,
}: CardShellProps) {
  const accent: Accent = ACCENTS[cardId];
  const chapter = CARD_CHAPTERS[cardId];
  const isDesktop = useMediaMin(1024);
  const effectiveClickable = clickable && !isDesktop;

  const shellStyle: CSSProperties = {
    width: "100%",
    height: "100%",
    position: "absolute",
    inset: 0,
    overflow: "hidden",
    userSelect: "none",
    fontFamily: FONTS.MONO,
    color: PALETTE.ASH,
    cursor: effectiveClickable ? "pointer" : "default",
  };

  return (
    <motion.div
      key={cardId}
      variants={cardEnter}
      initial="hidden"
      animate="visible"
      exit="hidden"
      data-card={cardId}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      onClick={effectiveClickable ? onNext : undefined}
      style={shellStyle}
    >
      <CardBackground accent={accent} cardId={cardId} grainLevel={grainLevel} />
      <ProgressBar total={TOTAL_CARDS} active={active} accent={accent} />
      <CardMeta active={active} accent={accent} chapter={chapter} />
      {children}
      <CardChrome
        onShare={onShare}
        onNext={onNext}
        label={nextLabel}
        hideNext={hideNext}
      />
    </motion.div>
  );
}
