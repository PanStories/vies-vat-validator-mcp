import { describe, it, expect } from "vitest";
import { parseVat, validateFormat, normalize } from "../src/vat/format.js";

describe("normalize", () => {
  it("uppercases and strips spaces", () => {
    expect(normalize(" fr 123 456 789 ")).toBe("FR123456789");
  });
});

describe("parseVat", () => {
  it("splits a prefixed VAT", () => {
    expect(parseVat("FR123456789")).toEqual({ countryCode: "FR", vatNumber: "123456789" });
  });
  it("splits a spaced prefixed VAT", () => {
    expect(parseVat("DE 123456789")).toEqual({ countryCode: "DE", vatNumber: "123456789" });
  });
  it("returns empty country when no known prefix", () => {
    expect(parseVat("123456789")).toEqual({ countryCode: "", vatNumber: "123456789" });
  });
});

describe("validateFormat", () => {
  it("accepts a well-formed FR number", () => {
    const r = validateFormat("FR", "123456789");
    expect(r.formatValid).toBe(true);
    expect(r.errorCode).toBeNull();
  });
  it("rejects a too-short FR number", () => {
    const r = validateFormat("FR", "123");
    expect(r.formatValid).toBe(false);
    expect(r.errorCode).toBe("VAT_FORMAT_INVALID");
  });
  it("rejects unsupported country", () => {
    const r = validateFormat("US", "123");
    expect(r.formatValid).toBe(false);
    expect(r.errorCode).toBe("COUNTRY_UNSUPPORTED");
  });
  it("flags missing country", () => {
    const r = validateFormat("", "123");
    expect(r.errorCode).toBe("INPUT_MISSING");
  });
  it("accepts German 9-digit number", () => {
    expect(validateFormat("DE", "123456789").formatValid).toBe(true);
  });
  it("accepts NL pattern with B", () => {
    expect(validateFormat("NL", "123456789B01").formatValid).toBe(true);
  });
  it("accepts GB 9-digit number", () => {
    expect(validateFormat("GB", "123456789").formatValid).toBe(true);
  });
});
