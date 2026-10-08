# KPI Baseline — VIES VAT Validator MCP

Snapshot taken: **2026-10-07 10:35 GMT+8** (repo `PanStories/vies-vat-validator-mcp`, actor `ghDM96xaQ9kvrsii0`)

> Baselines exist so Stage 4 decisions can be judged later. Re-measure on the same
> commands after any change lands.

## Traffic & revenue

| Metric | Value | How measured |
|---|---|---|
| Actor created | 2026-10-02T03:15Z | `GET /v2/acts/ghDM96xaQ9kvrsii0` |
| Total runs ever | **100** | `GET /v2/acts/{id}/runs?limit=100&desc=1` |
| Runs by day | `2026-10-02: 99`, `2026-10-03: 1` | same |
| **Last run** | **2026-10-03T15:05Z** → **4 days zero traffic** | same |
| Organic (non-self) runs | **0** — all 100 fall on the author's own test window | same |
| Runs with a charge | 1 of 40 sampled (`mcp-validate-vat: 1`) | `GET /v2/actor-runs/{runId}` |
| **PPE revenue to date** | **$0.0005** (one charged call @ $0.0005) | same |
| Platform compute cost to date | ~$0.045 (standby time, 100 runs) | `usageTotalUsd` summed |
| **Net** | **≈ −$0.045** | derived |

## Discovery surfaces

| Surface | State | Evidence |
|---|---|---|
| Apify Store | ✅ 200, public | `https://apify.com/neeenja/vies-vat-validator-mcp` |
| Actor `isPublic` | ✅ true | API |
| Categories | `DEVELOPER_TOOLS, AI, MCP_SERVERS` | API |
| Endpoint liveness | ✅ 401 without token (= alive) | `POST {endpoint}` |
| Sartbot detail page | ✅ 200 + `featured` | `https://sartbot.com/mcp/vies-vat-validator-mcp/` |
| Sartbot `llms.txt` | ✅ 2 mentions | `https://sartbot.com/llms.txt` |
| Glama | ✅ listed | `glama.ai/mcp/servers/PanStories/vies-vat-validator-mcp` |
| Smithery | ❌ 404 | `smithery.ai/server/vies-vat-validator-mcp` |
| mcpservers.org | ❌ 404 | `mcpservers.org/servers/PanStories/vies-vat-validator-mcp` |
| PulseMCP | ❌ 404 | `pulsemcp.com/servers/vies-vat-validator` |
| mcp.so | ❌ 403 (not listed / blocked) | `mcp.so/server/vies-vat-validator-mcp` |
| npm `vies-vat-validator-mcp` | ❌ **name is free (404)** | registry.npmjs.org |

## GitHub

| Metric | Value |
|---|---|
| Stars / forks / watchers | **0 / 0 / 0** |
| Open issues | 0 |
| Releases | **0** |
| Last push | 2026-10-04 |
| Topics | `apify, eu, mcp, model-context-protocol, tax, validation, vat, vies` |
| CI | ✅ green since `ecf457d` (2026-10-03), 1 success / 5 failure history |

## Competitor baseline (measured 2026-10-07)

| Competitor | Transport | Auth | Tools | Free headroom | Note |
|---|---|---|---|---|---|
| vatnode-mcp | stdio (npx) | key for 1 of 5 tools | 5 | 4 tools fully offline | **498 npm downloads/week**; ships `SKILL.md` + `llms.txt` + `agents.txt` |
| eurovalidate-mcp | stdio (uvx) | key, 100 req/mo | 7 | `check_service_status` is keyless | covers IBAN/EORI/LEI too; accepts **GR and EL** |
| GoodVat | remote HTTP | **none — initialize returns 200 open** | 2 | open | zero-friction discovery |
| eu-vat-validator (Apify) | remote HTTP | Apify token (401 without) | ? | — | bulk validation; Apify-gated like ours |

## Known correctness defects found during this pass

1. **GB (United Kingdom) is reported as INVALID via VIES.** VIES does not cover GB
   post-Brexit (HMRC is the authority). Live proof:
   - `POST https://ec.europa.eu/taxation_customs/vies/rest-api/check-vat-number`
     `{"countryCode":"GB","vatNumber":"123456789"}` → `{"actionSucceed":false,"errorWrappers":[{"error":"INVALID_INPUT"}]}`
   - Our `validate_vat` with `countryCode:"GB"` returns `formatValid:true`,
     `viesValid:false`, `source:"vies"`, error `VIES_INVALID_INPUT`, and renders
     "VIES 实查: ❌ 无效 INVALID / 结论: ❌ 未通过 FAILED".
   - Impact: a cross-border seller is told a **valid** UK VAT number is invalid,
     and the remediation text ("check your parameters") sends them nowhere.
     This is the exact failure mode compliance guides warn about
     ("a technical outage is not a rejection").
   - `XI` (Northern Ireland) **is** covered by VIES and behaves correctly.
2. **`GR` is rejected with `COUNTRY_UNSUPPORTED`.** Greece is `EL` in VIES but `GR`
   in ISO 3166; users and LLMs type `GR`. VIES itself answers `INVALID_INPUT` for `GR`.
   eurovalidate-mcp accepts both. One-line alias fixes it.
3. **No `check_service_status` tool.** When VIES is down (observed live: `DE` returned
   `MS_UNAVAILABLE` during this pass) there is no way for an agent to distinguish
   "down" from "invalid". Competitors expose this.

## Measurement commands (re-run verbatim)

```bash
# runs + charging
curl -s "https://api.apify.com/v2/acts/ghDM96xaQ9kvrsii0/runs?token=$APIFY_TOKEN&limit=100&desc=1"

# upstream health per country (official REST, no key)
curl -s -X POST "https://ec.europa.eu/taxation_customs/vies/rest-api/check-vat-number" \
  -H "Content-Type: application/json" -d '{"countryCode":"DE","vatNumber":"136695976"}'

# endpoint liveness (401 = alive)
curl -s -o /dev/null -w "%{http_code}\n" -X POST \
  "https://neeenja--vies-vat-validator-mcp.apify.actor/mcp" \
  -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```
