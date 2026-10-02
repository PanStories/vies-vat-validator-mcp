import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { COUNTRIES, getCountry } from "../data/countries.js";
import { ERROR_CODES, getErrorCode } from "../errors/codes.js";
import { parseVat, validateFormat, normalize } from "../vat/format.js";
import { viesCache } from "../vat/cache.js";
import { checkVatLive } from "../vies/client.js";
import { charge } from "./charge.js";

export const SERVER_NAME = "vies-vat-validator-mcp";
export const SERVER_VERSION = "1.0.0";

export type ValidationSource = "format-only" | "cache" | "vies";

export interface ErrorView {
  code: string;
  severity: string;
  messageZh: string;
  messageEn: string;
  actionZh: string;
  actionEn: string;
}

export interface ValidationPayload {
  [key: string]: unknown;
  valid: boolean | null;
  formatValid: boolean;
  viesValid: boolean | null;
  countryCode: string;
  vatNumber: string;
  name: string | null;
  address: string | null;
  requestDate: string | null;
  error: ErrorView | null;
  source: ValidationSource;
  note?: string;
}

function errView(code: string): ErrorView {
  const e = getErrorCode(code);
  return {
    code: e.code,
    severity: e.severity,
    messageZh: e.messageZh,
    messageEn: e.messageEn,
    actionZh: e.actionZh,
    actionEn: e.actionEn,
  };
}

function payload(p: Partial<ValidationPayload> & { source: ValidationSource }): ValidationPayload {
  return {
    valid: p.valid ?? null,
    formatValid: p.formatValid ?? false,
    viesValid: p.viesValid ?? null,
    countryCode: p.countryCode ?? "",
    vatNumber: p.vatNumber ?? "",
    name: p.name ?? null,
    address: p.address ?? null,
    requestDate: p.requestDate ?? null,
    error: p.error ?? null,
    source: p.source,
    note: p.note,
  };
}

function toMarkdown(p: ValidationPayload): string {
  const lines: string[] = [];
  lines.push(`# VAT 校验结果 / VAT Validation Result`);
  lines.push("");
  lines.push(`- **国家代码 Country:** ${p.countryCode || "—"}`);
  lines.push(`- **税号 VAT:** ${p.countryCode}${p.vatNumber}`);
  lines.push(`- **格式校验 Format:** ${p.formatValid ? "✅ 合规 OK" : "❌ 不合规 INVALID"}`);
  if (p.viesValid !== null) {
    lines.push(`- **VIES 实查 Live:** ${p.viesValid ? "✅ 有效 VALID" : "❌ 无效 INVALID"}`);
  }
  if (p.valid !== null) {
    lines.push(`- **结论 Conclusion:** ${p.valid ? "✅ 通过 PASSED" : "❌ 未通过 FAILED"}`);
  }
  lines.push(`- **数据来源 Source:** ${p.source}`);
  if (p.name) lines.push(`- **名称 Name:** ${p.name}`);
  if (p.address) lines.push(`- **地址 Address:** ${p.address}`);
  if (p.requestDate) lines.push(`- **查询时间 Checked:** ${p.requestDate}`);
  if (p.note) lines.push(`- **备注 Note:** ${p.note}`);
  if (p.error) {
    lines.push("");
    lines.push(`## 错误 / Error: \`${p.error.code}\` (${p.error.severity})`);
    lines.push(`- 中文: ${p.error.messageZh}`);
    lines.push(`- EN: ${p.error.messageEn}`);
    lines.push(`- 建议(中): ${p.error.actionZh}`);
    lines.push(`- Action: ${p.error.actionEn}`);
  }
  return lines.join("\n");
}

function toolResult(p: ValidationPayload) {
  return {
    content: [{ type: "text" as const, text: toMarkdown(p) }],
    structuredContent: p,
  };
}

export function createMcpServer(): McpServer {
  const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION });

  // ---- Tool: validate_vat ----
  server.tool(
    "validate_vat",
    "校验 VAT / 税务识别号：先做免费本地格式校验，再按需调用欧盟官方 VIES 接口核验真实性。Validate a VAT number: free local format check, then optional live VIES verification.",
    {
      vat: z.string().optional().describe("完整 VAT 号，可含国家前缀，如 FR123456789 / Full VAT incl. country prefix"),
      countryCode: z.string().optional().describe("ISO 国家代码，如 FR / 2-letter country code"),
      vatNumber: z.string().optional().describe("不含国家前缀的税号 / VAT number without country prefix"),
      useCache: z.boolean().default(true).describe("是否使用免费 TTL 缓存（默认 24h）/ use free TTL cache"),
      live: z.boolean().default(true).describe("是否在格式合规后调用 VIES 实查 / call live VIES after format check"),
    },
    async (args) => {
      let cc = "";
      let num = "";
      if (args.vat && args.vat.trim() !== "") {
        const parsed = parseVat(args.vat);
        cc = parsed.countryCode;
        num = parsed.vatNumber;
      } else {
        cc = (args.countryCode ?? "").trim().toUpperCase();
        num = normalize(args.vatNumber ?? "");
      }

      if (!cc || !num) {
        return toolResult(payload({ formatValid: false, countryCode: cc, vatNumber: num, error: errView("INPUT_MISSING"), source: "format-only" }));
      }

      const fmt = validateFormat(cc, num);
      if (!fmt.formatValid) {
        return toolResult(payload({ formatValid: false, countryCode: cc, vatNumber: num, error: errView(fmt.errorCode ?? "VAT_FORMAT_INVALID"), source: "format-only" }));
      }

      if (!args.live) {
        return toolResult(payload({ formatValid: true, valid: null, countryCode: cc, vatNumber: num, source: "format-only", note: "未发起 VIES 实查 / live check skipped" }));
      }

      // Cache hit
      if (args.useCache) {
        const hit = viesCache.get(TtlKey(cc, num)) as ValidationPayload | null;
        if (hit) {
          return toolResult(payload({ ...hit, source: "cache" }));
        }
      }

      const res = await checkVatLive(cc, num);
      await charge("mcp-validate-vat");

      if (!res.ok) {
        return toolResult(payload({ formatValid: true, viesValid: false, valid: false, countryCode: cc, vatNumber: num, error: errView(res.error), source: "vies" }));
      }

      const r = res.result;
      const p = payload({
        formatValid: true,
        viesValid: r.valid,
        valid: r.valid,
        countryCode: r.countryCode,
        vatNumber: r.vatNumber,
        name: r.name,
        address: r.address,
        requestDate: r.requestDate,
        error: r.valid ? null : errView("VAT_VIES_INVALID"),
        source: "vies",
      });
      if (args.useCache) {
        viesCache.set(TtlKey(cc, num), p as unknown as Record<string, unknown>);
      }
      return toolResult(p);
    },
  );

  // ---- Tool: check_vat_format ----
  server.tool(
    "check_vat_format",
    "纯本地 VAT 号格式校验（零网络、零成本）：判断号码形态是否符合该国规则。Free local format-only check (no network).",
    {
      vat: z.string().optional().describe("完整 VAT 号，可含国家前缀 / Full VAT incl. country prefix"),
      countryCode: z.string().optional().describe("ISO 国家代码 / 2-letter country code"),
      vatNumber: z.string().optional().describe("不含前缀的税号 / VAT number without prefix"),
    },
    async (args) => {
      await charge("mcp-check-format");
      let cc = "";
      let num = "";
      if (args.vat && args.vat.trim() !== "") {
        const parsed = parseVat(args.vat);
        cc = parsed.countryCode;
        num = parsed.vatNumber;
      } else {
        cc = (args.countryCode ?? "").trim().toUpperCase();
        num = normalize(args.vatNumber ?? "");
      }
      const fmt = validateFormat(cc, num);
      const view: Record<string, unknown> = {
        formatValid: fmt.formatValid,
        countryCode: fmt.countryCode,
        vatNumber: fmt.vatNumber,
        normalized: fmt.normalized,
        pattern: fmt.pattern,
        error: fmt.errorCode ? errView(fmt.errorCode) : null,
      };
      const text = fmt.formatValid
        ? `# 格式合规 / Format OK\n- ${fmt.normalized} 符合 ${fmt.countryCode} 规则 / matches ${fmt.countryCode} pattern \`${fmt.pattern}\``
        : `# 格式不合规 / Format Invalid\n- ${fmt.normalized}\n- 错误: ${fmt.errorCode}`;
      return { content: [{ type: "text" as const, text }], structuredContent: view };
    },
  );

  // ---- Tool: list_supported_countries ----
  server.tool(
    "list_supported_countries",
    "返回支持 VAT 校验的国家列表：代码 + 母语名 + 当地 VAT 叫法（如 USt-IdNr. / Partita IVA / btw-nummer）+ 中英名。List VIES-supported countries with native name and local VAT term.",
    {},
    async () => {
      await charge("mcp-list-countries");
      const view = { countries: COUNTRIES, count: COUNTRIES.length };
      const text = [
        `# 支持的国家 / Supported Countries (${COUNTRIES.length})`,
        "",
        "| 代码 Code | 母语名 Native | 当地 VAT 叫法 Local VAT term | 中文 | English | EU |",
        "|---|---|---|---|---|---|",
        ...COUNTRIES.map((c) => `| ${c.code} | ${c.nameNative} | ${c.vatTerm} | ${c.nameZh} | ${c.nameEn} | ${c.eu ? "✅" : "—"} |`),
      ].join("\n");
      return { content: [{ type: "text" as const, text }], structuredContent: view };
    },
  );

  // ---- Tool: get_error_codes ----
  server.tool(
    "get_error_codes",
    "返回完整的中英双语 VAT 校验错误码表。Return the full bilingual error-code table.",
    {},
    async () => {
      await charge("mcp-get-error-codes");
      const view = { errors: ERROR_CODES, count: ERROR_CODES.length };
      const text = [
        `# 错误码表 / Error Codes (${ERROR_CODES.length})`,
        "",
        "| 代码 Code | 级别 | 中文 | EN |",
        "|----------|------|------|----|",
        ...ERROR_CODES.map((e) => `| \`${e.code}\` | ${e.severity} | ${e.messageZh} | ${e.messageEn} |`),
      ].join("\n");
      return { content: [{ type: "text" as const, text }], structuredContent: view };
    },
  );

  // ---- Resources ----
  server.resource("error-codes", "vat://error-codes", { description: "Bilingual VAT error-code table (JSON)" }, async (uri) => ({
    contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(ERROR_CODES, null, 2) }],
  }));

  server.resource("supported-countries", "vat://supported-countries", { description: "VIES-supported countries (JSON)" }, async (uri) => ({
    contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(COUNTRIES, null, 2) }],
  }));

  server.resource("spec", "vat://spec", { description: "Service metadata (JSON)" }, async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "application/json",
        text: JSON.stringify(
          {
            name: SERVER_NAME,
            version: SERVER_VERSION,
            dataSource: "EU VIES (free SOAP) + local format cache",
            pricing: "Pay-Per-Event (free format/error tools; paid live validation)",
            supportedCountries: COUNTRIES.length,
            errorCodes: ERROR_CODES.length,
          },
          null,
          2,
        ),
      },
    ],
  }));

  // ---- Prompts ----
  server.prompt(
    "vat_compliance_guide",
    "跨境电商 VAT 合规校验步骤指引 / Cross-border VAT compliance check guide",
    {},
    async () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text:
              "请按以下步骤核验交易对方的 VAT 号以确保跨境合规：\n" +
              "1. 用 check_vat_format 做本地格式预校验（免费、零网络）。\n" +
              "2. 格式合规后，用 validate_vat（live=true）调用欧盟官方 VIES 接口核验真实性。\n" +
              "3. 留存货号、公司名称、地址与查询时间作为合规凭证。\n" +
              "4. 若 VIES 抖动/限流，开启 useCache 复用结果或稍后重试。\n" +
              "5. 遇错误码用 get_error_codes 查双语处理建议。\n" +
              "Cross-border compliance: pre-validate format free, then verify live via VIES, retain proof, retry on flakiness, consult the bilingual error table.",
          },
        },
      ],
    }),
  );

  server.prompt(
    "explain_vat_result",
    "解读一次 VAT 校验结果 / Explain a VAT validation result",
    { result: z.string().describe("校验结果 JSON / validation result JSON") },
    async (args) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text:
              `请解读以下 VAT 校验结果，说明结论、数据来源与可追溯性，并指出是否需要 further action：\n\n${args.result}`,
          },
        },
      ],
    }),
  );

  return server;
}

function TtlKey(countryCode: string, vatNumber: string): string {
  return `${countryCode.toUpperCase()}:${vatNumber.toUpperCase()}`;
}
