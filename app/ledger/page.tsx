import type { ReactNode } from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { SITE } from '@/config/site';
import { LargeGrain, GrainTexture } from '@/components/ui/Grain';
import { LEDGER_CSS_VARS } from '@/constants/colors';
import type { PledgeRow } from '@/lib/db/pledges';
import {
  formatLedgerDate,
  ledgerCountryLabel,
  ledgerExplorerHref,
  LEDGER_LIMIT,
  listLedgerEntries,
} from '@/lib/ledger';
import { SOLANA_NETWORK } from '@/lib/solana/mint';
import { connection } from 'next/server';

function LedgerState({
  tone = 'empty',
  heading,
  children,
}: {
  tone?: 'empty' | 'error';
  heading: string;
  children: ReactNode;
}) {
  return (
    <section className={`ew-ledger-state ew-ledger-state--${tone}`}>
      <div className="ew-ledger-state-icon" />
      <div className="ew-ledger-state-head">{heading}</div>
      <div className="ew-ledger-state-sub">{children}</div>
    </section>
  );
}

function LedgerLoading() {
  return (
    <LedgerState heading="The Ledger Is Waiting">
      The pledges are still arriving.
    </LedgerState>
  );
}

function LedgerEntry({
  pledge,
  number,
}: {
  pledge: PledgeRow;
  number: number;
}) {
  const href = ledgerExplorerHref(pledge);
  const txHash = pledge.txHash;

  return (
    <article className="ew-ledger-entry">
      <div className="ew-ledger-meta">
        <span className="ew-ledger-number">
          #{String(number).padStart(4, '0')}
        </span>
        <span className="ew-ledger-address">
          {ledgerCountryLabel(pledge)}
          <span className="ew-ledger-sep">·</span>
          {formatLedgerDate(pledge.mintedAt)}
        </span>
      </div>

      <div className="ew-ledger-entry-pledge">{pledge.pledgeText}</div>
      <div className="ew-ledger-author">{pledge.name || 'Anonymous'}</div>

      <div className="ew-ledger-entry-foot">
        <div className="ew-ledger-telemetry">
          {pledge.co2PpmAtMint ?
            <span>
              CO2{' '}
              <span className="ew-ledger-telemetry-value">
                {pledge.co2PpmAtMint}
              </span>{' '}
              PPM
            </span>
          : <span>
              NETWORK{' '}
              <span className="ew-ledger-telemetry-value">
                {pledge.mintNetwork ?? SOLANA_NETWORK}
              </span>
            </span>
          }
        </div>

        {href && txHash ?
          <a
            className="ew-ledger-verify"
            href={href}
            target="_blank"
            rel="noreferrer"
          >
            <span className="ew-ledger-arrow">↗</span>
            Verify
          </a>
        : null}
      </div>
    </article>
  );
}

async function LedgerEntries() {
  await connection();

  let pledges: PledgeRow[] | null = null;
  try {
    pledges = await listLedgerEntries(LEDGER_LIMIT);
  } catch {
    pledges = null;
  }

  if (!pledges) {
    return (
      <LedgerState tone="error" heading="Temporarily Unavailable">
        The pledges are still there. Solana is just breathing.
      </LedgerState>
    );
  }

  if (pledges.length === 0) {
    return (
      <LedgerState heading="The Ledger Is Waiting">
        Be the first to seal a pledge.
      </LedgerState>
    );
  }

  return (
    <>
      <section className="ew-ledger-entries" aria-label="Minted pledges">
        {pledges.map((pledge, index) => (
          <LedgerEntry
            key={pledge.id}
            pledge={pledge}
            number={pledges.length - index}
          />
        ))}
      </section>
      <div className="ew-ledger-end">
        End of record · {pledges.length.toLocaleString()} shown
      </div>
    </>
  );
}

async function LedgerCount() {
  await connection();

  let count: number | null = null;
  try {
    const pledges = await listLedgerEntries(LEDGER_LIMIT);
    count = pledges.length;
  } catch {
    count = null;
  }

  return (
    <span className="ew-ledger-count-number">
      {count === null ? '—' : count.toLocaleString()}
    </span>
  );
}

export default function LedgerPage() {
  return (
    <main className="ew-ledger-shell" style={LEDGER_CSS_VARS}>
      <div className="ew-ledger-fog" aria-hidden="true">
        <LargeGrain opacity={0.12} />
        <GrainTexture opacity={0.05} />
      </div>
      <div className="ew-ledger-page" data-screen-label="The Ledger">
        <nav className="ew-ledger-nav" aria-label="Ledger navigation">
          <div>
            <span className="ew-ledger-dot" />
            {SITE.domain}
          </div>
          <Link href="/">← Wrapped</Link>
        </nav>

        <header className="ew-ledger-lede">
          <div className="ew-ledger-mark">the</div>
          <h1 className="ew-ledger-title">The Ledger</h1>
          <div className="ew-ledger-bar" />
          <div className="ew-ledger-sub">
            Pledges sealed to Solana
            <span className="ew-ledger-sep">·</span>
            Earth Day MMXXVI
            <span className="ew-ledger-sep">·</span>
            <span className="ew-ledger-permanent">permanent</span>
          </div>
          <div className="ew-ledger-count">
            <span className="ew-ledger-live" />
            <Suspense
              fallback={<span className="ew-ledger-count-number">—</span>}
            >
              <LedgerCount />
            </Suspense>
            <span>Entries</span>
          </div>
        </header>

        <Suspense fallback={<LedgerLoading />}>
          <LedgerEntries />
        </Suspense>

        <footer className="ew-ledger-foot">
          <div className="ew-ledger-brand">{SITE.domain}</div>
          <Link className="ew-ledger-cta" href="/">
            <span className="ew-ledger-arrow">←</span>
            Write Your Pledge
          </Link>
        </footer>
      </div>
    </main>
  );
}
