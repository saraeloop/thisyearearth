"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  ACTIVE_STORAGE_KEY,
  CARD_IDS,
  INTERACTIVE_CARD_IDS,
  TOTAL_CARDS,
} from "@/constants/cards";
import { SITE } from "@/config/site";
import type { CardId, Location, Pledge, Tweaks } from "@/types";
import { SwipeContainer } from "@/components/ui/SwipeContainer";
import { ShareSheet } from "@/components/ui/ShareSheet";
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

type StoryProps = { tweaks: Tweaks };

function clampIndex(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(Math.max(Math.trunc(n), 0), TOTAL_CARDS - 1);
}

export function Story({ tweaks }: StoryProps) {
  const [active, setActive] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [userPledge, setUserPledge] = useState<Pledge | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(ACTIVE_STORAGE_KEY);
    const parsed = raw ? Number.parseInt(raw, 10) : 0;
    setActive(clampIndex(parsed));
  }, []);

  useEffect(() => {
    window.localStorage.setItem(ACTIVE_STORAGE_KEY, String(active));
  }, [active]);

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

  const common = {
    active,
    onNext: next,
    onShare: () => setShareOpen(true),
    grainLevel: tweaks.grain,
    voiceTone: tweaks.voice,
  };

  return (
    <SwipeContainer
      onNext={next}
      onPrev={prev}
      className="ew-stage"
    >
      <div
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 16px",
          boxSizing: "border-box",
          gap: 16,
        }}
      >
        {!isInteractive && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 0,
              display: "flex",
              pointerEvents: "none",
            }}
          >
            <div
              onClick={prev}
              style={{ flex: 1, cursor: "w-resize", pointerEvents: "auto" }}
            />
            <div
              onClick={next}
              style={{ flex: 1, cursor: "e-resize", pointerEvents: "auto" }}
            />
          </div>
        )}

        <div
          style={{
            position: "relative",
            width: 390,
            height: 844,
            maxWidth: "100%",
            maxHeight: "calc(100vh - 48px)",
            borderRadius: 30,
            overflow: "hidden",
            boxShadow:
              "0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(230,214,190,0.08)",
            zIndex: 2,
            background: "#050608",
          }}
        >
          <AnimatePresence mode="wait">
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
                onPledge={setUserPledge}
              />
            )}
            {cardId === "species" && <SpeciesCard key="species" {...common} />}
            {cardId === "plastic" && <PlasticCard key="plastic" {...common} />}
            {cardId === "renewables" && <RenewablesCard key="renewables" {...common} />}
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
            onClose={() => setShareOpen(false)}
          />
        </div>

        <div
          style={{
            fontSize: 9,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "rgba(230,214,190,0.28)",
            display: "flex",
            gap: 14,
            zIndex: 3,
          }}
        >
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

        <div
          style={{
            fontSize: 8.5,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "rgba(230,214,190,0.22)",
            display: "flex",
            gap: 10,
            zIndex: 3,
          }}
        >
          <span>← prev</span>
          <span>·</span>
          <span>next →</span>
          <span>·</span>
          <span>swipe on mobile</span>
        </div>
      </div>
    </SwipeContainer>
  );
}
