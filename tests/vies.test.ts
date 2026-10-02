import { describe, it, expect } from "vitest";
import { checkVatLive, mapFault } from "../src/vies/client.js";

const SUCCESS_XML = `<?xml version="1.0"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <checkVatResponse xmlns="urn:ec.europa.eu:taxud:vies:services:checkVat:types">
      <countryCode>FR</countryCode>
      <vatNumber>123456789</vatNumber>
      <requestDate>2024-01-15+01:00</requestDate>
      <valid>true</valid>
      <name>EXAMPLE SAS</name>
      <address>1 RUE DE PARIS</address>
    </checkVatResponse>
  </soap:Body>
</soap:Envelope>`;

const FAULT_XML = `<?xml version="1.0"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <soap:Fault>
      <faultcode>soap:Server</faultcode>
      <faultstring>MS_UNAVAILABLE</faultstring>
    </soap:Fault>
  </soap:Body>
</soap:Envelope>`;

function mockFetch(xml: string, status = 200) {
  return async () => ({
    status,
    text: async () => xml,
  }) as unknown as Response;
}

describe("mapFault", () => {
  it("maps known fault strings", () => {
    expect(mapFault("MS_UNAVAILABLE")).toBe("VIES_MS_UNAVAILABLE");
    expect(mapFault("SERVICE_UNAVAILABLE")).toBe("VIES_SERVICE_UNAVAILABLE");
    expect(mapFault("SERVER_BUSY")).toBe("VIES_SERVER_BUSY");
    expect(mapFault("INVALID_INPUT")).toBe("VIES_INVALID_INPUT");
    expect(mapFault("something else")).toBe("SOAP_FAULT");
  });
});

describe("checkVatLive", () => {
  it("parses a valid response", async () => {
    const res = await checkVatLive("FR", "123456789", { fetchImpl: mockFetch(SUCCESS_XML) as any });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.result.valid).toBe(true);
      expect(res.result.name).toBe("EXAMPLE SAS");
      expect(res.result.address).toBe("1 RUE DE PARIS");
      expect(res.result.countryCode).toBe("FR");
    }
  });

  it("maps a SOAP fault to an error code", async () => {
    const res = await checkVatLive("FR", "123456789", { fetchImpl: mockFetch(FAULT_XML) as any });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBe("VIES_MS_UNAVAILABLE");
      expect(res.faultString).toBe("MS_UNAVAILABLE");
    }
  });

  it("returns NETWORK_ERROR when fetch throws", async () => {
    const failing = async () => {
      throw new Error("conn refused");
    };
    const res = await checkVatLive("FR", "123456789", { fetchImpl: failing as any });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toBe("NETWORK_ERROR");
  });

  it("returns VIES_TIMEOUT on abort", async () => {
    const aborting = async () => {
      const e: any = new Error("aborted");
      e.name = "AbortError";
      throw e;
    };
    const res = await checkVatLive("FR", "123456789", { fetchImpl: aborting as any, timeoutMs: 1 });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toBe("VIES_TIMEOUT");
  });
});
