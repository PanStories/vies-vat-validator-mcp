# Changelog

## 1.0.1 — 2026-10-09
M8ven Trust Index 合规修复（不改变工具行为与定价）。

### Added
- **Tool annotations**：四个工具全部显式声明 `readOnlyHint` / `destructiveHint` /
  `idempotentHint` / `openWorldHint` 四个布尔 hint（OpenAI MCP 目录的硬性要求，缺失即拒）。
  按实际行为标注：只有 `validate_vat` 会出网调 VIES，故 `openWorldHint: true`；
  `check_vat_format` / `list_supported_countries` / `get_error_codes` 为纯本地，`openWorldHint: false`。
- **`SECURITY.md`**：支持版本、漏洞报告渠道，以及安全姿态说明（read-only 设计、不外泄 secret、
  不暴露 stack trace、`npm ci` 供应链锁定）。
- **工具级测试** `tests/tools.test.ts`：9 例（4 正例 + 5 负例）直接调用注册后的工具 handler，
  覆盖全部 4 个工具；全离线、不出网、不计费。

### Changed
- **prod CVE 清零**：修复 6 个 high（`apify-client → proxy-agent → pac-proxy-agent → get-uri → basic-ftp`
  传递链，根因为 `basic-ftp` ReDoS `GHSA-c475-qrg2-pj4r`）。该链仅服务 proxy/FTP，本服务从不使用，
  但仍照修以消除扫描器告警。采用单点 `overrides: { basic-ftp: ^6.2.2 }`，`npm audit --omit=dev` 现为 0。
- README 顶部补充显式版本号与 trust 声明。

### 备注
- 工具集合、输入参数、返回结构、PPE 定价（`$0.0005`/live 校验）均未变化，向后兼容。

## 1.0.0 — 2026-10-02
- Initial MVP release.
- `validate_vat`: free local format pre-check + optional live VIES verification, free TTL cache, structured + bilingual error output.
- `check_vat_format`: pure local regex format validation (no network).
- `list_supported_countries`, `get_error_codes` tools.
- Resources: `vat://error-codes`, `vat://supported-countries`, `vat://spec`.
- Prompts: `vat_compliance_guide`, `explain_vat_result`.
- Coverage: EU 27 + GB + XI.
- Bilingual (中/EN) error-code table with remediation.
- Apify Pay-Per-Event packaging: free format/error/country tools, ¥0.0005 / live validation event.
- Zero heavy deps: hand-built SOAP envelope, regex response parsing.
