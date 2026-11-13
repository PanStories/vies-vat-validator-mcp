# VIES VAT Validator MCP — 每月深度 Nurture 报告 (Stage 0–4)

**标的**：`PanStories/vies-vat-validator-mcp` (public) · Apify `ghDM96xaQ9kvrsii0` · Sartbot `vies-vat-validator-mcp`
**执行时间**：2026-11-13 (周五) · 距上次 deep 2026-10-24 整 3 周 · **跳过门控未触发**（期间 7 commits：C1×3 + weekly-light×1 + 价格同步×1 + dockerfile×1 + zod/server.json×1）
**上线状态**：**1.0.3 代码今日正式上线**（build 1.2.3，2026-11-13T11:20Z finished，GB/GR 修复线上实测生效）

---

## 一、状态总表

| 维度 | 现状 | 目标 | 状态 | 依据 |
|---|---|---|---|---|
| 代码上线 | **build 1.2.3 = 1.0.3**（GB 诚实出域 + GR→EL + serverInfo 1.0.3 线上实测） | latest = 1.0.3 | ✅ | 线上 tools/list + initialize 实测 2026-11-13 |
| 官方 MCP Registry | **已发布** `io.github.PanStories/vies-vat-validator-mcp` v1.0.3（org namespace，PAT 授权成功） | 全聚合器拉取 | ✅ | registry API 实测在列 |
| 信任/质量 (M8ven) | **Grade B · Verified Publisher · Live Monitored**；Tool annotations **pass**；**1 high = zod CVE（今日已修，待重扫）** | findings 清零 | ✅ | m8ven.ai curl 2026-11-13 |
| 采用/流量 | totalRuns **505**（19 天 +2，全是我的验证调用）、totalUsers **1**、lastRun 10-09、reviews 0/0 | 有机 users>1 | 🔴 | Apify stats 2026-11-13 |
| 定价 | **$0.005 已生效（11-06 起）**，actor.json/manifest/root-info 三处已同步；竞品带 $0.002–$0.01 | 维持 | ✅ | pricingInfos 双记录 |
| 竞品差距 | bulk（lwsdjfls/gp005 有）、consultation number（vatnode 全站核心）、service-status（vies-smoother 核心卖点）—— 三项我们仍缺 | 补楔子 | ⏸️ | Stage 2 矩阵 |
| 发现度 | 官方 Registry ✅ + Glama/LobeHub 自动 ✅ + mcpservers.org LIVE ✅ + Sartbot ✅；listed_on_claude/openai = null（未上两目录） | Claude/OpenAI 目录 | ⏸️ | M8ven + Stage 1 |
| 依赖健康 | **zod 3.25.76→4.6.7**（CVE 修复，36/36 测试兼容） | 0 high | ✅ | npm audit + M8ven finding |
| credit | 本周期 ~$0.5/$5.00（3 次 build + 验证） | <80% | ✅ | credit guard |

---

## 二、M8ven 三件套（2026-11-13 实测）

1. **评分/grade**：title `PanStories/vies-vat-validator-mcp · Grade B | M8ven`；状态 **Verified Publisher + Live Monitored**。
2. **Claim**：✅ 已闭环（无需动作）。
3. **README badge**：✅ tokenized 验证行在（`panstories-vies-vat-validator-mcp-1bk4uh?variant=verified`）。
4. **Findings（本轮新抓全）**：**1 high = `zod@3.25.76` CVE**（"Affects packages this MCP installs at runtime"）→ **今日已修**（zod 4.6.7，build 1.2.3），等 M8ven ~daily 重扫消除。**Tool annotations = pass**（线上四 hint 实测齐全，无 OpenAI 目录资格问题）。

---

## 三、本轮自治修复清单（全部已上线）

| # | 修复 | 内容 | commit |
|---|---|---|---|
| 1 | **部署收官** | 1.0.3 上线：build 1.2.1（GB/GR）→ 1.2.2（版本号）→ 1.2.3（zod） | — |
| 2 | **价格三处同步** | actor.json pricingEvents 0.0005→0.005、manifest price→0.005、root info JSON→$0.005（防 push 打回已生效价） | `b49b118` |
| 3 | **dockerfile 路径** | 新版 apify-cli 要求相对 .actor/，`.actor/Dockerfile`→`Dockerfile` | `df8a76d` |
| 4 | **serverInfo 版本** | src 两处硬编码 1.0.1→1.0.3（线上实测生效） | `0f547e5` |
| 5 | **zod CVE** | 3.25.76→4.6.7（M8ven 1-high 根因；tsc+36/36 兼容） | `bcf3895` |
| 6 | **server.json** | version 1.0.1→1.0.3 | `bcf3895` |
| 7 | **官方 MCP Registry** | `mcp-publisher login github --token`（GCM PAT）+ publish → **io.github.PanStories/vies-vat-validator-mcp v1.0.3 在列** | — |
| 8 | **清理** | 删除过时 PAUSED automation `f500e7ea`（10-25 限额重推，已被手动收官取代） | — |

**质量闸门**：vitest **36/36**（PowerShell 跑，Git Bash 盘符 bug 依旧）· tsc clean · preflight **5/5** · trust_audit FAIL 0/WARN 1/PASS 16 · M8ven findings 仅剩 zod（已修待重扫）。

---

## 四、Stage 1 信号表（2026-11-13 检索，EN+ZH）

| # | 结论 | 证据 URL | 日期 | 可信度 | 已验证 |
|---|---|---|---|---|---|
| S1 | VAT MCP 赛道 15+：vies-smoother（SLA+circuit-breaker+100 free lookups）、vatnode-mcp（consultation）、eu-company-mcp（9 工具）、ENTIA（5.5M 实体）、goodvat、eurovalidate | glama.ai/lobehub.com | 2026-11 | 🟢 | 已搜 |
| S2 | 免费层成标配：vies-smoother 100 lookups、ENTIA 100 req/day、eu-company-mcp 免 key | glama.ai/mcp.pub | 2026-11 | 🟢 | 已搜 |
| S3 | Apify 竞品全面武装：lwsdjfls（bulk+consultation+三态+per-country gate/backoff 详表）、gp005（$0.004/validate+monitor $0.02）、fabriken2026（$0.01+receipt+GDPR-by-design）、wsystem（x402 USDC） | apify.com 各页 | 2026-11 | 🟢 | 已搜 |
| S4 | ViDA 2026 密集落地：BE 2026-01 已生效、FR 2026-09 已启动、PL KSeF 2026-02 大公司、DE 2027/2028；EU 2030/2035 | kpmg/delivvo/vbsmarketing | 2026 | 🟢 | 已搜 |
| S5 | 定价带 $0.002–$0.01/check（apifyforge $0.002、1Lookup $0.01、fabriken2026 $0.01、vatnode overage €0.015–0.025）；**我们 $0.005 居中** | 各站点 | 2026-11 | 🟢 | 已搜 |
| S6 | VIES 可靠性硬数据：aggregate 97.96% 但国别分化；**DE 40–60% uptime**（apifyforge）、DE 每夜 21:40–01:00 UTC 下线 + IE 周一晚（lwsdjfls 实测）；官方 11-07 维护窗口公告 | vatnode.dev blog/apify.com/ec.europa.eu | 2026-11 | 🟢 | 已搜 |
| S7 | **VIES `/check-status` 端点现成**：`GET /taxation_customs/vies/rest-api/check-status` 每国可用性；vatcheckapi 免费 /vies-status（X-Cost: 0） | vatnode blog/vatcheckapi docs | 2026-11 | 🟢 | 已搜 |
| S8 | 中文蓝海延续：vat.support 中文免费工具站（无 MCP）、poetries.top 中文教程（转述 Apify 通用模式）——**无中文原生 VAT MCP** | vat.support/poetries.top | 2026-11 | 🟡 | 已搜 |
| S9 | **官方 MCP Registry = 生态新枢纽**：一次发布，PulseMCP/Smithery/GitHub registry 全拉取；本家族 7/8 已在列，Vies 本轮补齐 | registry.modelcontextprotocol.io | 2026-11-13 | 🟢 | **已发布验证** |
| S10 | M8ven：B grade、Verified、Live；1 high=zod（已修）；annotations pass；**listed_on_claude/openai=null**（未上两大目录） | m8ven.ai | 2026-11-13 | 🟢 | 已抓 |
| S11 | consultation number = 市场共识审计证据（VAT Directive Art.138）：vatnode 全站定位、fabriken2026 receipt、lwsdjfls、VAT Sense 均有 | vatnode.dev/fabriken2026 | 2026-11 | 🟢 | 已搜 |
| S12 | bulk 需求证据强：vatstack（"checking two hundred one at a time is not" feasible）、howtocsv（bulk+checksum）、hellotax（mass validation 场景清单） | vatstack/howtocsv/hellotax | 2026-11 | 🟢 | 已搜 |

---

## 五、Stage 2 竞品差距矩阵（2026-11 版）

| 竞品 | bulk | status | consultation | 三态 | 托管 MCP | 免费层 | 我们的差距 |
|---|---|---|---|---|---|---|---|
| vies-smoother (Glama) | ✗ | ✓ circuit-breaker | ✗ | ✓ | ✗ stdio | 100 lookups | 我们缺 status 工具 |
| vatnode + vatnode-mcp | ✗ | ~ | ✓ 全站核心 | ~ | REST+key | 100/mo | 我们缺 consultation |
| lwsdjfls (Apify) | ✓ | ✓ | ✓ | ✓ | ✗ 非 MCP | ✗ | **最像的对手，无 MCP 无双语** |
| gp005 (Apify) | ✓ | monitor $0.02 | requestDate | ✓ | ✗ | ✗ | 同上 |
| fabriken2026 (Apify) | ~ | ✗ | ✓ receipt | ✓ | ✗ | source-down free | agent 话术强（"proceed/reject/retry"） |
| ENTIA (mcp.pub) | ✗ | ✗ | ✗ | ~ | ✓ | 100/day | 重（5.5M 实体），我们轻 |
| vat.support（中文） | ✗ | ✗ | ✓ | ? | web | 全免 | **无 MCP/agent 面** |

- 🛡️ **Table stakes**：bulk（2 个 Apify 竞品有）、consultation number（vatnode 命根子）、service-status（vies-smoother 卖点）。
- ⚔️ **Differentiator**：**托管 MCP 零安装**（竞品几乎全 stdio/REST）+ **中英双语**（竞品全 EN）+ 3 免费工具 + $0.005 低价 + **官方 Registry 在列（家族协同发现）** + 中文蓝海（vat.support 无 MCP）。
- 🧱 **Defender**：M8ven B/Verified/Live、trust_audit 0 FAIL、价格带居中。
- 🚫 **Irrelevant**：national registry fallback（需各国 key，vatnode 重资产路线）、公司数据 enrichment（GLEIF/ENTIA 赛道）、fraud-AI、UK HMRC 直连。

---

## 六、Stage 3 痛点表（pain → 状态）

| 痛点 | 严重度 | 根因 | 映射 | 状态 |
|---|---|---|---|---|
| P1 GB 有效税号被报 invalid | 高 | VIES 对 GB 返 INVALID_INPUT | — | **已修 1.0.3（线上实测 VAT_NOT_IN_VIES）** |
| P2 GR 被拒 COUNTRY_UNSUPPORTED | 中 | VIES 用 EL 无别名 | — | **已修 1.0.3（线上实测 normalized EL）** |
| P3 无 consultation number/审计凭证 | 中 | 未请求 checkVatApprox | S11 | → A2 |
| P4 无批量校验 | 中 | 仅单条 | S12/S3 | → A3 |
| P5 无 VIES 服务状态工具 | 中 | 缺工具（DE 40-60% uptime 硬事实） | S6/S7 | → A1 |
| P6 **19 天零有机调用** | 高 | 价值主张未穿透 + agent 发现渠道刚补齐 | S9 | → C3 内容 + Registry 观察窗 |
| P7 zod CVE（M8ven 1 high） | 中 | 依赖陈旧 | S10 | **已修（待重扫）** |
| P8 serverInfo 版本漂移 1.0.1 | 低 | 硬编码 | — | **已修** |

> 独立来源 ≥3 进 RICE：P3（vatnode+fabriken2026+lwsdjfls+Art.138 四源）、P4（vatstack+howtocsv+hellotax+2 竞品四源）、P5（vatnode 采样+lwsdjfls 实测+apifyforge+官方公告四源）全部满足。

---

## 七、Stage 4 — 四类决策 RICE（Reach×Impact×Confidence÷Effort）

### A 功能/技术
| 决策 | RICE | R | I | C | E | 依据 |
|---|---|---|---|---|---|---|
| **A1** `check_vat_service_status`（VIES 各国可用性，`/check-status` 端点现成，免费） | **9** | 3 | 2 | 3 | 2 | S6/S7/P5；vies-smoother 核心卖点；DE 夜间窗口是 agent 盲重试根因 |
| **A3** `bulk_validate_vat`（≤10，复用缓存/计费） | **9** | 2 | 3 | 3 | 2 | S12/P4；CRM/账单清洗高频 |
| **A2** consultation number + requesterVatId（checkVatApprox，Art.138 审计凭证） | **6** | 2 | 3 | 3 | 3 | S11/P3；vatnode 全站定位 |
| A5 错误码 i18n 强化 | 3 | 2 | 1 | 3 | 2 | 维持 |

### B 变现
| 决策 | RICE | 依据 |
|---|---|---|
| B1 monitor-changed 事件 $0.02 | 1.3 | gp005 同款；**价格变动→需老板批** |
| B2 Sartbot featured | — | 已 featured（自营免单） |
| B3 x402 USDC 渠道 | 2 | wsystem 模式；需新凭据 → 只报告 |

### C 推广
| 决策 | RICE | 依据 |
|---|---|---|
| **C4 官方 MCP Registry** | — | **✅ 已完成（2026-11-13 发布 v1.0.3）** |
| C5 观察聚合器拉取（PulseMCP/Smithery/GitHub registry 24-72h） | 2 | S9；下个 light 周期验证 |
| **C3** 中文跨境合规长文（掘金/知乎），ViDA 2026 节点 + 中英双语楔子 | **6** | S4/S8；竞品无中文内容 |
| C6 Claude/OpenAI 目录申请 | 4 | listed_on_claude/openai=null；OpenAI 评审 2-4 周、需 tool annotations（已 pass）→ 可申请 |

### D 定价
| 决策 | RICE | 依据 |
|---|---|---|
| D1 维持 $0.005 + 3 免费工具 | 维持 | S5：竞品带 $0.002–0.01，我们居中偏有利；vatnode 证明"免费层+付费 volume"模式成立 |

### 📌 前四名（待老板拍板落地顺序）
1. **A1 (9)** — `check_vat_service_status`（端点现成、竞品核心卖点、DE uptime 硬事实）
2. **A3 (9)** — `bulk_validate_vat`（bulk 需求证据最强）
3. **A2 (6)** — consultation number（审计凭证是竞品主话术）
4. **C3 (6)** — 中文跨境合规内容（ViDA 2026 落地节点 + 中文蓝海）

---

## 八、待老板拍板清单

1. ⏸️ **B1 新增 monitor-changed $0.02**：价格变动，铁律 #4 须批；当前不执行。
2. ⏸️ **C6 OpenAI/Claude 目录申请**：需真人注册/提交动作（AI 可备料）；annotations 已 pass，无技术障碍。
3. ⏸️ **C3 发布渠道**：掘金/知乎发文需老板账号（AI 备稿）。
4. ✅ 其余全部自治完成（见自治修复清单）。

---

## 九、首月行动清单

| # | 动作 | 命令/文件 | 负责人 | 自治? |
|---|---|---|---|---|
| 1 | 观察 Registry 聚合（PulseMCP/Smithery 24-72h 拉取） | curl registry + 目录站 | AI | ✅ |
| 2 | A1：`check_vat_service_status` | `src/vies/status.ts` + server 注册 + 测试 | AI | ✅ |
| 3 | A3：`bulk_validate_vat`（≤10） | server.ts + 测试 | AI | ✅ |
| 4 | A2：consultation number | checkVatApprox + requesterVatId 参数 | AI | ✅ |
| 5 | C3：中文长文稿（ViDA+买方 VAT 校验） | 草稿 → 老板发 | AI+老板 | 部分 |
| 6 | 验收：preflight+trust_audit+重推 | 全闸门 | AI | ✅ |

---

## 十、成本披露

| 项 | 实际 |
|---|---|
| Apify build ×3（1.2.1/1.2.2/1.2.3） | ~$0.15–0.30（本周期总量 ~$0.5/$5.00，5.4%→~10%） |
| 线上验证调用（tools/list + GB live=false + GR format + initialize×2） | $0（免费事件/短路，未触发 mcp-validate-vat） |
| WebSearch ×10 / curl / 本地闸门 | $0 |
| LLM 合成 | 本 session 模型承担（Hy3 免费窗口已于 10-31 到期，本机无外部免费模型配置 → 如实记录：报告合成由当前 session LLM 完成，未额外采购） |
| **合计（Apify credit）** | **~$0.5 / $5.00 本周期** |

> 注：M8ven ~daily 重扫后 zod 1-high 应消除；下次 light 周期（≤7 天）验证 findings 变化 + Registry 聚合拉取情况。
