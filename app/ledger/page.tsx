import { FONTS, PALETTE } from "@/constants/colors";
import { SITE } from "@/config/site";
import { listMintedPledges } from "@/lib/db/pledges";
import { getSolanaDevnetExplorerUrl } from "@/lib/solana/mint";
import { connection } from "next/server";
import { Suspense } from "react";
import type { ReactNode } from "react";

function formatDate(value: Date | string | null) {
  if (!value) return "pending";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "pending";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function shortHash(value: string) {
  return `${value.slice(0, 6)}...${value.slice(-6)}`;
}

function EmptyLedgerMessage({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        padding: "28px 0",
        borderTop: "1px solid rgba(230,214,190,0.18)",
        fontFamily: FONTS.MONO,
        fontSize: 11,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: PALETTE.ASH_DIM,
      }}
    >
      {children}
    </div>
  );
}

async function LedgerEntries() {
  await connection();
  const pledges = await listMintedPledges(100);

  if (pledges.length === 0) {
    return <EmptyLedgerMessage>No devnet proofs recorded yet.</EmptyLedgerMessage>;
  }

  return pledges.map((pledge) => {
    const txHash = pledge.txHash;
    const href =
      pledge.explorerUrl ?? (txHash ? getSolanaDevnetExplorerUrl(txHash) : null);

    return (
      <article
        key={pledge.id}
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) auto",
          gap: 18,
          alignItems: "start",
          padding: "18px 0",
          borderTop: "1px solid rgba(230,214,190,0.16)",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: FONTS.SERIF,
              fontSize: "clamp(22px, 4vw, 34px)",
              lineHeight: 1.15,
              fontStyle: "italic",
              color: PALETTE.ASH,
            }}
          >
            &ldquo;{pledge.pledgeText}&rdquo;
          </div>
          <div
            style={{
              marginTop: 10,
              fontFamily: FONTS.MONO,
              fontSize: 10,
              lineHeight: 1.8,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: PALETTE.ASH_DIM,
            }}
          >
            {pledge.name ? `Signed ${pledge.name}` : "Unsigned"} ·{" "}
            {formatDate(pledge.mintedAt)}
            {pledge.co2PpmAtMint ? ` · ${pledge.co2PpmAtMint} ppm` : ""}
          </div>
        </div>

        {href && txHash && (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            style={{
              fontFamily: FONTS.MONO,
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: PALETTE.ASH,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            TX · {shortHash(txHash)}
          </a>
        )}
      </article>
    );
  });
}

export default function LedgerPage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        padding: "56px max(24px, 6vw)",
        background: `linear-gradient(180deg, ${PALETTE.BG_TOP}, ${PALETTE.BG_BOTTOM})`,
        color: PALETTE.ASH,
      }}
    >
      <header style={{ maxWidth: 980, margin: "0 auto 42px" }}>
        <div
          style={{
            fontFamily: FONTS.MONO,
            fontSize: 10,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: PALETTE.ASH_DIM,
            marginBottom: 14,
          }}
        >
          {SITE.name} · Devnet Proof Ledger
        </div>
        <h1
          style={{
            margin: 0,
            fontFamily: FONTS.SERIF,
            fontSize: "clamp(42px, 8vw, 92px)",
            lineHeight: 0.95,
            fontStyle: "italic",
            fontWeight: 400,
            letterSpacing: 0,
          }}
        >
          Pledges minted
          <br />
          to Solana.
        </h1>
      </header>

      <section
        style={{
          maxWidth: 980,
          margin: "0 auto",
          display: "grid",
          gap: 10,
        }}
      >
        <Suspense fallback={<EmptyLedgerMessage>Loading devnet proofs.</EmptyLedgerMessage>}>
          <LedgerEntries />
        </Suspense>
      </section>
    </main>
  );
}
