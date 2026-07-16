// In-memory response cache, scoped to a single warm serverless instance.
// This is intentionally simple: on Vercel Hobby, avoiding a second AI call
// within the same warm lambda (e.g. rapid duplicate requests) costs nothing
// and needs no infrastructure. For durable, cross-instance caching, swap
// this for a Supabase-backed table (`ai_cache`) once a project is connected
// — the get/set signature below is designed to make that a drop-in change.

interface CacheEntry {
  text: string
  expiresAt: number
}

const store = new Map<string, CacheEntry>()
const DEFAULT_TTL_MS = 1000 * 60 * 30 // 30 minutes

export function getCached(key: string): string | null {
  const entry = store.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    store.delete(key)
    return null
  }
  return entry.text
}

export function setCached(key: string, text: string, ttlMs = DEFAULT_TTL_MS) {
  store.set(key, { text, expiresAt: Date.now() + ttlMs })
  // Basic unbounded-growth guard for long-lived warm instances
  if (store.size > 500) {
    const oldestKey = store.keys().next().value
    if (oldestKey) store.delete(oldestKey)
  }
}
