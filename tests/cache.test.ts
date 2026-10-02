import { describe, it, expect } from "vitest";
import { TtlCache } from "../src/vat/cache.js";

describe("TtlCache", () => {
  it("stores and retrieves within TTL", () => {
    const c = new TtlCache<number>(60_000);
    c.set("a:b", 42);
    expect(c.get("a:b")).toBe(42);
  });

  it("returns null for missing key", () => {
    const c = new TtlCache<number>(60_000);
    expect(c.get("x:y")).toBeNull();
  });

  it("expires entries after TTL", async () => {
    const c = new TtlCache<number>(10);
    c.set("k", 1);
    expect(c.get("k")).toBe(1);
    await new Promise((r) => setTimeout(r, 25));
    expect(c.get("k")).toBeNull();
  });

  it("builds deterministic keys", () => {
    expect(TtlCache.key("fr", "123")).toBe("FR:123");
  });

  it("prunes expired entries", async () => {
    const c = new TtlCache<number>(10);
    c.set("k1", 1);
    c.set("k2", 2);
    await new Promise((r) => setTimeout(r, 25));
    const removed = c.prune();
    expect(removed).toBe(2);
    expect(c.size).toBe(0);
  });
});
