# Changelog

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
