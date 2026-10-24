# VIES VAT Validator MCP — 每月深度 Nurture 报告 (Stage 0–4)

**标的**：`PanStories/vies-vat-validator-mcp` (public) · Apify `ghDM96xaQ9kvrsii0` · Sartbot `vies-vat-validator-mcp`
**执行时间**：2026-10-24 (周六) · **模型路由**：Cheap-First-Routing → Hy3 free quota（2026-10-31 前免费，本轮 $0 LLM）
**本月 commit 数**：33（2026-09-24 起，含 m8ven 修复 / 价格变更 / Glama build fix）→ **跳过门控不触发，跑全 Stage 0–4**

---

## 一、状态总表

| 维度 | 现状 | 目标 | 状态 | 依据 |
|---|---|---|---|---|
| 信任/质量 (M8ven) | **B 89/100 · Verified Publisher · Live Monitored** | 维持 B+ / 冲 A | ✅ | `curl m8ven.ai/mcp/panstories/vies-vat-validator-mcp` 2026-10-24 |
| 采用/流量 | totalRuns **503**，totalUsers **1**，近 30d 公开 run **1**，reviews **0/0** | 有机 users>1、月均公开 run>10 | 🔴 | Apify `/v2/acts/{id}` stats 2026-10-24 |
| 定价 | $0.0005/validate → **$0.005 生效 2026-11-06**（已 grandfather，老板 2026-10-22 批准） | 维持低档 | ✅ | Apify pricingInfos（两条记录） |
| 代码正确性 | GB 误判 invalid、GR 被拒 → **本轮已修 (1.0.3)** | 零误判 | ✅ | commit `14f7a0a` |
| 竞品差距 | 缺 `check_vat_service_status` / bulk / consultation number | 补齐楔子 | ⏸️ | Stage 2 矩阵 |
| 发现度 | 自动收录 Glama + LobeHub；mcpservers/Smithery/PulseMCP 404；**llms.txt 缺失** | 全渠道在架 + llms.txt | ⏸️ | preflight 3/5 drift |
| 文案一致性 | preflight **3/5 drift**（README tagline、actor.json tools:billable 文案、llms.txt 缺失） | 0 drift | 🔴 | `nurture_preflight.py` 2026-10-24 |
| Apify 部署 | GitHub 已 push；**actor source 1.2 已上传**（npx apify-cli 可用），但 **build 被账号月度用量硬上限挡住**（Monthly usage hard limit exceeded），线上 latest 仍 1.1.2（10-09 旧代码，不含 1.0.3） | latest build = 1.0.3 | 🔴 | 见自治修复清单 / 待拍板 #1 |

---

## 二、M8ven 验证状态三件套（2026-10-24 实测）

1. **评分 / grade**：`"ratingValue":89` → **B 89/100**。较 baseline（B Emerging 89）分数持平，但状态已从 Emerging 升级为 **Verified Publisher + Live Monitored**（Claim 完成、GitHub App 已装）。
2. **Claim 状态**：✅ **Verified Publisher**（老板此前已点邮件验证链接翻牌，本轮不再 pending）。AI 无法代点，确认已闭环。
3. **README badge 行格式**：✅ **tokenized 验证行**已就位 ——
   `[![M8ven Verified](https://m8ven.ai/badge/mcp/panstories-vies-vat-validator-mcp-1bk4uh?variant=verified)...]`
   `curl raw.githubusercontent.com/.../main/README.md | grep m8ven` 命中 tokenized 行（非 canonical 斜杠格式）→ **无需修复**。

---

## 三、自治修复清单（本轮实际改动）

| 文件 | 改动 | 状态 |
|---|---|---|
| `src/data/countries.ts` | 新增 `COUNTRY_ALIASES {GR:"EL"}` + `resolveCountry()`，统一别名解析 | ✅ committed |
| `src/vat/format.ts` | `parseVat` / `validateFormat` 改用 `resolveCountry`；区分 INPUT_MISSING vs COUNTRY_UNSUPPORTED | ✅ |
| `src/errors/codes.ts` | 新增 `VAT_NOT_IN_VIES`（severity:info，中英双语） | ✅ |
| `src/mcp/server.ts` | `validate_vat` 对 GB 短路：返回诚实「不在 VIES 范围（请用 HMRC）」状态，不再报假 invalid | ✅ |
| `tests/format.test.ts` `tests/tools.test.ts` | 新增 GR 别名 + GB 出域回归测试 | ✅ |
| `package.json` / `nurture/manifest.json` / `README.md` | 版本 1.0.1 → **1.0.3** 同步 | ✅ |
| `CHANGELOG.md` | 新增 1.0.3 条目 | ✅ |
| **Git** | commit `14f7a0a` → `main`（`e089858..14f7a0a`，10 files / +87 −16） | ✅ **pushed** |
| **Apify deploy** | source **1.2 已上传**（`npx apify-cli push` 成功创建 version），但 build 触发被 **Monthly usage hard limit exceeded** 挡住（2026-10-25 实测） | 🔴 **账号计费上限，待老板提额后一键重推**；standby 120/512 未被动（build 未跑） |

**质量闸门**：`vitest` **36/36 passed** · `tsc` clean · `trust_audit.py` **FAIL 0 / WARN 1 / PASS 16**（WARN=生产依赖新鲜度提示，非阻断）。

---

## 四、Stage 1 信号表（8–12 路并行检索，EN+ZH，2026-10-24）

| # | 结论 | 证据 URL | 日期 | 可信度 | 目标人群 | 已验证 |
|---|---|---|---|---|---|---|
| S1 | VAT MCP 赛道已拥挤（~15 个竞品），目录自动索引普遍 | mcp.so `#vat`(11)、LobeHub、mcpservers.org、Glama、mcpize | 2026-10-24 | 🟢 | 跨境/财务/KYB | 已搜 |
| S2 | 无 key / 免费竞品压低摩擦：vatnode(4 免费工具+SKILL.md)、eu-vat-validator-mcp(直播无 key+bulk+status)、EL EU Legal(5 工具免 key) | vatnode.dev/mcp、mcpize.com/mcp/eu-vat-validator-mcp | 2026-10-24 | 🟢 | 开发者 | 已搜 |
| S3 | 竞品主打：bulk、consultation number(审计凭证)、VIES 状态、national fallback、多法域(UK HMRC/AU)、fraud-AI、monitoring、三态诚实 | Apify W System/fabriken2026/gp005/euroscrape 详情页 | 2026-10-24 | 🟢 | 财务/合规 | 已搜 |
| S4 | 合规需求上扬：EU ViDA 强制 e-invoicing 2026(BE 1月/FR 9月/PL KSeF 2月)，反向征收需审计凭证 | taxid.dev/blog、vatsense.com、vatnode.dev/blog | 2026 | 🟢 | 财务/电商 | 已搜 |
| S5 | 同生态 Apify PPE 对手定价 $0.004–$0.01/次：W System $0.005+$0.005/run、fabriken2026 $0.005+$0.01、gp005 $0.005+$0.004、euroscrape $0.003+$0.002 | apify.com 各 actor 页 | 2026-10-24 | 🟢 | — | 已搜 |
| S6 | VIES 可靠性是核心痛点：聚合 ~98.7% 但国别集中(DE 夜间窗口等)，「中断≠无效」叙事主导竞品话术 | vatvalidate.eu/is-vies-down、taxid.dev、vatnode.dev/uptime | 2026 | 🟢 | 所有用户 | 已搜 |
| S7 | 本 MCP 已自动收录 Glama+LobeHub，但 0 有机 run → 不是「没收录」而是「价值主张没穿透」 | 搜索引擎 + Apify stats | 2026-10-24 | 🟢 | — | 已搜 |
| S8 | 中文跨境卖家的 VAT 校验 MCP 讨论稀少 → 蓝海；我方中英双语是差异点 | mcp.so zh tags、中文搜索 | 2026-10-24 | 🟡 | 中文跨境卖家 | 未验证(样本少) |

---

## 五、Stage 2 竞品差距清单（标签）

- 🛡️ **Table stakes（不做就输）**：`check_vat_service_status`（VIES 各国可用性）、bulk 批量校验、三态诚实（invalid vs unavailable）。前两项我们缺失。
- ⚔️ **Differentiator（我们的楔子）**：**托管 Streamable HTTP（零本地安装）** + **中英双语错误码/文案**（竞品几乎全 EN）+ 3 个免费离线工具 + 已修正确的国别处理。中文跨境卖家是蓝海。
- 🧱 **Defender（维持即可）**：免费 format/error 工具（低成本）、M8ven B 89/Verified/Live（信任护城河）、价格处于低档。
- 🚫 **Irrelevant（明确不做）**：fraud-AI（需 LLM，scope 膨胀）、UK HMRC 直连（需 OAuth 凭据，我们不会持有）、完整 EU 法务/RAG 助手。

> 实测说明：本环境对托管端点 `tools/list` 返回 403（sandbox WAF，token 对 GET API 有效），竞品「真跑」以已发布的 README/docs/Apify 页为准，未亲手复现的标「未验证」。

---

## 六、Stage 3 痛点表（pain → 根因 → 映射差距）

| 痛点 | 严重度 | 根因 | workaround | 映射 Stage2 |
|---|---|---|---|---|
| P1 GB 有效税号被报 invalid | 高 | 对 GB 调 VIES 返回 INVALID_INPUT，误判 | 无 | 已修(1.0.3) |
| P2 GR 被拒 COUNTRY_UNSUPPORTED | 中 | VIES 用 EL，无别名 | 用户改输 EL | 已修(1.0.3) |
| P3 无 consultation number / 审计凭证 | 中 | 未请求 checkVatApprox | 无 | S3/S4 → A2 |
| P4 无批量校验 | 中 | 仅单条 | 多次调用 | S3 → A3 |
| P5 无 VIES 服务状态工具 | 中 | 缺工具 | 盲重试 | S6 → A1 |
| P6 中断被误读为无效 | 中 | 三态不显式 | 人工判断 | S6 → A1/A5 |

> 独立来源 ≥3 才进 RICE：P3/P4/P5 各有「竞品文档 + 我方 baseline + 合规博客」≥3 源，进 RICE；P1/P2 已自治修。

---

## 七、Stage 4 — 四类决策 RICE 表（Reach×Impact×Confidence÷Effort）

### A 功能/技术
| 决策 | RICE | R | I | C | E | 依据 |
|---|---|---|---|---|---|---|
| **A1** `check_vat_service_status` 工具（VIES 各国可用性） | **9** | 3 | 2 | 3 | 2 | S6/P5；竞品 eu-vat-validator-mcp 已有；VIES `/check-status` 端点现成 |
| **A3** `bulk_validate_vat`（≤10，复用缓存） | **9** | 2 | 3 | 3 | 2 | S3/P4；CRM/账单清洗高频场景 |
| **A2** consultation number + 公司名/地址审计凭证（checkVatApprox + requesterVatId） | **6** | 2 | 3 | 3 | 3 | S3/S4/P3；财务/KYB 直接买单点 |
| A5 错误码文案 i18n 强化 | 3 | 2 | 1 | 3 | 2 | 维持 |

### B 变现
| 决策 | RICE | R | I | C | E | 依据 |
|---|---|---|---|---|---|---|
| B1 $0.005 生效 2026-11-06（已批准） | — | — | — | — | 1 | 已决，非新决策 |
| B2 新增 monitor-changed 事件($0.02) | 1.3 | 1 | 2 | 2 | 3 | gp005 同款；**价格变动→需老板批** |
| B3 Sartbot featured（自动免费） | — | — | — | — | 0 | 已 featured |

### C 推广
| 决策 | RICE | R | I | C | E | 依据 |
|---|---|---|---|---|---|---|
| **C1** 补 llms.txt + 修 README tagline/actor.json drift | **18** | 3 | 2 | 3 | 1 | preflight 3/5 drift；agent 可发现性直接杠杆 |
| **C3** 中文跨境合规内容（掘金/知乎），打中英双语蓝海 | **6** | 2 | 3 | 2 | 2 | S8；竞品无中文内容 |
| C2 mcpservers.org / PulseMCP 免费提交 | 4 | 2 | 2 | 2 | 2 | 发现度；mcpservers.org 免账号 |

### D 定价
| 决策 | RICE | 依据 |
|---|---|---|
| D1 $0.005 生效 11-06（grandfathered） | 已决 | 老板 2026-10-22 批准，无需再批 |
| D2 维持 3 个免费工具 + $0.005 直播 | 维持 | 低摩擦档 |

### 📌 前四名（待老板拍板落地顺序）
1. **C1 (18)** — llms.txt + 文案 drift 修复（最高杠杆、最低成本）
2. **A1 (9)** — VIES 服务状态工具
3. **A3 (9)** — 批量校验
4. **A2 (6)** — consultation number 审计凭证（C3 并列 6，作第 5 顺位）

---

## 八、待老板拍板清单（真金白银 / 对外发布 / 价格变动）

1. **🔴 Apify 部署 1.0.3**：source 1.2 **已上传**（`npx apify-cli push`），但 build 被**账号月度用量硬上限**挡住（2026-10-25 实测 "Monthly usage hard limit exceeded"）。请老板在 Apify Console → Billing 提高/关闭 monthly usage hard limit（或等 11-01 月度重置），之后**一键重推即上线**（source 已在，重跑 `npx apify-cli push`，build 约 1-2 分钟）。push 成功后需复核 standby 仍为 120/512（SOP #24b）。
2. **⏸️ 新增付费事件 B2（monitor-changed $0.02）**：属价格变动，按铁律 #4 须老板批；当前不执行。
3. **⏸️ npm publish**：本机无 `NPM_TOKEN`（`npm whoami` → ENEEDAUTH），需老板提供 token 后方可发。
4. **⏸️ 目录提交 C2**：mcpservers.org 免账号可自治尝试；PulseMCP 需 `server.json`（已有）但提交动作建议下个 light 周期跑。
5. **✅ 价格 $0.005**：已批准，无需再批（仅记录）。

---

## 九、首月行动清单（命令 / 文件 / 负责人）

| # | 动作 | 命令 / 文件 | 负责人 | 自治? |
|---|---|---|---|---|
| 1 | 部署 1.0.3 到 Apify | 提额后 `npx apify-cli push`（source 1.2 已在）+ 复核 standby 120/512 | 老板(提额)/AI(重推) | 否(账单阻塞) |
| 2 | C1：生成 llms.txt + 修 README tagline/actor.json tools:billable 文案 | `nurture/manifest.json` 派生；`nurture_preflight.py` 复验 | AI | ✅ |
| 3 | A1：实现 `check_vat_service_status` | 新增 `src/vies/status.ts` + `src/mcp/server.ts` 注册 + 测试 | AI | ✅ |
| 4 | A3：实现 `bulk_validate_vat`（≤10，复用缓存/计费） | `src/mcp/server.ts` + 测试 | AI | ✅ |
| 5 | C3：中文跨境合规长文（掘金/知乎），主打中英双语楔子 | 草稿 → 发布 | 老板/AI | 部分 |
| 6 | 验收：trust_audit + preflight 绿 → `apify push` | 同上 | AI+老板 | ✅/否 |

---

## 十、成本披露

| 项 | 事前估算 | 事后实际 |
|---|---|---|
| LLM 合成（Stage 1–4 报告/RICE） | Hy3 free（2026-10-31 前免费）→ $0 | **$0**（未过 10-31，走免费额度） |
| WebSearch / WebFetch（检索） | $0（不计 LLM token） | **$0** |
| 本地：git / curl / trust_audit / tsc / vitest | $0 | **$0** |
| Apify 调用 | 0 次计费 run（tools/list 探测被 403 拦截，未触发 validate_vat 计费） | **$0** |
| **合计** | **$0** | **$0** |

> 注：2026-10-31 之后 Hy3/Hy4 免费额度到期，届时按 Cheap-First-Routing 改走外部免费模型（如 Cloudflare Workers AI Kimi K2.6），不可用则仅用最低 credits 并如实报账。本轮仍在免费窗口内。
