"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ACTIVE_STORAGE_KEY,
  CARD_IDS,
  INTERACTIVE_CARD_IDS,
  TOTAL_CARDS,
} from "@/constants/cards";
import { CARD_BACKGROUNDS } from "@/constants/backgrounds";
import { SITE } from "@/config/site";
import type { CardId, Location, Pledge, Tweaks } from "@/types";
import { SwipeContainer } from "@/components/ui/SwipeContainer";
import { ShareSheet } from "@/components/ui/ShareSheet";
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

type MobileStoryProps = { tweaks: Tweaks };

function clampIndex(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(Math.max(Math.trunc(n), 0), TOTAL_CARDS - 1);
}

export function MobileStory({ tweaks }: MobileStoryProps) {
  const [active, setActive] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [userPledge, setUserPledge] = useState<Pledge | null>(null);
  const [restoredActive, setRestoredActive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const raw = window.localStorage.getItem(ACTIVE_STORAGE_KEY);
      const parsed = raw ? Number.parseInt(raw, 10) : 0;
      setActive(clampIndex(parsed));
      setRestoredActive(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!restoredActive) return;
    window.localStorage.setItem(ACTIVE_STORAGE_KEY, String(active));
  }, [active, restoredActive]);

  const next = useCallback(() => {
    setActive((a) => {
      if (a >= TOTAL_CARDS - 1) return 0;
      return a + 1;
    });
  }, []);

  const prev = useCallback(() => {
    setActive((a) => Math.max(0, a - 1));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (shareOpen) {
        if (e.key === "Escape") setShareOpen(false);
        return;
      }
      if (isEditableTarget(e.target)) return;
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        next();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shareOpen, next, prev]);

  useEffect(() => {
    if (!tweaks.autoAdvance) return;
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [tweaks.autoAdvance, next]);

  const cardId: CardId = CARD_IDS[active];
  const isInteractive = INTERACTIVE_CARD_IDS.has(cardId);
  const bg = CARD_BACKGROUNDS[cardId];

  const common = {
    active,
    onNext: next,
    onShare: () => setShareOpen(true),
    grainLevel: tweaks.grain,
    voiceTone: tweaks.voice,
  };

  return (
    <SwipeContainer onNext={next} onPrev={prev} className="ew-stage">
      <motion.div
        className="ew-stage-bg"
        initial={false}
        animate={{ backgroundColor: bg }}
        transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
      >
        {!isInteractive && (
          <div className="ew-tap-zones">
            <div onClick={prev} className="ew-tap-left" />
            <div onClick={next} className="ew-tap-right" />
          </div>
        )}

        <div className="ew-card-frame" data-card={cardId}>
          <AnimatePresence initial={false} mode="sync">
            {cardId === "intro" && <IntroCard key="intro" {...common} />}
            {cardId === "location" && (
              <LocationCard
                key="location"
                {...common}
                userLocation={userLocation}
                onLocationSet={setUserLocation}
              />
            )}
            {cardId === "temp" && <TempCard key="temp" {...common} />}
            {cardId === "co2" && <CO2Card key="co2" {...common} />}
            {cardId === "ice" && <IceCard key="ice" {...common} />}
            {cardId === "forest" && <ForestCard key="forest" {...common} />}
            {cardId === "pledge" && (
              <PledgeCard
                key="pledge"
                {...common}
                userPledge={userPledge}
                userLocation={userLocation}
                onPledge={setUserPledge}
              />
            )}
            {cardId === "species" && <SpeciesCard key="species" {...common} />}
            {cardId === "plastic" && <PlasticCard key="plastic" {...common} />}
            {cardId === "renewables" && (
              <RenewablesCard key="renewables" {...common} />
            )}
            {cardId === "final" && (
              <FinalCard
                key="final"
                {...common}
                userLocation={userLocation}
                userPledge={userPledge}
              />
            )}
          </AnimatePresence>
          <ShareSheet
            open={shareOpen}
            cardId={cardId}
            pledge={userPledge}
            onClose={() => setShareOpen(false)}
          />
        </div>

        <div className="ew-stage-meta">
          <span>
            {SITE.name} · {SITE.edition}
          </span>
          <span>·</span>
          <span>{cardId.toUpperCase()}</span>
          <span>·</span>
          <span>
            {String(active + 1).padStart(2, "0")} / {String(TOTAL_CARDS).padStart(2, "0")}
          </span>
        </div>

        <div className="ew-stage-hint">
          <span>← prev</span>
          <span>·</span>
          <span>next →</span>
          <span>·</span>
          <span>swipe on mobile</span>
        </div>
      </motion.div>
    </SwipeContainer>
  );
}
