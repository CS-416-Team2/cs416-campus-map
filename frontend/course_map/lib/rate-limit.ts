import { NextRequest, NextResponse } from "next/server";

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up stale entries every 60 seconds
const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  const cutoff = now - windowMs;
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}

/**
 * In-memory sliding-window rate limiter.
 *
 * Returns `null` if the request is allowed, or a 429 NextResponse
 * if the client has exceeded the limit.
 *
 * @param request  - incoming NextRequest (uses x-forwarded-for / ip)
 * @param maxRequests - max requests per window (default 100)
 * @param windowMs    - window size in ms (default 60 000 = 1 min)
 */
export function rateLimit(
  request: NextRequest,
  maxRequests = 100,
  windowMs = 60_000,
): NextResponse | null {
  cleanup(windowMs);

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const now = Date.now();
  const cutoff = now - windowMs;

  let entry = store.get(ip);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(ip, entry);
  }

  // Drop timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= maxRequests) {
    const retryAfterSec = Math.ceil(
      (entry.timestamps[0] + windowMs - now) / 1000,
    );
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSec) },
      },
    );
  }

  entry.timestamps.push(now);
  return null; // allowed
}
