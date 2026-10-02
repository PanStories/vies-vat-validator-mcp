// Minimal, dependency-free SOAP client for the EU VIES checkVat service.
// We hand-build the SOAP 1.1 envelope and extract the fixed response fields
// with namespace-agnostic regexes (no XML parser dependency needed).

export interface ViesResult {
  countryCode: string;
  vatNumber: string;
  requestDate: string | null;
  valid: boolean;
  name: string | null;
  address: string | null;
}

export type ViesOutcome =
  | { ok: true; result: ViesResult }
  | { ok: false; error: string; faultString?: string };

export interface ViesOptions {
  /** Use the VIES test service (deterministic responses for known inputs). */
  test?: boolean;
  /** Request timeout in ms. */
  timeoutMs?: number;
  /** Injectable fetch (for tests). Defaults to globalThis.fetch. */
  fetchImpl?: typeof fetch;
}

const LIVE_URL = "https://ec.europa.eu/taxation_customs/vies/services/checkVatService";
const TEST_URL = "https://ec.europa.eu/taxation_customs/vies/services/checkVatTestService";

function buildEnvelope(countryCode: string, vatNumber: string): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" ',
    'xmlns:urn="urn:ec.europa.eu:taxud:vies:services:checkVat:types">',
    "<soapenv:Body>",
    "<urn:checkVat>",
    `<urn:countryCode>${escapeXml(countryCode)}</urn:countryCode>`,
    `<urn:vatNumber>${escapeXml(vatNumber)}</urn:vatNumber>`,
    "</urn:checkVat>",
    "</soapenv:Body>",
    "</soapenv:Envelope>",
  ].join("");
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Namespace-agnostic tag extraction. */
function extractTag(xml: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = xml.match(re);
  if (!m) return null;
  const txt = m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
  return txt === "" ? null : txt;
}

/** Map a VIES SOAP faultstring to our internal error code. */
export function mapFault(faultString: string): string {
  const f = faultString.toUpperCase();
  if (f.includes("MS_UNAVAILABLE")) return "VIES_MS_UNAVAILABLE";
  if (f.includes("SERVICE_UNAVAILABLE")) return "VIES_SERVICE_UNAVAILABLE";
  if (f.includes("TIMEOUT")) return "VIES_TIMEOUT";
  if (f.includes("SERVER_BUSY")) return "VIES_SERVER_BUSY";
  if (f.includes("INVALID_INPUT")) return "VIES_INVALID_INPUT";
  return "SOAP_FAULT";
}

/**
 * Live VIES check. Never throws — returns a typed outcome instead.
 */
export async function checkVatLive(
  countryCode: string,
  vatNumber: string,
  opts: ViesOptions = {},
): Promise<ViesOutcome> {
  const fetchFn = opts.fetchImpl ?? globalThis.fetch;
  if (!fetchFn) {
    return { ok: false, error: "NETWORK_ERROR" };
  }
  const url = opts.test ? TEST_URL : LIVE_URL;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 10000);

  try {
    const resp = await fetchFn(url, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: '""',
      },
      body: buildEnvelope(countryCode, vatNumber),
      signal: controller.signal,
    });

    const text = await resp.text();

    if (text.includes("faultstring") || resp.status >= 500) {
      const faultString = extractTag(text, "faultstring") ?? "UNKNOWN";
      return { ok: false, error: mapFault(faultString), faultString };
    }

    const result: ViesResult = {
      countryCode: extractTag(text, "countryCode") ?? countryCode,
      vatNumber: extractTag(text, "vatNumber") ?? vatNumber,
      requestDate: extractTag(text, "requestDate"),
      valid: extractTag(text, "valid") === "true",
      name: extractTag(text, "name"),
      address: extractTag(text, "address"),
    };
    return { ok: true, result };
  } catch (err: unknown) {
    const e = err as { name?: string };
    if (e?.name === "AbortError") {
      return { ok: false, error: "VIES_TIMEOUT" };
    }
    return { ok: false, error: "NETWORK_ERROR" };
  } finally {
    clearTimeout(timer);
  }
}
