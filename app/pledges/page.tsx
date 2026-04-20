import type { ReactNode } from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { connection } from 'next/server';
import { SITE } from '@/config/site';
import { LargeGrain, GrainTexture } from '@/components/ui/Grain';
import { LEDGER_CSS_VARS } from '@/constants/colors';
import {
  cachedCountTotalPledges,
  listPledges,
  type PledgeRow,
} from '@/lib/db/pledges';
import {
  formatLedgerDate,
  ledgerCountryLabel,
  LEDGER_LIMIT,
} from '@/lib/ledger';

function PledgeState({
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

function PledgesLoading() {
  return (
    <PledgeState heading="The Pledges Are Waiting">
      The record is still gathering.
    </PledgeState>
  );
}

function pledgeDate(pledge: PledgeRow) {
  return formatLedgerDate(pledge.createdAt);
}

function PledgeEntry({
  pledge,
  number,
}: {
  pledge: PledgeRow;
  number: number;
}) {
  return (
    <article className="ew-ledger-entry">
      <div className="ew-ledger-meta">
        <span className="ew-ledger-number">
          #{String(number).padStart(4, '0')}
        </span>
        <span className="ew-ledger-address">
          {ledgerCountryLabel(pledge)}
          <span className="ew-ledger-sep">·</span>
          {pledgeDate(pledge)}
        </span>
      </div>

      <div className="ew-ledger-entry-pledge">{pledge.pledgeText}</div>
      <div className="ew-ledger-author">{pledge.name || 'Anonymous'}</div>

      {pledge.co2PpmAtMint ? (
        <div className="ew-ledger-entry-foot">
          <div className="ew-ledger-telemetry" aria-label="Pledge telemetry">
            <span className="ew-ledger-telemetry-item">
              CO2{' '}
              <span className="ew-ledger-telemetry-value">
                {pledge.co2PpmAtMint} PPM
              </span>
            </span>
          </div>
        </div>
      ) : null}
    </article>
  );
}

async function PledgeEntries() {
  await connection();

  let pledges: PledgeRow[] | null = null;
  try {
    pledges = await listPledges(LEDGER_LIMIT);
  } catch {
    pledges = null;
  }

  if (!pledges) {
    return (
      <PledgeState tone="error" heading="Temporarily Unavailable">
        The pledges are still there. The record is just catching its breath.
      </PledgeState>
    );
  }

  if (pledges.length === 0) {
    return (
      <PledgeState heading="The Pledges Are Waiting">
        Be the first to show up.
      </PledgeState>
    );
  }

  return (
    <>
      <section className="ew-ledger-entries" aria-label="Public pledges">
        {pledges.map((pledge, index) => (
          <PledgeEntry
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

async function PledgeCount() {
  await connection();

  let count: number | null = null;
  try {
    count = await cachedCountTotalPledges();
  } catch {
    count = null;
  }

  return (
    <span className="ew-ledger-count-number">
      {count === null ? '—' : count.toLocaleString()}
    </span>
  );
}

export default function PledgesPage() {
  return (
    <main className="ew-ledger-shell" style={LEDGER_CSS_VARS}>
      <div className="ew-ledger-fog" aria-hidden="true">
        <LargeGrain opacity={0.12} />
        <GrainTexture opacity={0.05} />
      </div>
      <div className="ew-ledger-page" data-screen-label="The Pledges">
        <nav className="ew-ledger-nav" aria-label="Pledge navigation">
          <div>
            <span className="ew-ledger-dot" />
            Wrapped · MMXXVI
          </div>
          <Link href="/">← Wrapped</Link>
        </nav>

        <header className="ew-ledger-lede">
          <div className="ew-ledger-mark">the</div>
          <h1 className="ew-ledger-title">The Pledges</h1>
          <div className="ew-ledger-bar" />
          <div className="ew-ledger-sub">
            Everyone who showed up
            <span className="ew-ledger-sep">·</span>
            Earth Day MMXXVI
          </div>
          <div className="ew-ledger-count">
            <span className="ew-ledger-live" />
            <Suspense
              fallback={<span className="ew-ledger-count-number">—</span>}
            >
              <PledgeCount />
            </Suspense>
            <span>Entries</span>
          </div>
        </header>

        <Suspense fallback={<PledgesLoading />}>
          <PledgeEntries />
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
