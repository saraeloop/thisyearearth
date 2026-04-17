"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { CARD_IDS } from "@/constants/cards";
import { ACCENTS } from "@/constants/colors";
import { CARD_BACKGROUNDS } from "@/constants/backgrounds";
import type { CardId, Location, Pledge, Tweaks } from "@/types";
import { ShareSheet } from "@/components/ui/ShareSheet";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { DesktopProgressBar } from "@/components/ui/DesktopProgressBar";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareCardId, setShareCardId] = useState<CardId>("intro");
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [userPledge, setUserPledge] = useState<Pledge | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const lenisRef = useLenis({ enabled: true });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const stops = CARD_IDS.map((_, i) => i / (N - 1));
  const bgStops = CARD_IDS.map((id) => CARD_BACKGROUNDS[id]);
  const backgroundColor = useTransform(scrollYProgress, stops, bgStops);

  useEffect(() => {
    const unsub = scrollYProgress.on("change", (v) => {
      const idx = Math.round(v * (N - 1));
      setActiveIdx((curr) => (curr === idx ? curr : idx));
    });
    return () => unsub();
  }, [scrollYProgress]);

  const cursorAccent = ACCENTS[CARD_IDS[activeIdx]];

  const scrollToIndex = useCallback(
    (idx: number) => {
      const clamped = Math.max(0, Math.min(N - 1, idx));
      const target = clamped * window.innerHeight;
      const lenis = lenisRef.current;
      if (lenis) {
        lenis.scrollTo(target, { duration: 1.4 });
      } else {
        window.scrollTo({ top: target, behavior: "smooth" });
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
    onNext: () => scrollToIndex(idx + 1),
    onShare: () => openShare(CARD_IDS[idx]),
    grainLevel: tweaks.grain,
    voiceTone: tweaks.voice,
  });

  return (
    <motion.div className="ew-desktop-root" style={{ backgroundColor }}>
      <DesktopProgressBar progress={scrollYProgress} />

      <div ref={containerRef} className="ew-desktop-scroll">
        <Section><IntroCard {...sectionProps(0)} /></Section>
        <Section>
          <LocationCard
            {...sectionProps(1)}
            userLocation={userLocation}
            onLocationSet={setUserLocation}
          />
        </Section>
        <Section><TempCard {...sectionProps(2)} /></Section>
        <Section><CO2Card {...sectionProps(3)} /></Section>
        <Section><IceCard {...sectionProps(4)} /></Section>
        <Section><ForestCard {...sectionProps(5)} /></Section>
        <Section>
          <PledgeCard
            {...sectionProps(6)}
            userPledge={userPledge}
            onPledge={setUserPledge}
          />
        </Section>
        <Section><SpeciesCard {...sectionProps(7)} /></Section>
        <Section><PlasticCard {...sectionProps(8)} /></Section>
        <Section><RenewablesCard {...sectionProps(9)} /></Section>
        <Section>
          <FinalCard
            {...sectionProps(10)}
            userLocation={userLocation}
            userPledge={userPledge}
          />
        </Section>
      </div>

      <ShareSheet
        open={shareOpen}
        cardId={shareCardId}
        onClose={() => setShareOpen(false)}
      />

      <CustomCursor accent={cursorAccent} />
    </motion.div>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return <section className="ew-desktop-section">{children}</section>;
}
