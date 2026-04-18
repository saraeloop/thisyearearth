"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { CARD_IDS } from "@/constants/cards";
import { ACCENTS } from "@/constants/colors";
import { CARD_BACKGROUNDS } from "@/constants/backgrounds";
import type { CardId, Location, Pledge, Tweaks } from "@/types";
import { ShareSheet } from "@/components/ui/ShareSheet";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { DesktopProgressBar } from "@/components/ui/DesktopProgressBar";
import { isEditableTarget } from "@/components/ui/dom";
import { IntroCard } from "@/components/cards/IntroCard";
import { LocationCard } from "@/components/cards/LocationCard";
import { TempCard } from "@/components/cards/TempCard";
import { CO2Card } from "@/components/cards/CO2Card";
import { IceCard } from "@/components/cards/IceCard";
import { ForestCard } from "@/components/cards/ForestCard";
import { PledgeCard } from "@/components/cards/PledgeCard";
import { SpeciesCard } from "@/components/cards/SpeciesCard";
import { PlasticCard } from "@/components/cards/PlasticCard";
import { RenewablesCard } from "@/components/cards/RenewablesCard";
import { FinalCard } from "@/components/cards/FinalCard";
import { useLenis } from "@/hooks/useLenis";

type DesktopStoryProps = { tweaks: Tweaks };

const N = CARD_IDS.length;

export function DesktopStory({ tweaks }: DesktopStoryProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const [shareCardId, setShareCardId] = useState<CardId>("intro");
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [userPledge, setUserPledge] = useState<Pledge | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const lenisRef = useLenis({ enabled: true, smoothWheel: true });

  const scrollYProgress = useMotionValue(0);

  const stops = CARD_IDS.map((_, i) => i / (N - 1));
  const bgStops = CARD_IDS.map((id) => CARD_BACKGROUNDS[id]);
  const backgroundColor = useTransform(scrollYProgress, stops, bgStops);

  useEffect(() => {
    let raf = 0;

    const updateProgress = () => {
      raf = 0;
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const v = Math.max(0, Math.min(1, window.scrollY / maxScroll));
      scrollYProgress.set(v);
      const idx = Math.max(0, Math.min(N - 1, Math.round(v * (N - 1))));
      setActiveIdx((curr) => (curr === idx ? curr : idx));
    };

    const scheduleUpdate = () => {
      if (raf) return;
      raf = requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [scrollYProgress]);

  const cursorAccent = ACCENTS[CARD_IDS[activeIdx]];

  const scrollToIndex = useCallback(
    (idx: number, immediate = false) => {
      const clamped = Math.max(0, Math.min(N - 1, idx));
      const target = clamped * window.innerHeight;
      const lenis = lenisRef.current;
      if (lenis) {
        lenis.scrollTo(target, immediate ? { immediate: true } : { duration: 1.25 });
      } else {
        window.scrollTo({ top: target, behavior: immediate ? "instant" : "auto" });
      }
    },
    [lenisRef],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (shareOpen) {
        if (e.key === "Escape") setShareOpen(false);
        return;
      }
      if (isEditableTarget(e.target)) return;
      if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        scrollToIndex(activeIdx + 1);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        scrollToIndex(activeIdx - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIdx, scrollToIndex, shareOpen]);

  const openShare = useCallback((id: CardId) => {
    setShareCardId(id);
    setShareOpen(true);
  }, []);

  const sectionProps = (idx: number) => ({
    active: idx,
    onNext: () => scrollToIndex(idx >= N - 1 ? 0 : idx + 1, idx >= N - 1),
    onShare: () => openShare(CARD_IDS[idx]),
    grainLevel: tweaks.grain,
    voiceTone: tweaks.voice,
  });

  return (
    <div className="ew-desktop-root">
      <div
        className="ew-desktop-track"
        style={{ height: `${N * 100}dvh`, position: "relative" }}
      />

      <motion.div className="ew-desktop-stage" style={{ backgroundColor }}>
        <AnimatePresence initial={false} mode="sync">
          {renderCard(activeIdx, {
            sectionProps,
            userLocation,
            setUserLocation,
            userPledge,
            setUserPledge,
          })}
        </AnimatePresence>

        <ShareSheet
          open={shareOpen}
          cardId={shareCardId}
          pledge={userPledge}
          onClose={() => setShareOpen(false)}
        />
      </motion.div>

      <DesktopProgressBar progress={scrollYProgress} />
      <CustomCursor accent={cursorAccent} />
    </div>
  );
}

type RenderCardContext = {
  sectionProps: (idx: number) => {
    active: number;
    onNext: () => void;
    onShare: () => void;
    grainLevel: number;
    voiceTone: Tweaks["voice"];
  };
  userLocation: Location | null;
  setUserLocation: (location: Location) => void;
  userPledge: Pledge | null;
  setUserPledge: (pledge: Pledge) => void;
};

function renderCard(idx: number, ctx: RenderCardContext) {
  const props = ctx.sectionProps(idx);
  const key = CARD_IDS[idx];

  if (idx === 0) return <IntroCard key={key} {...props} />;
  if (idx === 1) {
    return (
      <LocationCard
        key={key}
        {...props}
        userLocation={ctx.userLocation}
        onLocationSet={ctx.setUserLocation}
      />
    );
  }
  if (idx === 2) return <TempCard key={key} {...props} />;
  if (idx === 3) return <CO2Card key={key} {...props} />;
  if (idx === 4) return <IceCard key={key} {...props} />;
  if (idx === 5) return <ForestCard key={key} {...props} />;
  if (idx === 6) {
    return (
      <PledgeCard
        key={key}
        {...props}
        userPledge={ctx.userPledge}
        onPledge={ctx.setUserPledge}
      />
    );
  }
  if (idx === 7) return <SpeciesCard key={key} {...props} />;
  if (idx === 8) return <PlasticCard key={key} {...props} />;
  if (idx === 9) return <RenewablesCard key={key} {...props} />;

  return (
    <FinalCard
      key={key}
      {...props}
      userLocation={ctx.userLocation}
      userPledge={ctx.userPledge}
    />
  );
}
