/**
 * In-memory rate limiter for the webhook endpoint.
 *
 * In production, replace with Vercel KV or Redis for persistence across
 * serverless cold starts. This in-memory map works for a single Lambda
 * but resets on cold starts.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}, 60_000);

/**
 * Check if a key (IP or address) is rate-limited.
 *
 * @param key       - Unique identifier (IP, address, etc.)
 * @param max       - Maximum allowed requests
 * @param windowMs  - Time window in milliseconds
 * @returns true if the request is allowed, false if rate-limited
 */
export function checkRateLimit(
  key: string,
  max: number = 5,
  windowMs: number = 60_000
): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= max) {
    return false;
  }

  entry.count++;
  return true;
}

/**
 * Get remaining requests for a key.
 */
export function getRemainingRequests(key: string, max: number = 5): number {
  const entry = store.get(key);
  if (!entry) return max;
  return Math.max(0, max - entry.count);
}
