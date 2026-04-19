"use client";

import { useCallback, useEffect, useState } from "react";
import { ENDPOINTS } from "@/constants/endpoints";
import type { Pledge } from "@/types";
import { mintPledgeOnDevnet } from "@/lib/solana/wallet";
import type { PledgeMintMetadata } from "@/lib/solana/mint";

const SESSION_LOCATION_KEY = "thisyearearth:session-location";
const SAVED_LOCATION_KEY = "thisyearearth:session-location-saved";

type PledgeMetadata = {
  name?: string | null;
  country?: string | null;
  countryCode?: string | null;
  location?: SessionLocation | null;
};

type SessionLocation = {
  country: string;
  countryCode: string;
  lat: number;
  lon: number;
};

async function getApiErrorMessage(res: Response) {
  try {
    const data = (await res.json()) as { error?: unknown };
    if (typeof data.error === "string") return data.error;
  } catch {
    // Fall through to the status-only message.
  }
  return res.statusText || `HTTP ${res.status}`;
}

export function usePledgeCount(pollMs = 30_000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadCount = async () => {
      try {
        const res = await fetch(ENDPOINTS.PLEDGES);
        if (!res.ok) return;
        const data = (await res.json()) as { count: number };
        if (!cancelled) setCount(data.count);
      } catch {
        // ignore
      }
    };

    void loadCount();
    const id = setInterval(loadCount, pollMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [pollMs]);

  return count;
}

function readSessionLocation(): SessionLocation | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_LOCATION_KEY);
  if (!raw) return null;
  try {
    const loc = JSON.parse(raw) as Partial<SessionLocation>;
    if (
      typeof loc.country !== "string" ||
      typeof loc.countryCode !== "string" ||
      typeof loc.lat !== "number" ||
      typeof loc.lon !== "number"
    ) {
      return null;
    }
    return loc as SessionLocation;
  } catch {
    return null;
  }
}

function locationKey(loc: SessionLocation) {
  return `${loc.countryCode}:${loc.lat.toFixed(4)}:${loc.lon.toFixed(4)}`;
}

async function ensureSessionLocationSaved() {
  if (typeof window === "undefined") return;
  const loc = readSessionLocation();
  if (!loc) return;

  const key = locationKey(loc);
  if (window.localStorage.getItem(SAVED_LOCATION_KEY) === key) return;

  try {
    const res = await fetch(ENDPOINTS.LOCATIONS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        country: loc.country,
        country_code: loc.countryCode,
        lat: loc.lat,
        lng: loc.lon,
      }),
    });
    if (res.ok) window.localStorage.setItem(SAVED_LOCATION_KEY, key);
  } catch {
    // Location storage should not block pledge submission.
  }
}

export function useMintPledge() {
  const [minting, setMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const postPledge = useCallback(
    async (
      text: string,
      metadata: PledgeMetadata = {},
      mintMetadata?: PledgeMintMetadata,
    ): Promise<Pledge | null> => {
      const res = await fetch(ENDPOINTS.PLEDGES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pledge_text: text,
          name: metadata.name,
          country: metadata.country,
          countryCode: metadata.countryCode,
          location: metadata.location,
          mint: mintMetadata,
        }),
      });
      if (!res.ok) {
        throw new Error(`pledge save failed: ${res.status} ${await getApiErrorMessage(res)}`);
      }
      const data = (await res.json()) as { pledge: Pledge };
      return data.pledge;
    },
    [],
  );

  const mint = useCallback(
    async (text: string, metadata: PledgeMetadata = {}): Promise<Pledge | null> => {
      setMinting(true);
      setError(null);
      let mintMetadata: PledgeMintMetadata | null = null;
      try {
        mintMetadata = await mintPledgeOnDevnet(text);
        await ensureSessionLocationSaved();
        return postPledge(text, metadata, mintMetadata);
      } catch (e) {
        const message = e instanceof Error ? e.message : "mint failed";
        setError(
          mintMetadata
            ? `Solana confirmed, but pledge save failed: ${message}`
            : message,
        );
        return null;
      } finally {
        setMinting(false);
      }
    },
    [postPledge],
  );

  const record = useCallback(
    async (text: string, metadata: PledgeMetadata = {}): Promise<Pledge | null> => {
      setMinting(true);
      setError(null);
      try {
        await ensureSessionLocationSaved();
        return postPledge(text, metadata);
      } catch (e) {
        setError(e instanceof Error ? e.message : "pledge save failed");
        return null;
      } finally {
        setMinting(false);
      }
    },
    [postPledge],
  );

  return { mint, record, minting, error };
}
