"use client";

import { useCallback, useEffect, useState } from "react";
import { ENDPOINTS } from "@/constants/endpoints";
import type { Pledge } from "@/types";

const SEED_COUNT = 1_247_392;

export function usePledgeCount(pollMs = 420) {
  const [count, setCount] = useState(SEED_COUNT);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(ENDPOINTS.PLEDGES);
        if (!res.ok) return;
        const data = (await res.json()) as { count: number };
        if (!cancelled) setCount(data.count);
      } catch {
        // ignore
      }
    })();
    const id = setInterval(() => {
      setCount((c) => c + Math.floor(Math.random() * 4) + 1);
    }, pollMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [pollMs]);

  return count;
}

export function useMintPledge() {
  const [minting, setMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mint = useCallback(
    async (text: string): Promise<Pledge | null> => {
      setMinting(true);
      setError(null);
      try {
        const res = await fetch(ENDPOINTS.PLEDGES, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        if (!res.ok) throw new Error(`mint failed: ${res.status}`);
        const data = (await res.json()) as { pledge: Pledge };
        return data.pledge;
      } catch (e) {
        setError(e instanceof Error ? e.message : "mint failed");
        return null;
      } finally {
        setMinting(false);
      }
    },
    [],
  );

  return { mint, minting, error };
}
