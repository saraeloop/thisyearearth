"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PALETTE, FONTS, ACCENTS } from "@/constants/colors";
import type { CardId, Pledge } from "@/types";
import { SITE } from "@/config/site";
import { backdrop, sheetSlideUp, EASE_OUT } from "@/constants/variants";
import { LargeGrain, GrainTexture } from "./Grain";
import { usePledgeCount } from "@/hooks/usePledge";
import { useMediaMin } from "@/hooks/useBreakpoint";

type ShareSheetProps = {
  open: boolean;
  cardId: CardId;
  pledge?: Pledge | null;
  onClose: () => void;
};

const SHARE_STATS = [
  ["CO2", "429 PPM"],
  ["TEMP", "+1.55C"],
  ["ICE LOST", "1.17T"],
  ["FOREST", "14.9M HA"],
  ["SPECIES", "41,046"],
  ["PLASTIC", "413 MT"],
  ["RENEWABLES", "+32%"],
];

const PRESET_PLEDGE_LINES: Record<string, string[]> = {
  eat: ["I will eat less meat", "this year. Every", "meal counts."],
  fly: ["I will fly less", "this year. Every", "mile counts."],
  plant: ["I will plant something", "this year. Every", "root counts."],
  vote: ["I will vote climate", "this year. Every", "ballot counts."],
  repair: ["I will repair more", "this year. Every", "thing kept counts."],
};

const SHARE_COUNT_THRESHOLD = 100;
const SHARE_URL = `https://${SITE.domain}`;
const SHARE_TEXT = "I made a pledge to Earth.";
const POSTER_WIDTH = 1080;
const POSTER_HEIGHT = 1920;
const POSTER_FILENAME = "earth-wrapped-pledge.png";

type ShareActionKind = "story" | "x" | "copy-image" | "copy-link";

const QUOTE_LAYOUTS = {
  hero: {
    previewFontSize: "clamp(17px, 4.8vw, 23px)",
    previewLineHeight: 1.22,
    previewWidthDesktop: "65%",
    previewWidthMobile: "70%",
    posterFontSize: 62,
    posterLineHeight: 74,
    posterSignatureFontSize: 44,
    signatureGap: 24,
    posterSignatureGap: 58,
  },
  medium: {
    previewFontSize: "clamp(16px, 4.45vw, 21.5px)",
    previewLineHeight: 1.17,
    previewWidthDesktop: "68%",
    previewWidthMobile: "73%",
    posterFontSize: 58,
    posterLineHeight: 68,
    posterSignatureFontSize: 41,
    signatureGap: 18,
    posterSignatureGap: 48,
  },
  compact: {
    previewFontSize: "clamp(15.5px, 4.2vw, 20.5px)",
    previewLineHeight: 1.14,
    previewWidthDesktop: "72%",
    previewWidthMobile: "76%",
    posterFontSize: 53,
    posterLineHeight: 62,
    posterSignatureFontSize: 38,
    signatureGap: 14,
    posterSignatureGap: 36,
  },
} as const;

export function ShareSheet({ open, cardId, pledge, onClose }: ShareSheetProps) {
  return (
    <AnimatePresence>
      {open && <Sheet cardId={cardId} pledge={pledge} onClose={onClose} />}
    </AnimatePresence>
  );
}

function Sheet({
  cardId,
  pledge,
  onClose,
}: {
  cardId: CardId;
  pledge?: Pledge | null;
  onClose: () => void;
}) {
  void cardId;
  const posterRef = useRef<HTMLCanvasElement>(null);
  const [busyAction, setBusyAction] = useState<ShareActionKind | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const pledgeCount = usePledgeCount(3000);
  const pledgeLines = getPledgeLines(pledge);
  const signatureName = getSignatureName(pledge);
  const quoteLength = getPledgeCharacterLength(pledge, pledgeLines);
  const quoteLayout = getQuoteLayout(quoteLength);
  const isDesktop = useMediaMin(1024);
  const footerPledgeText =
    pledgeCount >= SHARE_COUNT_THRESHOLD
      ? `Pledges minted · live · ${pledgeCount.toLocaleString("en-US")}`
      : "Pledges minted · live";

  const runAction = async (
    action: ShareActionKind,
    handler: () => Promise<string> | string,
  ) => {
    if (busyAction) return;
    setBusyAction(action);
    setActionMessage(null);
    try {
      const message = await handler();
      setActionMessage(message);
      window.setTimeout(() => setActionMessage(null), 1800);
    } catch {
      setActionMessage("Something went wrong. Try again.");
    } finally {
      setBusyAction(null);
    }
  };

  const createPosterBlob = async () => {
    if (!posterRef.current) {
      throw new Error("Share poster is not mounted.");
    }
    return renderPosterCanvasToPngBlob(posterRef.current);
  };

  const handleStoryShare = () =>
    runAction("story", async () => {
      const blob = await createPosterBlob();
      if (isDesktop) {
        downloadBlob(blob, POSTER_FILENAME);
        return "Image downloaded.";
      }

      const file = new File([blob], POSTER_FILENAME, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: SITE.name,
          text: SHARE_TEXT,
          url: SHARE_URL,
        });
        return "Opened share sheet.";
      }
      downloadBlob(blob, POSTER_FILENAME);
      return "Image downloaded.";
    });

  const handleXPost = () =>
    runAction("x", () => {
      const intentUrl = new URL("https://x.com/compose/post");
      intentUrl.searchParams.set("text", `${SHARE_TEXT} ${SHARE_URL}`);
      const opened = window.open(intentUrl.toString(), "_blank", "noopener,noreferrer");
      if (!opened) window.location.href = intentUrl.toString();
      return "Opening X.";
    });

  const handleCopyImage = () =>
    runAction("copy-image", async () => {
      const blob = await createPosterBlob();
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        return "Image copied.";
      }
      downloadBlob(blob, POSTER_FILENAME);
      return "Image downloaded.";
    });

  const handleCopyLink = () =>
    runAction("copy-link", async () => {
      await copyTextToClipboard(SHARE_URL);
      return "Link copied.";
    });

  return (
    <motion.div
      variants={backdrop}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.3 }}
      onClick={onClose}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 100,
        background: "rgba(5,6,8,0.72)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: isDesktop ? "center" : "flex-end",
        justifyContent: isDesktop ? "center" : undefined,
        padding: isDesktop ? 24 : 0,
        overflow: "hidden",
      }}
    >
      <motion.div
        className="ew-share-sheet-panel"
        onClick={(e) => e.stopPropagation()}
        variants={sheetSlideUp}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.4, ease: EASE_OUT }}
        style={{
          width: isDesktop ? "min(460px, calc(100vw - 48px))" : "100%",
          maxHeight: isDesktop ? "calc(100dvh - 48px)" : "100dvh",
          overflowY: isDesktop ? "auto" : "hidden",
          overscrollBehavior: "contain",
          borderRadius: isDesktop ? 18 : "24px 24px 0 0",
          background: "linear-gradient(180deg, #0e1220 0%, #070a12 100%)",
          border: "1px solid rgba(230,214,190,0.12)",
          borderBottom: isDesktop ? "1px solid rgba(230,214,190,0.12)" : "none",
          padding: isDesktop ? "14px 14px 18px" : "16px 20px 28px",
        }}
      >
        <div
          style={{
            width: 36,
            height: 4,
            borderRadius: 2,
            background: "rgba(230,214,190,0.2)",
            margin: "0 auto 16px",
          }}
        />
        <div
          style={{
            fontFamily: FONTS.MONO,
            fontSize: 10,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: PALETTE.ASH_DIM,
            textAlign: "center",
            marginBottom: 14,
          }}
        >
          Share to the record
        </div>

        <div
          style={{
            width: "100%",
            maxWidth: isDesktop
              ? 420
              : "min(100%, 360px, calc((100dvh - 300px) * 9 / 14))",
            margin: isDesktop ? "0 auto 14px" : "0 auto 16px",
            aspectRatio: "9 / 14",
            borderRadius: 14,
            overflow: "hidden",
            position: "relative",
            background: `
              radial-gradient(ellipse 75% 48% at 52% 48%, rgba(230,214,190,0.10) 0%, transparent 55%),
              radial-gradient(ellipse 120% 60% at 50% 115%, ${ACCENTS.final.glow} 0%, transparent 55%),
              linear-gradient(180deg, ${PALETTE.BG_TOP} 0%, ${PALETTE.BG_MID} 50%, ${PALETTE.BG_BOTTOM} 100%)
            `,
            border: "1px solid rgba(230,214,190,0.14)",
          }}
        >
          <LargeGrain opacity={0.4} />
          <GrainTexture opacity={0.25} />
          <ShareGlobe />

          <div
            style={{
              position: "absolute",
              top: 22,
              left: 20,
              right: 20,
              fontFamily: FONTS.MONO,
              fontSize: 8,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: PALETTE.ASH,
              zIndex: 5,
            }}
          >
            Earth Wrapped · {SITE.edition}
            <div
              style={{
                marginTop: 10,
                height: 1,
                background:
                  "linear-gradient(90deg, rgba(230,214,190,0.15), rgba(230,214,190,0.74), rgba(230,214,190,0.15))",
              }}
            />
          </div>

          <div
            style={{
              position: "absolute",
              top: isDesktop ? "18%" : "17%",
              left: 26,
              width: isDesktop
                ? quoteLayout.previewWidthDesktop
                : quoteLayout.previewWidthMobile,
              zIndex: 5,
            }}
          >
            <div
              style={{
                fontFamily: FONTS.SERIF,
                fontSize: quoteLayout.previewFontSize,
                lineHeight: quoteLayout.previewLineHeight,
                fontStyle: "italic",
                color: PALETTE.ASH,
                letterSpacing: "-0.01em",
                textWrap: "balance",
                overflowWrap: "anywhere",
              }}
            >
              &ldquo;
              {pledgeLines.map((line, index) => (
                <span key={`${line}-${index}`}>
                  {line}
                  {index < pledgeLines.length - 1 && <br />}
                </span>
              ))}
              &rdquo;
              {signatureName && (
                <div
                  title={signatureName}
                  style={{
                    marginTop: quoteLayout.signatureGap,
                    fontSize: "0.74em",
                    textAlign: "center",
                    color: PALETTE.ASH_DIM,
                    maxWidth: "84%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  — {signatureName}
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              top: isDesktop ? "59%" : "66%",
              right: 24,
              width: "42%",
              zIndex: 5,
            }}
          >
            <div
              style={{
                fontFamily: FONTS.MONO,
                fontSize: "clamp(7px, 2.25vw, 10px)",
                lineHeight: 1.8,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: PALETTE.ASH,
                textAlign: "right",
              }}
            >
              {SHARE_STATS.map(([name, value]) => (
                <div key={name}>
                  <span style={{ color: "rgba(230,214,190,0.62)" }}>{name}</span>
                  <span style={{ color: "rgba(230,214,190,0.38)" }}> · </span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              left: 20,
              right: 20,
              bottom: 51,
              zIndex: 5,
              height: 1,
              background:
                "linear-gradient(90deg, rgba(230,214,190,0.15), rgba(230,214,190,0.74), rgba(230,214,190,0.15))",
            }}
          />

          <div
            style={{
              position: "absolute",
              bottom: 21,
              left: 0,
              right: 0,
              zIndex: 5,
              textAlign: "center",
              fontFamily: FONTS.MONO,
              fontSize: 7.2,
              lineHeight: 1.8,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: PALETTE.ASH_DIM,
            }}
          >
            <div>{SITE.domain}</div>
            <div>{footerPledgeText}</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <ShareAction
            label={busyAction === "story" ? "Working..." : isDesktop ? "Download" : "Share"}
            sub="Story Image"
            onClick={handleStoryShare}
            disabled={!!busyAction}
          />
          <ShareAction
            label={busyAction === "x" ? "Opening..." : "X"}
            sub="Post"
            onClick={handleXPost}
            disabled={!!busyAction}
          />
          <ShareAction
            label={busyAction === "copy-image" ? "Copying..." : "Copy Image"}
            sub="PNG · 1080×1920"
            onClick={handleCopyImage}
            disabled={!!busyAction}
          />
          <ShareAction
            label={busyAction === "copy-link" ? "Copying..." : "Copy Link"}
            sub={SITE.domain}
            onClick={handleCopyLink}
            disabled={!!busyAction}
          />
        </div>

        <div
          role="status"
          style={{
            minHeight: 18,
            marginTop: 10,
            textAlign: "center",
            fontFamily: FONTS.MONO,
            fontSize: 8,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: PALETTE.ASH_DIM,
          }}
        >
          {actionMessage}
        </div>

        <button
          onClick={onClose}
          style={{
            all: "unset",
            cursor: "pointer",
            display: "block",
            margin: "16px auto 0",
            padding: "8px 16px",
            fontFamily: FONTS.MONO,
            fontSize: 9,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: PALETTE.ASH_DIMMER,
          }}
        >
          Close
        </button>

        <SharePoster
          ref={posterRef}
          pledgeLines={pledgeLines}
          signatureName={signatureName}
          footerPledgeText={footerPledgeText}
          quoteLayout={quoteLayout}
        />
      </motion.div>
    </motion.div>
  );
}

function getPledgeLines(pledge?: Pledge | null) {
  if (!pledge) return PRESET_PLEDGE_LINES.eat;
  if (pledge.custom?.trim()) return wrapPledge(pledge.custom.trim());
  if (pledge.choice && PRESET_PLEDGE_LINES[pledge.choice]) {
    return PRESET_PLEDGE_LINES[pledge.choice];
  }
  return PRESET_PLEDGE_LINES.eat;
}

function wrapPledge(text: string) {
  const maxLineLength = 30;
  const maxLines = 5;
  const normalized = text.replace(/\s+/g, " ");
  if (normalized.length <= 26) return [normalized, "Every action counts."];
  const words = normalized
    .split(" ")
    .flatMap((word) => splitLongWord(word, maxLineLength));
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLineLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
    if (lines.length === maxLines) break;
  }
  if (current && lines.length < maxLines) lines.push(current);
  if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) {
    lines[maxLines - 1] = trimWithEllipsis(lines[maxLines - 1], maxLineLength);
  }
  return lines.slice(0, maxLines);
}

function splitLongWord(word: string, maxLength: number) {
  if (word.length <= maxLength) return [word];
  const chunks: string[] = [];
  for (let i = 0; i < word.length; i += maxLength) {
    chunks.push(word.slice(i, i + maxLength));
  }
  return chunks;
}

function trimWithEllipsis(text: string, maxLength: number) {
  if (text.length <= maxLength - 3) return `${text}...`;
  return `${text.slice(0, maxLength - 3).trimEnd()}...`;
}

function getSignatureName(pledge?: Pledge | null) {
  return pledge?.name?.trim() || null;
}

function getPledgeCharacterLength(pledge: Pledge | null | undefined, lines: string[]) {
  if (pledge?.custom?.trim()) return pledge.custom.trim().length;
  if (pledge?.choice && PRESET_PLEDGE_LINES[pledge.choice]) {
    return PRESET_PLEDGE_LINES[pledge.choice][0].length;
  }
  return lines.join(" ").length;
}

function getQuoteLayout(length: number) {
  if (length >= 61) {
    return QUOTE_LAYOUTS.compact;
  }
  if (length >= 45) {
    return QUOTE_LAYOUTS.medium;
  }
  return QUOTE_LAYOUTS.hero;
}

function ShareGlobe() {
  return (
    <svg
      aria-hidden="true"
      viewBox="-100 -100 200 200"
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: "88%",
        transform: "translate(-50%, -50%)",
        zIndex: 3,
        opacity: 0.24,
        color: PALETTE.ASH,
      }}
    >
      <circle
        cx="0"
        cy="0"
        r="86"
        fill="rgba(230,214,190,0.03)"
        stroke="currentColor"
        strokeWidth="0.45"
      />
      {[0, 30, 60, 90, 120, 150].map((angle) => (
        <ellipse
          key={angle}
          cx="0"
          cy="0"
          rx={86 * Math.abs(Math.cos((angle * Math.PI) / 180)) || 0.5}
          ry="86"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.28"
        />
      ))}
      {[-60, -30, 0, 30, 60].map((lat) => (
        <ellipse
          key={lat}
          cx="0"
          cy={(lat * 86) / 90}
          rx={86 * Math.cos((lat * Math.PI) / 180)}
          ry="4"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.28"
        />
      ))}
    </svg>
  );
}

function ShareAction({
  label,
  sub,
  onClick,
  disabled = false,
}: {
  label: string;
  sub: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        all: "unset",
        cursor: disabled ? "wait" : "pointer",
        textAlign: "center",
        padding: "12px 10px",
        borderRadius: 12,
        background: "rgba(230,214,190,0.04)",
        border: "1px solid rgba(230,214,190,0.14)",
        opacity: disabled ? 0.62 : 1,
      }}
    >
      <div
        style={{
          fontFamily: FONTS.MONO,
          fontSize: 10.5,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: PALETTE.ASH,
          fontWeight: 500,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: FONTS.MONO,
          fontSize: 7.5,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: PALETTE.ASH_DIMMER,
          marginTop: 3,
        }}
      >
        {sub}
      </div>
    </button>
  );
}

type SharePosterProps = {
  pledgeLines: string[];
  signatureName: string | null;
  footerPledgeText: string;
  quoteLayout: ReturnType<typeof getQuoteLayout>;
};

const SharePoster = forwardRef<HTMLCanvasElement, SharePosterProps>(function SharePoster(
  {
    pledgeLines,
    signatureName,
    footerPledgeText,
    quoteLayout,
  },
  ref,
) {
  const localRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    const draw = async () => {
      await document.fonts?.ready;
      await nextFrame();
      if (cancelled || !localRef.current) return;
      drawSharePoster(localRef.current, {
        pledgeLines,
        signatureName,
        footerPledgeText,
        quoteLayout,
      });
      localRef.current.dataset.exportReady = "true";
    };

    if (localRef.current) localRef.current.dataset.exportReady = "false";
    void draw();

    return () => {
      cancelled = true;
    };
  }, [footerPledgeText, pledgeLines, quoteLayout, signatureName]);

  const setCanvasRef = (node: HTMLCanvasElement | null) => {
    localRef.current = node;
    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  return (
    <canvas
      ref={setCanvasRef}
      aria-hidden="true"
      data-export-ready="false"
      width={POSTER_WIDTH}
      height={POSTER_HEIGHT}
      style={{
        position: "fixed",
        top: 0,
        left: -12000,
        width: POSTER_WIDTH,
        height: POSTER_HEIGHT,
        pointerEvents: "none",
      }}
    />
  );
});

async function renderPosterCanvasToPngBlob(canvas: HTMLCanvasElement) {
  await waitForPosterReady(canvas);
  return canvasToPngBlob(canvas);
}

async function waitForPosterReady(canvas: HTMLCanvasElement) {
  await document.fonts?.ready;
  for (let i = 0; i < 24; i += 1) {
    if (canvas.dataset.exportReady === "true") return;
    await nextFrame();
  }

  throw new Error("Share poster is not ready.");
}

function nextFrame() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

function drawSharePoster(canvas: HTMLCanvasElement, props: SharePosterProps) {
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available.");

  context.clearRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);
  drawPosterBackground(context);
  drawPosterGrain(context);
  drawPosterGlobe(context);
  drawPosterHeader(context);
  drawPosterPledge(
    context,
    props.pledgeLines,
    props.signatureName,
    props.quoteLayout,
  );
  drawPosterStats(context);
  drawPosterFooter(context, props.footerPledgeText);
}

function drawPosterBackground(context: CanvasRenderingContext2D) {
  const base = context.createLinearGradient(0, 0, 0, POSTER_HEIGHT);
  base.addColorStop(0, "#0A0E1A");
  base.addColorStop(0.5, "#0D1322");
  base.addColorStop(1, "#070A12");
  context.fillStyle = base;
  context.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);

  context.save();
  context.globalCompositeOperation = "screen";
  drawEllipseGlow(context, 560, 870, 450, 300, "rgba(230,214,190,0.10)");
  drawEllipseGlow(context, 540, 1880, 720, 360, "rgba(230,214,190,0.22)");
  context.restore();

  context.strokeStyle = "rgba(230,214,190,0.14)";
  context.lineWidth = 2;
  context.strokeRect(1, 1, POSTER_WIDTH - 2, POSTER_HEIGHT - 2);
}

function drawEllipseGlow(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radiusX: number,
  radiusY: number,
  color: string,
) {
  context.save();
  context.translate(x, y);
  context.scale(radiusX / radiusY, 1);
  const gradient = context.createRadialGradient(0, 0, 0, 0, 0, radiusY);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, "rgba(230,214,190,0)");
  context.fillStyle = gradient;
  context.beginPath();
  context.arc(0, 0, radiusY, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawPosterGrain(context: CanvasRenderingContext2D) {
  context.save();
  context.fillStyle = "#E6D6BE";
  context.globalAlpha = 0.045;

  let seed = 42;
  for (let i = 0; i < 9500; i += 1) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const x = seed % POSTER_WIDTH;
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const y = seed % POSTER_HEIGHT;
    context.fillRect(x, y, 1, 1);
  }

  context.restore();
}

function drawPosterGlobe(context: CanvasRenderingContext2D) {
  const cx = 540;
  const cy = 900;
  const radius = 382;

  context.save();
  context.globalAlpha = 0.24;
  context.strokeStyle = "#E6D6BE";
  context.fillStyle = "rgba(230,214,190,0.03)";
  context.lineWidth = 2;

  context.beginPath();
  context.arc(cx, cy, radius, 0, Math.PI * 2);
  context.fill();
  context.stroke();

  context.lineWidth = 1.2;
  [0, 30, 60, 90, 120, 150].forEach((angle) => {
    const rx = radius * Math.abs(Math.cos((angle * Math.PI) / 180)) || 2;
    context.beginPath();
    context.ellipse(cx, cy, rx, radius, 0, 0, Math.PI * 2);
    context.stroke();
  });

  [-60, -30, 0, 30, 60].forEach((lat) => {
    context.beginPath();
    context.ellipse(
      cx,
      cy + (lat * radius) / 90,
      radius * Math.cos((lat * Math.PI) / 180),
      18,
      0,
      0,
      Math.PI * 2,
    );
    context.stroke();
  });

  context.restore();
}

function drawPosterHeader(context: CanvasRenderingContext2D) {
  context.save();
  context.fillStyle = "#E6D6BE";
  context.font = `500 22px ${FONTS.MONO}`;
  drawLetterSpacedText(context, `Earth Wrapped · ${SITE.edition}`.toUpperCase(), 70, 120, 6);

  const line = context.createLinearGradient(70, 155, 1010, 155);
  line.addColorStop(0, "rgba(230,214,190,0.15)");
  line.addColorStop(0.5, "rgba(230,214,190,0.74)");
  line.addColorStop(1, "rgba(230,214,190,0.15)");
  context.strokeStyle = line;
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(70, 155);
  context.lineTo(1010, 155);
  context.stroke();
  context.restore();
}

function drawPosterPledge(
  context: CanvasRenderingContext2D,
  pledgeLines: string[],
  signatureName: string | null,
  quoteLayout: ReturnType<typeof getQuoteLayout>,
) {
  const lines = withSmartQuotes(pledgeLines);
  const x = 80;
  let y = 390;

  context.save();
  context.fillStyle = "#E6D6BE";
  context.font = `italic ${quoteLayout.posterFontSize}px ${FONTS.SERIF}`;
  lines.forEach((line) => {
    context.fillText(line, x, y);
    y += quoteLayout.posterLineHeight;
  });

  if (signatureName) {
    context.fillStyle = "rgba(230,214,190,0.58)";
    context.font = `italic ${quoteLayout.posterSignatureFontSize}px ${FONTS.SERIF}`;
    const fitted = fitCanvasText(context, `— ${signatureName}`, 660);
    context.fillText(fitted, x + 40, y + quoteLayout.posterSignatureGap);
  }
  context.restore();
}

function drawPosterStats(context: CanvasRenderingContext2D) {
  context.save();
  context.font = `500 27px ${FONTS.MONO}`;
  context.textAlign = "right";
  context.textBaseline = "alphabetic";

  let y = 1210;
  SHARE_STATS.forEach(([name, value]) => {
    const separator = "  ·  ";
    const valueWidth = context.measureText(value).width;
    const separatorWidth = context.measureText(separator).width;

    context.fillStyle = "#E6D6BE";
    context.fillText(value, 980, y);
    context.fillStyle = "rgba(230,214,190,0.38)";
    context.fillText(separator, 980 - valueWidth, y);
    context.fillStyle = "rgba(230,214,190,0.62)";
    context.fillText(name, 980 - valueWidth - separatorWidth, y);
    y += 54;
  });
  context.restore();
}

function drawPosterFooter(context: CanvasRenderingContext2D, footerPledgeText: string) {
  const line = context.createLinearGradient(70, 1695, 1010, 1695);
  line.addColorStop(0, "rgba(230,214,190,0.15)");
  line.addColorStop(0.5, "rgba(230,214,190,0.74)");
  line.addColorStop(1, "rgba(230,214,190,0.15)");
  context.strokeStyle = line;
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(70, 1695);
  context.lineTo(1010, 1695);
  context.stroke();

  context.save();
  context.fillStyle = "rgba(230,214,190,0.58)";
  context.font = `500 19px ${FONTS.MONO}`;
  context.textAlign = "center";
  drawLetterSpacedText(context, SITE.domain.toUpperCase(), 540, 1750, 7, "center");
  drawLetterSpacedText(context, footerPledgeText.toUpperCase(), 540, 1795, 6, "center");
  context.restore();
}

function withSmartQuotes(lines: string[]) {
  if (!lines.length) return lines;
  return lines.map((line, index) => {
    if (index === 0 && lines.length === 1) return `“${line}”`;
    if (index === 0) return `“${line}`;
    if (index === lines.length - 1) return `${line}”`;
    return line;
  });
}

function fitCanvasText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  if (context.measureText(text).width <= maxWidth) return text;
  let fitted = text;
  while (fitted.length > 1 && context.measureText(`${fitted}...`).width > maxWidth) {
    fitted = fitted.slice(0, -1);
  }
  return `${fitted.trimEnd()}...`;
}

function drawLetterSpacedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  letterSpacing: number,
  align: "left" | "center" = "left",
) {
  const widths = [...text].map((char) => context.measureText(char).width);
  const totalWidth =
    widths.reduce((total, width) => total + width, 0) +
    Math.max(0, text.length - 1) * letterSpacing;
  let currentX = align === "center" ? x - totalWidth / 2 : x;
  [...text].forEach((char, index) => {
    context.fillText(char, currentX, y);
    currentX += widths[index] + letterSpacing;
  });
}

function canvasToPngBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Poster export failed."));
    }, "image/png");
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function copyTextToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("Clipboard copy failed.");
}
