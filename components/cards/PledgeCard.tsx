"use client";

import { useEffect, useMemo, useState } from "react";
import { PALETTE, FONTS, ACCENTS } from "@/constants/colors";
import type { CardCommonProps, Location, Pledge } from "@/types";
import { CardShell } from "./CardShell";
import { PledgeReceipt } from "./PledgeReceipt";
import { MintButton } from "@/components/ui/MintButton";
import { useMintPledge } from "@/hooks/usePledge";
import { useDynamicMobileMint } from "@/hooks/useDynamicMobileMint";
import { useMediaMax, useMediaMin } from "@/hooks/useBreakpoint";
import { PLEDGE_TEXT_MAX_LENGTH, PLEDGE_TEXT_MIN_LENGTH } from "@/constants/pledge";
import { SOLANA_NETWORK } from "@/lib/solana/mint";
import {
  getWalletProviderAvailability,
  type WalletProviderAvailability,
} from "@/lib/solana/wallet";

type PledgeCardProps = CardCommonProps & {
  userPledge: Pledge | null;
  userLocation: Location | null;
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
  userLocation,
  onPledge,
}: PledgeCardProps) {
  const [choice, setChoice] = useState<string | null>(userPledge?.choice ?? null);
  const [custom, setCustom] = useState(userPledge?.custom ?? "");
  const [name, setName] = useState(userPledge?.name ?? "");
  const [whereFrom, setWhereFrom] = useState(userPledge?.country ?? "");
  const [writing, setWriting] = useState(false);
  const [walletAvailability, setWalletAvailability] =
    useState<WalletProviderAvailability>("missing");
  const { mint, record, saveMinted, minting, error } = useMintPledge();
  const {
    startMobileMint,
    minting: dynamicMinting,
    error: dynamicError,
  } = useDynamicMobileMint({
    saveMinted,
    onComplete: (result, draft) => {
      onPledge({
        ...result,
        choice: draft.choice,
        custom: draft.custom,
        name: result.name ?? draft.metadata.name ?? null,
        country: result.country ?? draft.metadata.country ?? null,
      });
    },
  });
  const isDesktop = useMediaMin(1024);
  const isPhone = useMediaMax(767);
  const hasRecordedPledge = !!userPledge;

  const pledgeText = useMemo(() => {
    if (writing) return custom;
    if (!choice) return "";
    return PRESETS.find((p) => p.id === choice)?.label ?? "";
  }, [writing, custom, choice]);

  const canMint = writing ? custom.trim().length >= PLEDGE_TEXT_MIN_LENGTH : !!choice;
  const needsPhantomMobile = walletAvailability === "mobile-no-provider";
  const missingDesktopWallet = walletAvailability === "missing";
  const mintButtonDisabled = !canMint;
  const mintButtonLabel = needsPhantomMobile
    ? "Open Phantom to mint →"
    : "Mint to the ledger →";
  const mintHint = needsPhantomMobile
    ? canMint
      ? "Approve in Phantom, then return here."
      : "Choose a pledge, then open Phantom to mint."
    : missingDesktopWallet
      ? "Install Phantom or Solflare to mint"
      : `Solana ${SOLANA_NETWORK} is optional`;

  useEffect(() => {
    const updateWalletAvailability = () => {
      setWalletAvailability(getWalletProviderAvailability());
    };

    updateWalletAvailability();
    const refreshTimers = [
      window.setTimeout(updateWalletAvailability, 250),
      window.setTimeout(updateWalletAvailability, 1000),
    ];
    window.addEventListener("focus", updateWalletAvailability);
    document.addEventListener("visibilitychange", updateWalletAvailability);
    return () => {
      refreshTimers.forEach(window.clearTimeout);
      window.removeEventListener("focus", updateWalletAvailability);
      document.removeEventListener("visibilitychange", updateWalletAvailability);
    };
  }, []);

  const handleMint = async () => {
    if (needsPhantomMobile) {
      if (!canMint) return;
      await startMobileMint({
        pledgeText,
        metadata: {
          name: name.trim() || null,
          country: whereFrom.trim() || null,
          location: userLocation,
        },
        choice: writing ? null : choice,
        custom: writing ? custom : null,
      });
      return;
    }
    if (!canMint) return;
    const result = await mint(pledgeText, {
      name: name.trim() || null,
      country: whereFrom.trim() || null,
      location: userLocation,
    });
    if (result) {
      onPledge({
        ...result,
        choice: writing ? null : choice,
        custom: writing ? custom : null,
        name: result.name ?? (name.trim() || null),
        country: result.country ?? (whereFrom.trim() || null),
      });
    }
  };

  const handleSkipMint = async () => {
    if (!canMint) {
      onNext();
      return;
    }
    const result = await record(pledgeText, {
      name: name.trim() || null,
      country: whereFrom.trim() || null,
      location: userLocation,
    });
    if (result) {
      onPledge({
        ...result,
        choice: writing ? null : choice,
        custom: writing ? custom : null,
        name: result.name ?? (name.trim() || null),
        country: result.country ?? (whereFrom.trim() || null),
        minted: false,
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
      hideNext={!hasRecordedPledge}
    >
      {!hasRecordedPledge ? (
        <>
          <div
            style={{
              position: "absolute",
              top: isDesktop ? 180 : "var(--ew-story-pledge-title-top, 112px)",
              left: isDesktop ? 32 : 24,
              right: isDesktop ? 32 : 24,
              textAlign: "center",
              zIndex: 10,
            }}
          >
            <div
              style={{
                fontFamily: FONTS.MONO,
                fontSize: isDesktop ? 10 : 9.5,
                letterSpacing: isDesktop ? "0.3em" : "0.26em",
                textTransform: "uppercase",
                color: PALETTE.ASH_DIM,
                marginBottom: isDesktop ? 16 : 12,
              }}
            >
              Earth requests
            </div>
            <div
              style={{
                fontFamily: FONTS.SERIF,
                fontSize: isDesktop ? 34 : 31,
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
              top: isDesktop ? 340 : "var(--ew-story-pledge-form-top, 220px)",
              left: isDesktop ? "50%" : 24,
              right: isDesktop ? "auto" : 24,
              width: isDesktop ? "min(560px, calc(100vw - 96px))" : "auto",
              transform: isDesktop ? "translateX(-50%)" : undefined,
              zIndex: 10,
            }}
          >
            {!writing && (
              <>
                <div
                  style={{
                    display: isDesktop || isPhone ? "flex" : "grid",
                    flexDirection: "column",
                    gridTemplateColumns: isDesktop || isPhone ? undefined : "1fr 1fr",
                    gap: isDesktop ? 8 : isPhone ? 8 : 7,
                  }}
                >
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
                        padding: isDesktop ? "13px 16px" : isPhone ? "11px 12px" : "10px 8px",
                        borderRadius: isDesktop ? 12 : 10,
                        background:
                          choice === p.id
                            ? `${accent.hex}22`
                            : "rgba(230,214,190,0.04)",
                        border: `1px solid ${choice === p.id ? accent.hex : "rgba(230,214,190,0.14)"}`,
                        fontFamily: FONTS.MONO,
                        fontSize: isDesktop ? 11.5 : isPhone ? 9.8 : 9.2,
                        lineHeight: 1.25,
                        letterSpacing: isDesktop ? "0.14em" : isPhone ? "0.14em" : "0.1em",
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
                    padding: isDesktop ? "13px 16px" : "10px 12px",
                    borderRadius: isDesktop ? 12 : 10,
                    border: "1px dashed rgba(230,214,190,0.2)",
                    fontFamily: FONTS.MONO,
                    fontSize: isDesktop ? 11.5 : 9.6,
                    letterSpacing: isDesktop ? "0.14em" : "0.12em",
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
                <input
                  type="text"
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="In 2026, I will…"
                  maxLength={PLEDGE_TEXT_MAX_LENGTH}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    height: isDesktop ? 34 : 30,
                    padding: "0 0 3px",
                    borderRadius: 0,
                    background: "transparent",
                    border: 0,
                    borderBottom: `1px solid ${PALETTE.ASH_DIM}`,
                    fontFamily: FONTS.SERIF,
                    fontSize: isDesktop ? 22 : 20,
                    lineHeight: 1,
                    color: PALETTE.ASH,
                    outline: "none",
                    fontStyle: "italic",
                  }}
                />
                <div
                  style={{
                    marginTop: 6,
                    textAlign: "right",
                    fontFamily: FONTS.MONO,
                    fontSize: isDesktop ? 9 : 8,
                    letterSpacing: isDesktop ? "0.2em" : "0.18em",
                    color: PALETTE.ASH_DIMMER,
                  }}
                >
                  {custom.length} / {PLEDGE_TEXT_MAX_LENGTH}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: isDesktop ? 10 : 8,
                    marginTop: isDesktop ? 16 : 12,
                    padding: "0 4px",
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 10,
                      fontFamily: FONTS.SERIF,
                      fontSize: isDesktop ? 18 : 16,
                      fontStyle: "italic",
                      color: PALETTE.ASH,
                    }}
                  >
                    <span style={{ color: PALETTE.ASH_DIM }}>— signed,</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      maxLength={80}
                      aria-label="Signed name, optional"
                      style={{
                        all: "unset",
                        flex: 1,
                        minWidth: 0,
                        padding: "0 0 4px",
                        borderBottom: "1px solid rgba(230,214,190,0.45)",
                        fontFamily: FONTS.SERIF,
                        fontSize: isDesktop ? 19 : 17,
                        lineHeight: 1.2,
                        fontStyle: "italic",
                        color: PALETTE.ASH,
                      }}
                    />
                  </label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 10,
                      fontFamily: FONTS.SERIF,
                      fontSize: isDesktop ? 16 : 15,
                      fontStyle: "italic",
                      color: PALETTE.ASH_DIM,
                    }}
                  >
                    <span>from</span>
                    <input
                      value={whereFrom}
                      onChange={(e) => setWhereFrom(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      maxLength={80}
                      aria-label="Where from, optional"
                      style={{
                        all: "unset",
                        flex: 1,
                        minWidth: 0,
                        padding: "0 0 4px",
                        borderBottom: "1px solid rgba(230,214,190,0.32)",
                        fontFamily: FONTS.SERIF,
                        fontSize: isDesktop ? 17 : 16,
                        lineHeight: 1.2,
                        fontStyle: "italic",
                        color: PALETTE.ASH,
                      }}
                    />
                  </label>
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
                    margin: isDesktop ? "8px auto 0" : "6px auto 0",
                    padding: isDesktop ? "6px 12px" : "5px 10px",
                    fontFamily: FONTS.MONO,
                    fontSize: isDesktop ? 9 : 8,
                    letterSpacing: isDesktop ? "0.22em" : "0.18em",
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
              bottom: isDesktop ? 80 : "var(--ew-story-action-bottom, 26px)",
              left: isDesktop ? "50%" : 24,
              right: isDesktop ? "auto" : 24,
              width: isDesktop ? "min(560px, calc(100vw - 96px))" : "auto",
              transform: isDesktop ? "translateX(-50%)" : undefined,
              zIndex: 15,
            }}
          >
            <MintButton
              accent={accent}
              disabled={mintButtonDisabled || dynamicMinting}
              minting={minting || dynamicMinting}
              label={mintButtonLabel}
              onClick={handleMint}
            />
            <button
              type="button"
              disabled={minting || dynamicMinting}
              onClick={(e) => {
                e.stopPropagation();
                handleSkipMint();
              }}
              style={{
                all: "unset",
                cursor: minting || dynamicMinting ? "not-allowed" : "pointer",
                display: "block",
                width: "100%",
                boxSizing: "border-box",
                marginTop: isDesktop ? 8 : 6,
                padding: isDesktop ? "10px 12px" : "8px 10px",
                textAlign: "center",
                fontFamily: FONTS.MONO,
                fontSize: isDesktop ? 10.5 : 9.2,
                letterSpacing: isDesktop ? "0.22em" : "0.18em",
                textTransform: "uppercase",
                color:
                  minting || dynamicMinting ? PALETTE.ASH_DIMMER : PALETTE.ASH_DIM,
                fontWeight: 600,
                opacity: minting || dynamicMinting ? 0.55 : 1,
                textShadow:
                  minting || dynamicMinting ? undefined : `0 0 10px ${accent.glow}`,
              }}
            >
              Continue without minting →
            </button>
            <div
              style={{
                marginTop: isDesktop ? 6 : 4,
                textAlign: "center",
                fontFamily: FONTS.MONO,
                fontSize: isDesktop ? 8 : 7.2,
                letterSpacing: isDesktop ? "0.24em" : "0.18em",
                textTransform: "uppercase",
                color: PALETTE.ASH_DIMMER,
              }}
            >
              {mintHint}
            </div>
            {(error || dynamicError) && (
              <div
                role="status"
                style={{
                  marginTop: 10,
                  textAlign: "center",
                  fontFamily: FONTS.MONO,
                  fontSize: 8,
                  lineHeight: 1.5,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: accent.hex,
                }}
              >
                {error ?? dynamicError}
              </div>
            )}
          </div>
        </>
      ) : (
        <PledgeReceipt
          accent={accent}
          pledge={
            userPledge?.custom ??
            PRESETS.find((p) => p.id === userPledge?.choice)?.label ??
            "a small thing"
          }
          txHash={userPledge?.txHash}
          onNext={onNext}
        />
      )}
    </CardShell>
  );
}
