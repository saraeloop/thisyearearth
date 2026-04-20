import {
  cachedCountMintedPledges,
  listMintedPledges,
  type PledgeRow,
} from "@/lib/db/pledges";
import { getSolanaDevnetExplorerUrl } from "@/lib/solana/mint";

export const LEDGER_LIMIT = 100;

export async function listLedgerEntries(limit = LEDGER_LIMIT) {
  return listMintedPledges(limit);
}

export async function countLedgerEntries() {
  return cachedCountMintedPledges();
}

export function formatLedgerDate(value: Date | string | null) {
  if (!value) return "PENDING";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "PENDING";

  const day = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(date);

  return `${day} · ${time} UTC`.toUpperCase();
}

export function shortLedgerHash(value: string) {
  return `${value.slice(0, 6)}...${value.slice(-6)}`;
}

export function ledgerCountryLabel(pledge: PledgeRow) {
  return (pledge.country ?? pledge.countryCode ?? "Earth").toUpperCase();
}

export function ledgerExplorerHref(pledge: PledgeRow) {
  return pledge.explorerUrl ?? (pledge.txHash ? getSolanaDevnetExplorerUrl(pledge.txHash) : null);
}
