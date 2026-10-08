# SPEC — VIES VAT Validator MCP

> **SPEC 即契约。** 本文件锁定后，所有实施只按此文档跑。变更必须走 §13 变更记录表。
> 来源 brief：rumblingb pipeline 案例（"监管刚需" playbook）。综合评分 47/50（投资 10 · 技术 9 · ROI 8 · 时间 10 · 合规 10）。

---

## 1. 产品定义

- **一句话**：用欧盟官方免费的 **VIES** SOAP 接口校验 VAT / 税务识别号，并叠加一层本地格式预校验 + 免费 TTL 缓存，为跨境电商 / 外贸卖家提供"监管刚需"级的合规校验能力。
- **目标用户**：跨境电商卖家、外贸 B2B 业务员、财税 SaaS、ERP/记账系统、合规自动化 agent。
- **核心问题**：VIES 接口是 SOAP、频繁抖动、限流；卖家需要稳定、可解释、双语的校验结果，而不是裸 XML。

## 2. MVP 范围（RICE 排序）

| 优先级 | 功能 | 验收摘要 | RICE |
|------|------|---------|------|
| P0 | `validate_vat` 工具 | 支持 `vat` 整体输入或 `countryCode`+`vatNumber` 拆分；先本地格式校验（免费），再按需打 VIES（live）；返回结构化 + 双语错误 | 高 |
| P0 | `check_vat_format` 工具 | 纯本地正则格式校验，零网络、零成本（免费事件） | 高 |
| P0 | 本地格式规则库 | 覆盖 EU 27 + GB + XI 的 VAT 号正则 | 高 |
| P0 | 免费 TTL 缓存 | 默认 24h 缓存 VIES 结果，降低限流/抖动影响 | 高 |
| P0 | 中英双语错误码表 | 覆盖格式错误 + VIES 6 类 SOAP 故障 + 网络错误，含 zh/en 文案与处理建议 | 高 |
| P1 | `list_supported_countries` 工具 | 返回支持国家（中/英双语名） | 中 |
| P1 | `get_error_codes` 工具 | 返回完整双语错误码表（免费事件） | 中 |
| P1 | resources：`vat://error-codes` / `vat://supported-countries` / `vat://spec` | 只读数据暴露 | 中 |
| P1 | prompts：`vat_compliance_guide` / `explain_vat_result` | 合规指引 + 结果解读 | 中 |

## 3. 明确不做（Out-of-Scope）

| 功能 | 原因 | 何时考虑 |
|------|------|---------|
| VIES `checkVatApprox` 近似匹配 | MVP 先跑通精确校验；近似匹配增加复杂度 | V1.1+ |
| 非 EU 税务号（如 US EIN、AU ABN、CN USCC） | VIES 只覆盖 EU/GB；混合数据源超出本周范围 | V2 |
| 持久化数据库（Postgres/Redis） | 免费 TTL 缓存已满足冷启动；避免运维成本 | 规模化后 |
| 静态清单站 / RSS / Skill 订阅 | 本周只做 MCP server（三件套中先上核心） | 第二周 |
| 自动推送 / webhook | 监管校验是 pull 场景 | 不做 |

## 4. 技术架构（版本锚死）

| 层 | 技术 | 实际版本 | 锁定原因 |
|----|------|---------|---------|
| 运行时 | Node.js | >=18（构建锚 22 LTS） | 全局 `fetch` + `AbortController` 原生可用 |
| 语言 | TypeScript | 5.5.x | 严格类型，避免 VAT 字段错位 |
| MCP SDK | `@modelcontextprotocol/sdk` | ^1.0.0 | StreamableHTTP + stdio 双传输，stateless 部署 |
| 校验 | `zod` | ^3.23.8 | 工具入参运行时校验 |
| 测试 | `vitest` | ^2.0.5 | 快速、ESM 原生、可 mock fetch |
| 开发 | `tsx` | ^4.16.2 | 免编译本地跑 |
| XML 解析 | **零依赖**（正则提取） | — | VIES 响应字段固定，正则足够稳健，避免引入重依赖 |
| 部署 | Apify（PAY_PER_EVENT） | platform | 按事件计费，零月费；匹配用户偏好 |

> 红线：不引入 `express` / `soap` / `fast-xml-parser` 等重依赖；SOAP 信封手写、响应正则提取。

## 5. API 端点清单

### Tools
- `validate_vat(vat?, countryCode?, vatNumber?, useCache=true, live=true)` → 结构化结果 `{ valid, formatValid, viesValid, countryCode, vatNumber, name, address, requestDate, error, source }`
- `check_vat_format(vat? | countryCode+vatNumber)` → `{ formatValid, countryCode, vatNumber, normalized, pattern }`
- `list_supported_countries()` → `{ countries: [{ code, nameZh, nameEn }] }`
- `get_error_codes()` → `{ errors: [{ code, severity, messageZh, messageEn, actionZh, actionEn }] }`

### Resources (read-only)
- `vat://error-codes` — 双语错误码表 JSON
- `vat://supported-countries` — 支持国家 JSON
- `vat://spec` — 服务元信息 JSON

### Prompts
- `vat_compliance_guide` — 跨境电商 VAT 合规校验步骤指引
- `explain_vat_result` — 解读一次校验结果（附示例 result）

## 6. 存储清单

| 存储 | 形态 | 说明 |
|------|------|------|
| TTL 缓存 | 进程内 `Map` | key=`CC:NN`，默认 TTL 24h；零外部依赖 |
| 格式规则 | 代码内 `Map` | 国家→正则，编译期确定 |
| 错误码表 | 代码内 `Map` | 双语，编译期确定 |

## 7. 页面清单
无（MVP 不含站点）。

## 8. Design tokens 摘要
无 UI 层。CLI / MCP 输出遵循：结构化 JSON（机器消费）+ 简洁 Markdown（人读）。错误文案双语对照。

## 9. 验收标准（EARS）

- **AC-01 (P0)**：WHEN 输入合法 `FR123456789` 类 VAT，THE SYSTEM 先过本地格式校验，再（live=true）调用 VIES 并返回 `valid` 布尔。
- **AC-02 (P0)**：IF 输入格式不符合该国正则，THE SYSTEM 返回 `VAT_FORMAT_INVALID` 且 `formatValid=false`，**不**发起 VIES 调用。
- **AC-03 (P0)**：WHEN VIES 返回 SOAP 故障（MS_UNAVAILABLE / SERVICE_UNAVAILABLE / TIMEOUT / SERVER_BUSY / INVALID_INPUT），THE SYSTEM 映射为对应双语错误码且不崩溃。
- **AC-04 (P0)**：IF 网络不可达，THE SYSTEM 返回 `NETWORK_ERROR` 且 `source="vies"`，不抛未捕获异常。
- **AC-05 (P0)**：WHEN 同一 VAT 在 TTL 内重复查询且 `useCache=true`，THE SYSTEM 直接返回缓存（`source="cache"`），不再打 VIES。
- **AC-06 (P1)**：`check_vat_format` 与 `get_error_codes` 为纯本地、零网络调用。
- **AC-07 (P1)**：所有 tool 返回同时含 `content`（Markdown）+ `structuredContent`（JSON）。
- **AC-08 (P0)**：`vitest run` 全绿（格式库 + 缓存 + 错误映射 + VIES 解析 mock）。
- **AC-09 (P1)**：`tsc` 构建无错误，stdio 传输可被 MCP 客户端 `initialize` 成功。

## 10. 边界与约束
- VIES 官方免费、无 SLA，可能限流/抖动 → 缓存 + 优雅降级是唯一解法。
- VIES 仅覆盖 EU/GB（含北爱 XI）；非 EU 国家不在 MVP。
- 格式正则不保证 VAT 真实有效，只保证"形态合规"；真实有效性以 VIES 为准。
- 进程内缓存在多实例/重启后失效（Apify 多副本场景），属已知权衡（见 §11 C1）。

## 11. 内嵌已知坑（签名 + 预防）
- **C1 缓存跨实例失效**：Apify 可能多副本，进程内缓存不共享 → 文档声明 + 后续换 Redis。
- **C2 VIES 偶发停机**：SOAP fault 频发 → 全部捕获并映射双语错误码，绝不崩溃。
- **C3 输入含国家前缀**：用户常写 `FR123456789` → `parseVat()` 自动剥离前 2 位国家码。
- **C4 空格/小写**：`normalize()` 去空格、转大写。
- **C5 XML 命名空间**：VIES 响应带命名空间前缀 → 用无前缀标签正则提取，避免 namespace 干扰。
- **C6 测试服务**：用 `checkVatTestService` + 特殊 VAT 号（如 `invalid`/`MS_UNAVAILABLE`）做确定性验证。

## 12. 端到端验证步骤

```bash
# 1. 安装
npm install
# 2. 类型检查 + 构建
npm run build
# 3. 单测（全绿）
npm test
# 4. 本地 stdio 冒烟（MCP 客户端视角）
node dist/index.js <<'JSON'
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0"}}}
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"check_vat_format","arguments":{"vat":"FR123456789"}}}
JSON
# 5. 验证展示（真实 payload HTML）
node dist/verify.js   # 或 npm run verify
```

## 13. 变更记录表

| 版本 | 日期 | 变更 | 决策人 |
|------|------|------|--------|
| 1.0.1 | 2026-10-09 | M8ven Trust Index 合规：补 tool annotations、SECURITY.md、工具级测试；CVE 清零（basic-ftp override） | 老板 |
| 1.0.0 | 2026-10-02 | 初始 SPEC：MVP 锁定 VAT 校验 + 免费缓存 + 双语错误码，Apify PPE | 老板 / Wiwi |
