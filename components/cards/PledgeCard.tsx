"use client";

import { useMemo, useState } from "react";
import { PALETTE, FONTS, ACCENTS } from "@/constants/colors";
import type { CardCommonProps, Pledge } from "@/types";
import { CardShell } from "./CardShell";
import { MintedReceipt } from "./MintedReceipt";
import { MintButton } from "@/components/ui/MintButton";
import { useMintPledge } from "@/hooks/usePledge";
import { useMediaMin } from "@/hooks/useBreakpoint";

type PledgeCardProps = CardCommonProps & {
  userPledge: Pledge | null;
  onPledge: (pledge: Pledge) => void;
};

const accent = ACCENTS.pledge;

const PRESETS = [
  { id: "eat", label: "Eat less meat" },
  { id: "fly", label: "Fly less" },
  { id: "plant", label: "Plant something" },
  { id: "vote", label: "Vote climate" },
  { id: "repair", label: "Repair, don't replace" },
];

export function PledgeCard({
  active,
  onNext,
  onShare,
  grainLevel,
  userPledge,
  onPledge,
}: PledgeCardProps) {
  const [choice, setChoice] = useState<string | null>(userPledge?.choice ?? null);
  const [custom, setCustom] = useState(userPledge?.custom ?? "");
  const [writing, setWriting] = useState(false);
  const minted = !!userPledge?.minted;
  const { mint, minting } = useMintPledge();
  const isDesktop = useMediaMin(1024);

  const pledgeText = useMemo(() => {
    if (writing) return custom;
    if (!choice) return "";
    return PRESETS.find((p) => p.id === choice)?.label ?? "";
  }, [writing, custom, choice]);

  const canMint = writing ? custom.trim().length > 2 : !!choice;

  const handleMint = async () => {
    if (!canMint) return;
    const result = await mint(pledgeText);
    if (result) {
      onPledge({
        ...result,
        choice: writing ? null : choice,
        custom: writing ? custom : null,
      });
    }
  };

  return (
    <CardShell
      cardId="pledge"
      active={active}
      grainLevel={grainLevel}
      onNext={onNext}
      onShare={onShare}
      clickable={false}
      hideNext={!minted}
    >
      {!minted ? (
        <>
          <div
            style={{
              position: "absolute",
              top: 180,
              left: 32,
              right: 32,
              textAlign: "center",
              zIndex: 10,
            }}
          >
            <div
              style={{
                fontFamily: FONTS.MONO,
                fontSize: 10,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: PALETTE.ASH_DIM,
                marginBottom: 16,
              }}
            >
              Earth requests
            </div>
            <div
              style={{
                fontFamily: FONTS.SERIF,
                fontSize: 34,
                lineHeight: 1.1,
                fontStyle: "italic",
                color: PALETTE.ASH,
                letterSpacing: "-0.02em",
                textWrap: "balance",
              }}
            >
              One small thing.
              <br />
              <span style={{ color: accent.hex }}>For next year.</span>
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              top: 340,
              left: isDesktop ? "50%" : 24,
              right: isDesktop ? "auto" : 24,
              width: isDesktop ? "min(560px, calc(100vw - 96px))" : "auto",
              transform: isDesktop ? "translateX(-50%)" : undefined,
              zIndex: 10,
            }}
          >
            {!writing && (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setChoice(p.id);
                      }}
                      style={{
                        all: "unset",
                        cursor: "pointer",
                        textAlign: "center",
                        padding: "13px 16px",
                        borderRadius: 12,
                        background:
                          choice === p.id
                            ? `${accent.hex}22`
                            : "rgba(230,214,190,0.04)",
                        border: `1px solid ${choice === p.id ? accent.hex : "rgba(230,214,190,0.14)"}`,
                        fontFamily: FONTS.MONO,
                        fontSize: 11.5,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: choice === p.id ? PALETTE.ASH : PALETTE.ASH_DIM,
                        fontWeight: 500,
                        transition: "all 0.2s ease",
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setWriting(true);
                    setChoice(null);
                  }}
                  style={{
                    all: "unset",
                    cursor: "pointer",
                    textAlign: "center",
                    display: "block",
                    width: "100%",
                    boxSizing: "border-box",
                    marginTop: 8,
                    padding: "13px 16px",
                    borderRadius: 12,
                    border: "1px dashed rgba(230,214,190,0.2)",
                    fontFamily: FONTS.MONO,
                    fontSize: 11.5,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: PALETTE.ASH_DIMMER,
                    fontWeight: 500,
                  }}
                >
                  ＋ Write your own
                </button>
              </>
            )}

            {writing && (
              <>
                <textarea
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="In 2026, I will…"
                  maxLength={80}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    minHeight: 110,
                    padding: "16px",
                    borderRadius: 12,
                    background: "rgba(230,214,190,0.04)",
                    border: `1px solid ${accent.hex}55`,
                    fontFamily: FONTS.SERIF,
                    fontSize: 22,
                    lineHeight: 1.3,
                    color: PALETTE.ASH,
                    outline: "none",
                    resize: "none",
                    fontStyle: "italic",
                  }}
                />
                <div
                  style={{
                    marginTop: 6,
                    textAlign: "right",
                    fontFamily: FONTS.MONO,
                    fontSize: 9,
                    letterSpacing: "0.2em",
                    color: PALETTE.ASH_DIMMER,
                  }}
                >
                  {custom.length} / 80
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setWriting(false);
                    setCustom("");
                  }}
                  style={{
                    all: "unset",
                    cursor: "pointer",
                    textAlign: "center",
                    display: "block",
                    margin: "8px auto 0",
                    padding: "6px 12px",
                    fontFamily: FONTS.MONO,
                    fontSize: 9,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: PALETTE.ASH_DIMMER,
                  }}
                >
                  ← Choose from list
                </button>
              </>
            )}
          </div>

          <div
            style={{
              position: "absolute",
              bottom: 80,
              left: isDesktop ? "50%" : 32,
              right: isDesktop ? "auto" : 32,
              width: isDesktop ? "min(560px, calc(100vw - 96px))" : "auto",
              transform: isDesktop ? "translateX(-50%)" : undefined,
              zIndex: 15,
            }}
          >
            <MintButton
              accent={accent}
              disabled={!canMint}
              minting={minting}
              onClick={handleMint}
            />
            <div
              style={{
                marginTop: 10,
                textAlign: "center",
                fontFamily: FONTS.MONO,
                fontSize: 8,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: PALETTE.ASH_DIMMER,
              }}
            >
              Pledges recorded on Solana · Anonymous
            </div>
          </div>
        </>
      ) : (
        <MintedReceipt
          accent={accent}
          pledge={
            userPledge?.custom ??
            PRESETS.find((p) => p.id === userPledge?.choice)?.label ??
            "a small thing"
          }
          txHash={userPledge?.txHash ?? "………"}
          onNext={onNext}
        />
      )}
    </CardShell>
  );
}
