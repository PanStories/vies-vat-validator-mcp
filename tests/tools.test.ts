/**
 * Tool-level tests: invoke the *registered* MCP tool handlers directly
 * (via the SDK's internal registered-tools map) so that M8ven's
 * "tools referenced in tests" signal and OpenAI's 5-positive / 3-negative
 * test-case requirement are satisfied. These run fully offline:
 *  - charge() is a safe local no-op when no APIFY_TOKEN is present
 *  - validate_vat is exercised with live:false (format-only path, no network)
 */
import { describe, it, expect } from "vitest";
import { createMcpServer } from "../src/mcp/server.js";

// Reach into the SDK's registered-tools store (runtime-only, private).
type RegisteredTool = { handler: (args: any, extra: any) => any };
function getTool(name: string): RegisteredTool {
  const server = createMcpServer();
  const reg = (server as any)._registeredTools as Record<string, RegisteredTool>;
  const t = reg[name];
  if (!t) throw new Error(`tool not registered: ${name}`);
  return t;
}

async function callTool(name: string, args: any) {
  const res = await getTool(name).handler(args, {});
  return res.structuredContent ?? {};
}

describe("validate_vat (live:false -> format-only, no network)", () => {
  it("POSITIVE: accepts a well-formed FR number by prefix", async () => {
    const r = await callTool("validate_vat", { vat: "FR123456789", live: false });
    expect(r.formatValid).toBe(true);
    expect(r.countryCode).toBe("FR");
    expect(r.vatNumber).toBe("123456789");
  });

  it("POSITIVE: accepts split countryCode + vatNumber", async () => {
    const r = await callTool("validate_vat", { countryCode: "DE", vatNumber: "136695976", live: false });
    expect(r.formatValid).toBe(true);
    expect(r.countryCode).toBe("DE");
  });

  it("NEGATIVE: rejects when both inputs are empty", async () => {
    const r = await callTool("validate_vat", { live: false });
    expect(r.formatValid).toBe(false);
    expect(r.error?.code).toBe("INPUT_MISSING");
  });

  it("NEGATIVE: rejects a malformed FR number (too short)", async () => {
    const r = await callTool("validate_vat", { vat: "FR123", live: false });
    expect(r.formatValid).toBe(false);
    expect(r.error?.code).toBe("VAT_FORMAT_INVALID");
  });
});

describe("check_vat_format (pure local)", () => {
  it("POSITIVE: validates a valid IT number", async () => {
    const r = await callTool("check_vat_format", { vat: "IT12345678901" });
    expect(r.formatValid).toBe(true);
    expect(r.countryCode).toBe("IT");
  });

  it("POSITIVE: normalizes a spaced number", async () => {
    const r = await callTool("check_vat_format", { vat: "DE 136 695 976" });
    expect(r.formatValid).toBe(true);
    expect(r.normalized).toBe("DE136695976");
  });

  it("NEGATIVE: flags an invalid country code", async () => {
    const r = await callTool("check_vat_format", { countryCode: "ZZ", vatNumber: "123" });
    expect(r.formatValid).toBe(false);
  });
});

describe("list_supported_countries (pure local)", () => {
  it("POSITIVE: returns the country table with a non-empty count", async () => {
    const r = await callTool("list_supported_countries", {});
    expect(Array.isArray(r.countries)).toBe(true);
    expect(r.countries.length).toBeGreaterThan(20);
  });
});

describe("get_error_codes (pure local)", () => {
  it("POSITIVE: returns the bilingual error table", async () => {
    const r = await callTool("get_error_codes", {});
    expect(Array.isArray(r.errors)).toBe(true);
    expect(r.errors.length).toBeGreaterThan(0);
    // every error must carry both language messages + an action
    for (const e of r.errors as any[]) {
      expect(e.messageZh).toBeTruthy();
      expect(e.messageEn).toBeTruthy();
      expect(e.actionEn).toBeTruthy();
    }
  });
});
