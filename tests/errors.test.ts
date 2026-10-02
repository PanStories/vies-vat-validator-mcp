import { describe, it, expect } from "vitest";
import { ERROR_CODES, getErrorCode } from "../src/errors/codes.js";

describe("error codes", () => {
  it("every error has both languages and a remediation", () => {
    for (const e of ERROR_CODES) {
      expect(e.code).toBeTruthy();
      expect(e.messageZh.length).toBeGreaterThan(0);
      expect(e.messageEn.length).toBeGreaterThan(0);
      expect(e.actionZh.length).toBeGreaterThan(0);
      expect(e.actionEn.length).toBeGreaterThan(0);
    }
  });

  it("getErrorCode falls back to UNKNOWN for unknown codes", () => {
    expect(getErrorCode("NOPE").code).toBe("UNKNOWN_ERROR");
  });

  it("includes the key VIES fault codes", () => {
    const codes = new Set(ERROR_CODES.map((e) => e.code));
    for (const expected of [
      "VAT_FORMAT_INVALID",
      "VIES_MS_UNAVAILABLE",
      "VIES_SERVICE_UNAVAILABLE",
      "VIES_TIMEOUT",
      "VIES_SERVER_BUSY",
      "VIES_INVALID_INPUT",
      "NETWORK_ERROR",
    ]) {
      expect(codes.has(expected)).toBe(true);
    }
  });
});
