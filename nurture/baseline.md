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
## 2026-10-09 weekly refresh (auto-nurture)
- Apify totalRuns: **503**（基线 100，Δ+403，几乎全为本周自检自跑 run，非有机采纳）；isPublic=true；taggedBuilds 含 latest ✅；lastRun 2026-10-09
- 有机 tool-call ≈ 0；收入 ≈ $0
- GitHub stars 0；issues/PR 近 7d = 0
- M8ven: Emerging；**Claim 待老板点击**；README 斜杠 badge → tokenized 验证行已自治修复并 push (commit de384ce)


## 2026-10-21 B4 refresh (Apify API now available)

> B4 was previously blocked: APIFY_TOKEN empty in automation sandbox. The token now
> resolves via `~/.apify/auth.json` (Apify `/users/me` → HTTP 200), so KPIs re-verified.

- **Actor:** `ghDM96xaQ9kvrsii0` · **Apify totalRuns (live):** **503** (re-verified via `GET /v2/acts/ghDM96xaQ9kvrsii0`)
- **Pricing (live pricingInfos):** PAY_PER_EVENT · mcp-validate-vat $0.0005 (EU VIES SOAP).
- **M8ven:** README badge tokenized (panstories-vies-vat-validator-mcp-1bk4uh?variant=verified) ✅ verified.
- GA4 / npm / mcpservers.org / Smithery remain boss-gated (B3/B5/B6) — see fix-attempt report.


## 2026-10-23 (Fri) weekly-light refresh
- **KPI (Apify totalRuns, live):** **503** (Δ 0 vs 2026-10-21). Flat — the combo's traffic anchor.
- **GitHub:** 0 stars / 0 open issues / 0 open PRs (public). Flat.
- **M8ven:** README badge tokenized (panstories-vies-vat-validator-mcp-1bk4uh?variant=verified) ✅ verified via live raw README curl.
- **Pricing (OBSERVATION ONLY, not changed this run — Iron Law #4):** mcp-validate-vat $0.0005 → **$0.005** effective **2026-11-06** (grandfathered), boss action via git 5799056 (2026-10-22). Corrects the stale "$0.0005" note above.
- GA4 (B5) / npm (B3) / dirs (B6) remain boss-gated. B2 (Ethics token) now RESOLVED.

## 2026-10-24 (Sat) monthly-deep Stage 0–4 refresh
- **Apify KPI (live GET):** totalRuns **503**, totalUsers **1**, totalUsers30Days **1**, publicActorRunStats30Days `TOTAL:1 / SUCCEEDED:1 / FAILED:0`. **lastRunStartedAt 2026-10-09T14:33:54Z** (15d stale). reviews 0/0.
- **pricingInfos:** 当前 `$0.0005` (started 2026-10-02) + 未来 `$0.005` (started 2026-11-06, notified 2026-10-22). minimalMaxTotalChargeUsd 0.05.
- **standby:** enabled, idleTimeoutSecs 120, memoryMbytes 512, maxTotalChargeUsd 0.05, timeoutSecs 300. taggedBuilds.latest = **1.1.2** (buildId jErq4Dia9PPVteSDe, 2026-10-09).
- **M8ven:** **B 89/100**, **Verified Publisher**, **Live Monitored** (Claim done). README badge tokenized ✅ (no fix needed).
- **trust_audit.py:** FAIL 0 / WARN 1 / PASS 16.
- **自治修复 (1.0.3, commit 14f7a0a → main):** 修 GR→EL 别名 + GB 诚实出域(VAT_NOT_IN_VIES)；36/36 测试绿、tsc 干净。**Apify 部署待 `apify push`（本环境无 CLI）**。
- **关键判断：** 赛道已拥挤(~15 竞品)，核心问题不是收录而是**价值主张未穿透 + 功能楔子缺失**(service-status/bulk/consultation number)。Top-4 决策：C1(llms.txt+drift, RICE 18) > A1(service-status, 9) = A3(bulk, 9) > A2(consultation, 6)。
- preflight drift: README tagline / actor.json tools:billable 文案 / **llms.txt 缺失** → 3/5，列为下个 light 周期修复（C1）。

---

## 2026-10-25 (Sun) — C1 落地 + Apify push 尝试（撞账号月度用量硬上限）

- **C1 完成（commit `1e59548` → main，6 files / +226 −5）**：新增 `llms.txt`（repo 根，agent-facing：endpoint + tagline.en + 工具价格表 + 链接）；README 补三语 tagline 块（EN/简/繁）+ validate_vat 价格改两段式诚实表述（$0.0005 → 2026-11-06 起 $0.005，修正 README 超前 drift）；`.actor/actor.json` inputSchema description 列出工具名（修 tools:billable drift）+ version 1.1→1.2 供 rebuild。
- **质量闸门**：preflight **5/5 全绿**（drift 清零）；vitest **36/36**；tsc 干净；trust_audit FAIL 0 / WARN 1 / PASS 16（同上轮）。
- **环境坑（本机长期有效）**：vitest 4.1.11 在 **Git Bash 工具的小写盘符 cwd（c:）** 下必挂 —— `TypeError: Cannot read properties of undefined (reading 'config')` 在 describe 顶层（vitest 4 Windows 已知 bug：ESM 解析路径盘符大小写不匹配）。最小探针实验证明与源码无关。**解法：本仓测试一律用 PowerShell 工具跑**（大写 `C:\` cwd 即过）。
- **Apify push**：`npx apify-cli push`（CLI 无需预装，~/.apify/auth.json 凭据有效）成功创建 **version 1.2**（source 上传 OK），但 build 触发返回 **"Monthly usage hard limit exceeded"** —— 账号级月度计费硬上限，非代码问题。**source 已在 Apify，限额恢复后一键重推即上线。**
- **无损确认（push 后复核）**：pricingInfos 两条均在（$0.0005 current startedAt 10-02 + $0.005 future startedAt 2026-11-06 notified 10-22）—— Iron Law #4 无恙；actorStandby idleTimeoutSecs=120 / memoryMbytes=512 **未被动**（build 未跑，无需 SOP #24b 重设）；taggedBuilds.latest 仍 **1.1.2**（10-09 旧代码，线上暂不含 1.0.3 修复）。
- **待老板（已优化，大概率零人工）**：本账号是 **FREE plan**（月限额 $5.00），本周期用量 $5.0557/$5.00（仅超 $0.0557），周期 2026-09-25 → 10-24 23:59 UTC，**2026-10-25 08:00 GMT+8 自动重置**。已设 **one-time automation 08:05 自动重推**（reset 后跑 `npx apify-cli push` + 验证）。若届时仍失败再考虑 Console → Billing 操作。


## 2026-10-30 (Fri) weekly-light refresh
- **KPI (Apify totalRuns, live):** **503** (Δ 0 vs 2026-10-23). Flat — traffic anchor.
- **GitHub:** 0 stars / 0 open issues / 0 open PRs (public). Flat.
- **M8ven:** B 89/100 · Verified Publisher; README badge tokenized (panstories-vies-vat-validator-mcp-1bk4uh?variant=verified) ✅ verified via live m8ven.ai curl.
- **Pricing:** mcp-validate-vat **$0.005** (eff 2026-11-06, boss action 10-21) — no change this run. Iron Law #4 honored.
- Git this week: VAT fix 1.0.3 (GR->EL alias + honest GB out-of-VIES), C1 llms.txt + pricing prose, Apify push-blocked notes.
- Blockers: B5 awaiting boss GA4 SA drop; B6 CONFIRMED-LIVE 10-25.

---

## 2026-11-13 (Fri) monthly-deep Stage 0–4 + 部署收官（19 天零调用后的完整一轮）

**背景**：10-25 排的 Apify 重推 automation（`f500e7ea`）被 PAUSED（从未执行）→ 1.0.3 代码滞留 Apify source 19 天未上线。本轮全部收尾。

### 部署收官（全部线上实测）
- **build 1.2.1 → 1.2.2 → 1.2.3 三连**（commit `df8a76d`/`0f547e5`/`bcf3895`，期间远端有对方 10-30 weekly-light `e70b23c`，全部 rebase + 零删除校验后推）：
  1. `df8a76d` dockerfile 路径修（新版 apify-cli 要求相对 .actor/；npx 拉 latest 与上轮缓存版本行为不同）
  2. `0f547e5` serverInfo 版本 1.0.1→1.0.3（src 两处硬编码）+ root info JSON 价格 $0.0005→$0.005
  3. `bcf3895` **zod 3.25.76→4.6.7**（M8ven 1-high CVE 根因；用量极简，tsc+36/36 零痛迁移）+ server.json version 1.0.1→1.0.3
- **价格三处同步防回退**（`b49b118`）：actor.json pricingEvents 0.0005→0.005、manifest price→0.005 —— 防 push 把 11-06 已生效的 $0.005 打回旧价（Iron Law #4）。复核 pricingInfos 双记录无损。
- **线上验收（零成本）**：initialize serverInfo=**1.0.3** ✅；tools/list 四 hint 齐全 ✅；GB live=false → `VAT_NOT_IN_VIES` 诚实出域 ✅；GR → normalized `EL123456789` ✅。standby 120/512 全程无恙。
- **官方 MCP Registry 发布成功**（C4）：`mcp-publisher login github --token`（GCM PAT，org namespace 授权直接成功）+ publish → **`io.github.PanStories/vies-vat-validator-mcp` v1.0.3 在列**（registry API 实测）。家族 8 个 MCP 中 7 个已在列，Vies 补齐最后一角 → PulseMCP/Smithery/GitHub registry 聚合器将自动拉取。
- 清理：删除过时 PAUSED automation `f500e7ea`。

### KPI 与市场
- **Apify stats**：totalRuns **505**（19 天 +2 全是我的验证调用）、totalUsers **1**、lastRun 10-09、reviews 0/0 —— **有机增长仍为零，价值主张穿透问题未解**。
- **M8ven**：Grade B · Verified Publisher · Live Monitored；Tool annotations **pass**；findings 仅剩 zod 1-high（已修，待 ~daily 重扫）。
- **竞品情报（2026-11）**：vies-smoother（circuit-breaker+100 free）、vatnode（consultation number 全站核心+national fallback）、lwsdjfls/gp005/fabriken2026（Apify 三强：bulk+三态+consultation+monitor）。价格带 $0.002–$0.01，我们 $0.005 居中。**VIES `/check-status` 端点现成**（A1 可行性确认）。DE VIES uptime 40-60%（每夜 21:40-01:00 UTC 下线）是 service-status 工具的需求铁证。
- **新渠道认知**：官方 MCP Registry 是生态新枢纽（一次发布全聚合拉取）；mcpservers.org 已 LIVE（10-25）；listed_on_claude/openai=null 是下一个发现 frontier。
- 信任闸门：preflight 5/5、vitest 36/36、tsc clean、trust_audit FAIL 0/WARN 1（m8ven-publisher.txt，Claimed 态已过，不阻）。

### 决策（RICE）
Top-4：**A1 service-status (9) > A3 bulk (9) > A2 consultation number (6) = C3 中文内容 (6)**。B1 monitor-changed $0.02 待老板批（铁律 #4）。

### 环境坑新增（本机长期有效）
1. **新版 apify-cli 把 `~/.apify/auth.json` 迁移到 v2 结构**（profiles+activeProfile，token 移入 Windows 凭据管理器 `LegacyGeneric:target=<userId>.com.apify.cli.token`）→ 旧 curl 脚本读 `auth.json.token` 得空串 401。**解法：`npx apify-cli auth token` 官方命令取 token**。
2. dockerfile 字段新版 CLI 要求相对 `.actor/` 根（`Dockerfile` 而非 `.actor/Dockerfile`）。
3. python urllib 外连被沙盒 SIGTERM（偶发）→ 大数据拉取用 curl+node 管道。
4. node fetch 解析不了 `neeenja--...apify.actor` 双横线域名（Failed to parse URL）→ MCP 握手用 curl。
5. 共享仓并发依旧：commit 前 `git pull --rebase` + 零删除校验已成标准动作（本轮吃到一次远端领先）。
