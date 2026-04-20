import { NextResponse, type NextRequest } from "next/server";

type RateLimitConfig = {
  scope: string;
  windowMs: number;
  max: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number };

// Instance-local protection: useful against bursts, but not a durable
// cross-region quota for serverless scale-out.
const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 5_000;

export const PLEDGE_WRITE_RATE_LIMIT: RateLimitConfig = {
  scope: "pledges:write",
  windowMs: 10 * 60 * 1000,
  max: 6,
};

export const LOCATION_WRITE_RATE_LIMIT: RateLimitConfig = {
  scope: "locations:write",
  windowMs: 10 * 60 * 1000,
  max: 30,
};

function clientKey(req: NextRequest, scope: string) {
  const forwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip =
    forwardedFor ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";
  return `${scope}:${ip}`;
}

function pruneExpiredBuckets(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }

  if (buckets.size <= MAX_BUCKETS) return;
  for (const key of buckets.keys()) {
    buckets.delete(key);
    if (buckets.size <= MAX_BUCKETS) return;
  }
}

export function checkRateLimit(
  req: NextRequest,
  config: RateLimitConfig,
): RateLimitResult {
  const now = Date.now();
  pruneExpiredBuckets(now);

  const key = clientKey(req, config.scope);
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + config.windowMs });
    return { ok: true };
  }

  if (bucket.count >= config.max) {
    return {
      ok: false,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((bucket.resetAt - now) / 1000),
      ),
    };
  }

  bucket.count += 1;
  return { ok: true };
}

export function rateLimitResponse(result: Extract<RateLimitResult, { ok: false }>) {
  return NextResponse.json(
    { error: "too many requests" },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfterSeconds),
      },
    },
  );
}
