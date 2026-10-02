// Bilingual (中文 / English) VAT validation error-code table.
// This is the single source of truth for error messaging surfaced to agents
// and humans. Every tool returns one of these codes when something goes wrong.

export type ErrorSeverity = "info" | "warning" | "error";

export interface ErrorCode {
  /** Stable machine code (used in structuredContent). */
  code: string;
  severity: ErrorSeverity;
  /** 中文描述 */
  messageZh: string;
  /** English description */
  messageEn: string;
  /** 中文处理建议 */
  actionZh: string;
  /** English remediation */
  actionEn: string;
}

export const ERROR_CODES: ErrorCode[] = [
  {
    code: "VAT_OK",
    severity: "info",
    messageZh: "校验通过",
    messageEn: "Validation passed",
    actionZh: "无需处理。",
    actionEn: "No action required.",
  },
  {
    code: "VAT_FORMAT_INVALID",
    severity: "warning",
    messageZh: "VAT 号格式不符合该国规则",
    messageEn: "VAT number format does not match the country pattern",
    actionZh: "检查国家代码与号码位数/字符，去除空格后重试。",
    actionEn: "Check the country code and digit/character pattern; strip spaces and retry.",
  },
  {
    code: "VAT_VIES_INVALID",
    severity: "warning",
    messageZh: "VIES 返回该 VAT 号无效",
    messageEn: "VIES reports this VAT number as invalid",
    actionZh: "向交易对方核实 VAT 号；可能已注销或录入错误。",
    actionEn: "Verify the VAT number with the counterparty; it may be deregistered or mistyped.",
  },
  {
    code: "VIES_MS_UNAVAILABLE",
    severity: "error",
    messageZh: "成员国税务系统暂不可用",
    messageEn: "Member State service unavailable",
    actionZh: "该国税务接口临时不可用，稍后重试（建议开启缓存）。",
    actionEn: "The member state's tax interface is temporarily down; retry later (caching recommended).",
  },
  {
    code: "VIES_SERVICE_UNAVAILABLE",
    severity: "error",
    messageZh: "VIES 服务暂不可用",
    messageEn: "VIES service unavailable",
    actionZh: "欧盟 VIES 整体不可用，稍后重试。",
    actionEn: "The EU VIES service is unavailable; retry later.",
  },
  {
    code: "VIES_TIMEOUT",
    severity: "error",
    messageZh: "VIES 请求超时",
    messageEn: "VIES request timeout",
    actionZh: "网络或 VIES 响应慢，稍后重试或开启缓存。",
    actionEn: "Network or VIES response was slow; retry later or enable cache.",
  },
  {
    code: "VIES_SERVER_BUSY",
    severity: "error",
    messageZh: "VIES 服务器繁忙，请稍后重试",
    messageEn: "VIES server busy, retry later",
    actionZh: "VIES 限流，降低调用频率或依赖缓存。",
    actionEn: "VIES is rate-limited; reduce call frequency or rely on cache.",
  },
  {
    code: "VIES_INVALID_INPUT",
    severity: "error",
    messageZh: "输入参数无效",
    messageEn: "Invalid input parameters",
    actionZh: "检查 countryCode / vatNumber 是否为空或非法。",
    actionEn: "Check that countryCode / vatNumber are present and well-formed.",
  },
  {
    code: "NETWORK_ERROR",
    severity: "error",
    messageZh: "网络错误，无法连接 VIES",
    messageEn: "Network error, cannot reach VIES",
    actionZh: "检查本地网络/防火墙是否放行对 ec.europa.eu 的 HTTPS 出站。",
    actionEn: "Check local network / firewall egress to ec.europa.eu over HTTPS.",
  },
  {
    code: "SOAP_FAULT",
    severity: "error",
    messageZh: "VIES 返回未知 SOAP 错误",
    messageEn: "VIES returned an unknown SOAP fault",
    actionZh: "保留 faultstring 上报，稍后重试。",
    actionEn: "Keep the faultstring for reporting and retry later.",
  },
  {
    code: "INPUT_MISSING",
    severity: "error",
    messageZh: "缺少 VAT 号或国家代码",
    messageEn: "Missing VAT number or country code",
    actionZh: "提供 vat（如 FR123456789）或同时提供 countryCode 与 vatNumber。",
    actionEn: "Provide vat (e.g. FR123456789) or both countryCode and vatNumber.",
  },
  {
    code: "COUNTRY_UNSUPPORTED",
    severity: "error",
    messageZh: "不支持的国家代码",
    messageEn: "Unsupported country code",
    actionZh: "仅支持 EU 27 + GB + XI。",
    actionEn: "Only EU 27 + GB + XI are supported.",
  },
  {
    code: "UNKNOWN_ERROR",
    severity: "error",
    messageZh: "未知错误",
    messageEn: "Unknown error",
    actionZh: "保留原始错误信息并上报。",
    actionEn: "Retain the raw error and report it.",
  },
];

const BY_CODE = new Map(ERROR_CODES.map((e) => [e.code, e]));

export function getErrorCode(code: string): ErrorCode {
  return BY_CODE.get(code) ?? BY_CODE.get("UNKNOWN_ERROR")!;
}
