// Local, dependency-free VAT number format validation.
// This is the "free cache" first layer: it never hits the network and lets
// callers reject obviously malformed numbers before paying for a VIES call.

import { isSupportedCountry } from "../data/countries.js";

/**
 * Per-country VAT format regexes (after stripping spaces and the leading
 * country prefix). Patterns follow the commonly published VIES formats.
 * Format validity does NOT guarantee the number is real — only that it is
 * well-formed. Real validity is decided by VIES.
 */
// Patterns describe the VAT *number* portion only (after stripping the
// 2-letter country code), matching what VIES expects in its `vatNumber` field.
export const VAT_PATTERNS: Record<string, RegExp> = {
  AT: /^U\d{8}$/, // Austria: U + 8 digits
  BE: /^\d{10}$/, // Belgium: 10 digits
  BG: /^\d{9,10}$/, // Bulgaria: 9 or 10 digits
  CY: /^\d{8}[A-Z]$/, // Cyprus: 8 digits + letter
  CZ: /^\d{8,10}$/, // Czech Republic: 8,9,10 digits
  DE: /^\d{9}$/, // Germany: 9 digits
  DK: /^\d{8}$/, // Denmark: 8 digits
  EE: /^\d{9}$/, // Estonia: 9 digits
  EL: /^\d{9}$/, // Greece: 9 digits
  ES: /^[A-Z0-9]\d{7}[A-Z0-9]$/, // Spain: 1 char + 7 digits + 1 char
  FI: /^\d{8}$/, // Finland: 8 digits
  FR: /^([A-Z]{2})?\d{9}$/, // France: 9 digits (optionally 2 letters prefix)
  HR: /^\d{11}$/, // Croatia: 11 digits
  HU: /^\d{8}$/, // Hungary: 8 digits
  IE: /^[A-Z0-9]{8,9}$/, // Ireland: 8 or 9 chars
  IT: /^\d{11}$/, // Italy: 11 digits
  LT: /^\d{9,12}$/, // Lithuania: 9 or 12 digits
  LU: /^\d{8}$/, // Luxembourg: 8 digits
  LV: /^\d{11}$/, // Latvia: 11 digits
  MT: /^\d{8}$/, // Malta: 8 digits
  NL: /^\d{9}B\d{2}$/, // Netherlands: 9 digits + B + 2 digits
  PL: /^\d{10}$/, // Poland: 10 digits
  PT: /^\d{9}$/, // Portugal: 9 digits
  RO: /^\d{2,10}$/, // Romania: 2-10 digits
  SE: /^\d{12}$/, // Sweden: 12 digits
  SI: /^\d{8}$/, // Slovenia: 8 digits
  SK: /^\d{10}$/, // Slovakia: 10 digits
  GB: /^(?:\d{9}|\d{12}|GD\d{3}|HA\d{3})$/, // UK: 9 / 12 digits, or GD/HA + 3
  XI: /^(?:\d{9}|\d{12})$/, // Northern Ireland: 9 or 12 digits
};

export interface ParsedVat {
  countryCode: string;
  vatNumber: string;
}

/**
 * Normalize a raw VAT string: trim, uppercase, collapse internal spaces.
 */
export function normalize(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, "");
}

/**
 * Split a user-supplied VAT string into country code + number.
 * Accepts "FR123456789", "FR 123456789", or already-split inputs.
 * Returns null countryCode if no 2-letter prefix is detected.
 */
export function parseVat(input: string): ParsedVat {
  const raw = normalize(input);
  // Leading 2-letter country code, only if it looks like a known pattern start.
  const m = raw.match(/^([A-Z]{2})(.*)$/);
  if (m && isSupportedCountry(m[1])) {
    return { countryCode: m[1], vatNumber: m[2] };
  }
  return { countryCode: "", vatNumber: raw };
}

export interface FormatResult {
  formatValid: boolean;
  countryCode: string;
  vatNumber: string;
  normalized: string;
  pattern: string | null;
  errorCode: string | null;
}

/**
 * Validate the *format* of a VAT number for a given country. Pure / free.
 */
export function validateFormat(countryCode: string, vatNumber: string): FormatResult {
  const cc = (countryCode ?? "").trim().toUpperCase();
  const num = normalize(vatNumber ?? "");
  const normalized = cc ? `${cc}${num}` : num;

  if (!cc) {
    return {
      formatValid: false,
      countryCode: cc,
      vatNumber: num,
      normalized,
      pattern: null,
      errorCode: "INPUT_MISSING",
    };
  }
  if (!isSupportedCountry(cc)) {
    return {
      formatValid: false,
      countryCode: cc,
      vatNumber: num,
      normalized,
      pattern: null,
      errorCode: "COUNTRY_UNSUPPORTED",
    };
  }
  const pattern = VAT_PATTERNS[cc];
  const patternStr = pattern ? pattern.source : null;
  const ok = pattern ? pattern.test(num) : false;
  return {
    formatValid: ok,
    countryCode: cc,
    vatNumber: num,
    normalized,
    pattern: patternStr,
    errorCode: ok ? null : "VAT_FORMAT_INVALID",
  };
}
