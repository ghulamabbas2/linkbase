// Best-effort in-memory sliding-window limiter for abuse-prone actions
// (docs/security.md: throttle sign-in and sign-up). This is per-instance and
// resets on redeploy — in multi-instance production, replace the Map with a
// durable, shared store (e.g. Redis / Upstash).
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * Returns `true` if the request is within the limit, `false` if it should be
 * throttled. Counts one attempt per call.
 */
export function rateLimit(key: string, limit = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) return false;

  bucket.count += 1;
  return true;
}
