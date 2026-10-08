# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x   | ✅        |

## Reporting a Vulnerability

If you discover a security issue in **VIES VAT Validator MCP**, please report it
responsibly:

- **Email:** security@panstories.com
- **GitHub:** open a private security advisory at
  https://github.com/PanStories/vies-vat-validator-mcp/security/advisories/new

Please do **not** open public issues for security vulnerabilities. We aim to
acknowledge reports within **72 hours** and provide a remediation timeline within
**7 days**.

## Security Posture

- **Read-only by design.** Every tool is declared `readOnlyHint: true` /
  `destructiveHint: false`. `validate_vat` performs a live lookup against the
  official EU VIES service but never mutates any state, user data, or remote
  system.
- **No secret exfiltration.** The server requires only an Apify token (when
  hosted on Apify) to bill Pay-Per-Event usage. No third-party API keys, wallet
  private keys, or database credentials are read or transmitted.
- **No stack traces to clients.** Network and parsing errors from the upstream
  VIES service are mapped to structured bilingual error codes
  (`NETWORK_ERROR`, `VIES_TIMEOUT`, `VIES_MS_UNAVAILABLE`, …) and never leak
  internal stack traces or secrets into tool responses.
- **Supply chain.** Dependencies are pinned via `package-lock.json` and
  installed with `npm ci` in CI. `npm audit` runs on every change.
- **Self-healing errors.** Every error returned to the model carries an
  actionable `actionEn` / `actionZh` field so an agent can retry or escalate
  without human intervention.
