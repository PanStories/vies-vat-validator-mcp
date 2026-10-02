// Free, in-process TTL cache for VIES results.
// Reduces repeated live calls (VIES is rate-limited and flaky) and powers the
// "free cache" value proposition. No external dependency.

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class TtlCache<T> {
  private store = new Map<string, CacheEntry<T>>();
  private readonly ttlMs: number;

  constructor(ttlMs: number = 24 * 60 * 60 * 1000) {
    this.ttlMs = ttlMs;
  }

  static key(countryCode: string, vatNumber: string): string {
    return `${countryCode.toUpperCase()}:${vatNumber.toUpperCase()}`;
  }

  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key: string, value: T): void {
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  /** Remove expired entries. */
  prune(): number {
    const now = Date.now();
    let removed = 0;
    for (const [k, v] of this.store) {
      if (now > v.expiresAt) {
        this.store.delete(k);
        removed++;
      }
    }
    return removed;
  }

  get size(): number {
    return this.store.size;
  }
}

// Shared default cache instance (per process).
export const viesCache = new TtlCache<Record<string, unknown>>();
