# VIES VAT Validator MCP 🇪🇺

> **VIES VAT Validator MCP** validates EU VAT numbers through the official **free** VIES SOAP API, wrapped with a **local format pre-check + free TTL cache** and **bilingual (中文 / English) error codes**. A "regulatory must-have" compliance tool for cross-border e-commerce and trade sellers.

> **Current version:** 1.0.1 · **License:** MIT · **Trust:** built read-only, no secret exfiltration, self-healing bilingual errors.

🌐 **[English](#english)** · **[简体中文](#简体中文)** · **[繁體中文](#繁體中文)**

| It lives at | Link |
|---|---|
| MCP endpoint | `https://neeenja--vies-vat-validator-mcp.apify.actor/mcp` |
| Apify Store | https://apify.com/neeenja/vies-vat-validator-mcp |
| Source | https://github.com/PanStories/vies-vat-validator-mcp |
| Featured on | [Sartbot Featured](https://sartbot.com/mcp/vies-vat-validator-mcp/) |

---

<a id="english"></a>
# English

## Why this exists

- **Regulatory must-have** — EU B2B transactions require verifying the counterparty's VAT number (reverse charge / compliance proof).
- **VIES is slow and flaky** — the official SOAP endpoint rate-limits and goes down often, so a cache + graceful degradation are mandatory.
- **Zero cold-start cost** — a free official data source wrapped with a thin layer + bilingual, explainable output, sold per-event.

## What you get

| Capability | Notes | Pricing |
|---|---|---|
| `validate_vat` | free local format check, then optional live VIES verification; structured + bilingual errors | $0.0005 / event |
| `check_vat_format` | pure local regex format check — **no network, free** | free |
| `list_supported_countries` | supported countries — native name + local VAT term + 中文/EN | free |
| `get_error_codes` | full bilingual error-code table | free |
| resources | `vat://error-codes` / `vat://supported-countries` / `vat://spec` | free |
| prompts | `vat_compliance_guide` / `explain_vat_result` | free |

Covers **EU 27 + GB + XI** (Northern Ireland). Every country also carries its **native name** and — far more useful — the **local term for the VAT number**, which is what people actually search for:

| 代码 Code | 母语名 Native | 当地 VAT 叫法 Local VAT term | 中文 | English | EU |
|---|---|---|---|---|---|
| AT | Österreich | UID-Nummer | 奥地利 | Austria | ✅ |
| BE | België / Belgique | BTW-nummer / numéro de TVA | 比利时 | Belgium | ✅ |
| BG | България | ДДС номер | 保加利亚 | Bulgaria | ✅ |
| CY | Κύπρος / Kıbrıs | Αριθμός ΦΠΑ | 塞浦路斯 | Cyprus | ✅ |
| CZ | Česko | DIČ | 捷克 | Czech Republic | ✅ |
| DE | Deutschland | USt-IdNr. | 德国 | Germany | ✅ |
| DK | Danmark | CVR-nummer | 丹麦 | Denmark | ✅ |
| EE | Eesti | KMKR number | 爱沙尼亚 | Estonia | ✅ |
| EL | Ελλάδα | Αριθμός ΦΠΑ | 希腊 | Greece | ✅ |
| ES | España | NIF (IVA) | 西班牙 | Spain | ✅ |
| FI | Suomi | ALV-numero | 芬兰 | Finland | ✅ |
| FR | France | numéro de TVA | 法国 | France | ✅ |
| HR | Hrvatska | PDV broj | 克罗地亚 | Croatia | ✅ |
| HU | Magyarország | ÁFA-szám | 匈牙利 | Hungary | ✅ |
| IE | Ireland / Éire | VAT number | 爱尔兰 | Ireland | ✅ |
| IT | Italia | Partita IVA | 意大利 | Italy | ✅ |
| LT | Lietuva | PVM kodas | 立陶宛 | Lithuania | ✅ |
| LU | Lëtzebuerg / Luxembourg | numéro TVA | 卢森堡 | Luxembourg | ✅ |
| LV | Latvija | PVN numurs | 拉脱维亚 | Latvia | ✅ |
| MT | Malta | VAT number | 马耳他 | Malta | ✅ |
| NL | Nederland | btw-nummer | 荷兰 | Netherlands | ✅ |
| PL | Polska | NIP | 波兰 | Poland | ✅ |
| PT | Portugal | NIF | 葡萄牙 | Portugal | ✅ |
| RO | România | cod de TVA | 罗马尼亚 | Romania | ✅ |
| SE | Sverige | momsregistreringsnummer | 瑞典 | Sweden | ✅ |
| SI | Slovenija | ID za DDV | 斯洛文尼亚 | Slovenia | ✅ |
| SK | Slovensko | IČ DPH | 斯洛伐克 | Slovakia | ✅ |
| GB | United Kingdom | VAT registration number | 英国 | United Kingdom | — |
| XI | Northern Ireland | VAT registration number (XI) | 北爱尔兰 | Northern Ireland | — |

> 叫法取当地商务常用写法；部分国家有不止一种官方接受的写法，表中列最主要的那种。
> Terms follow common local business usage — some countries accept more than one form; the main one is shown.

## Quick start (local)

```bash
npm install
npm run build
npm start            # stdio transport, connects to any MCP client
npm test             # vitest, all green
npm run verify       # generate verify-report.html with real payloads
```

### Connect with an MCP client (stdio)

```json
{
  "mcpServers": {
    "vat-validator": {
      "command": "node",
      "args": ["/abs/path/vies-vat-validator-mcp/dist/index.js"]
    }
  }
}
```

### Connect over HTTP (remote / Apify)

Point your MCP client at the Streamable HTTP endpoint:

```
https://neeenja--vies-vat-validator-mcp.apify.actor/mcp
```

with the header `Authorization: Bearer <APIFY_TOKEN>`.

## Example calls

**Format pre-check (free)**
```json
{ "name": "check_vat_format", "arguments": { "vat": "FR123456789" } }
```
→ `{ "formatValid": true, "normalized": "FR123456789", "pattern": "^([A-Z]{2})?\\d{9}$" }`

**Live verification (paid event)**
```json
{ "name": "validate_vat", "arguments": { "vat": "FR123456789", "useCache": true, "live": true } }
```
→ `{ "valid": true, "formatValid": true, "viesValid": true, "source": "vies", "name": "...", "address": "..." }`

## Error codes (excerpt)

| Code | 中文 | EN |
|---|---|---|
| `VAT_FORMAT_INVALID` | 格式不符 | format mismatch |
| `VAT_VIES_INVALID` | VIES 判定无效 | VIES says invalid |
| `VIES_MS_UNAVAILABLE` | 成员国系统不可用 | member state down |
| `VIES_TIMEOUT` | 超时 | timeout |
| `NETWORK_ERROR` | 网络错误 | network error |

Full table via `get_error_codes` or `vat://error-codes`.

## Deploy (Apify Pay-Per-Event)

```bash
npm run apify:login      # complete KYC yourself first (one-time)
npm run apify:validate   # validate actor.json
npm run apify:push       # publish to Apify Store
```

Pricing lives in `.actor/actor.json` → `pricingEvents`: format / error / country queries are free; only `mcp-validate-vat` is billed.

## Design red lines

- No `express` / `soap` / `fast-xml-parser`: the SOAP envelope is hand-built and the response parsed with namespace-agnostic regex.
- Never crash: VIES faults / network errors map to bilingual error codes.
- Free layer (format check + cache) guarantees zero cold-start cost.

See [SPEC.md](./SPEC.md) for the full contract.

---

<a id="简体中文"></a>
# 简体中文

## 为什么做这个

- **监管刚需** —— 欧盟 B2B 交易要求核验对方 VAT 税号（逆向征收 / 合规凭证）。
- **VIES 又慢又抖** —— 官方 SOAP 接口频繁限流、偶发停机，缓存 + 优雅降级是必选项。
- **零冷启动成本** —— 免费官方数据源，叠加一层封装 + 可解释的双语输出，按事件计费。

## 你能拿到什么

| 能力 | 说明 | 计费 |
|---|---|---|
| `validate_vat` | 先做免费本地格式校验，再按需调用欧盟官方 VIES 接口核验真实性；结构化 + 双语错误 | $0.0005 / 次 |
| `check_vat_format` | 纯本地正则格式校验，**零网络、零成本** | 免费 |
| `list_supported_countries` | 返回支持国家（母语名 + 当地 VAT 叫法 + 中/英） | 免费 |
| `get_error_codes` | 返回完整中英双语错误码表 | 免费 |
| resources | `vat://error-codes` / `vat://supported-countries` / `vat://spec` | 免费 |
| prompts | `vat_compliance_guide` / `explain_vat_result` | 免费 |

覆盖 **EU 27 + GB + XI**（北爱尔兰）。每个国家还带**母语名**，以及更实用的**当地对 VAT 号的叫法**——这才是当地人真正会搜的词：

| 代码 Code | 母语名 Native | 当地 VAT 叫法 Local VAT term | 中文 | English | EU |
|---|---|---|---|---|---|
| AT | Österreich | UID-Nummer | 奥地利 | Austria | ✅ |
| BE | België / Belgique | BTW-nummer / numéro de TVA | 比利时 | Belgium | ✅ |
| BG | България | ДДС номер | 保加利亚 | Bulgaria | ✅ |
| CY | Κύπρος / Kıbrıs | Αριθμός ΦΠΑ | 塞浦路斯 | Cyprus | ✅ |
| CZ | Česko | DIČ | 捷克 | Czech Republic | ✅ |
| DE | Deutschland | USt-IdNr. | 德国 | Germany | ✅ |
| DK | Danmark | CVR-nummer | 丹麦 | Denmark | ✅ |
| EE | Eesti | KMKR number | 爱沙尼亚 | Estonia | ✅ |
| EL | Ελλάδα | Αριθμός ΦΠΑ | 希腊 | Greece | ✅ |
| ES | España | NIF (IVA) | 西班牙 | Spain | ✅ |
| FI | Suomi | ALV-numero | 芬兰 | Finland | ✅ |
| FR | France | numéro de TVA | 法国 | France | ✅ |
| HR | Hrvatska | PDV broj | 克罗地亚 | Croatia | ✅ |
| HU | Magyarország | ÁFA-szám | 匈牙利 | Hungary | ✅ |
| IE | Ireland / Éire | VAT number | 爱尔兰 | Ireland | ✅ |
| IT | Italia | Partita IVA | 意大利 | Italy | ✅ |
| LT | Lietuva | PVM kodas | 立陶宛 | Lithuania | ✅ |
| LU | Lëtzebuerg / Luxembourg | numéro TVA | 卢森堡 | Luxembourg | ✅ |
| LV | Latvija | PVN numurs | 拉脱维亚 | Latvia | ✅ |
| MT | Malta | VAT number | 马耳他 | Malta | ✅ |
| NL | Nederland | btw-nummer | 荷兰 | Netherlands | ✅ |
| PL | Polska | NIP | 波兰 | Poland | ✅ |
| PT | Portugal | NIF | 葡萄牙 | Portugal | ✅ |
| RO | România | cod de TVA | 罗马尼亚 | Romania | ✅ |
| SE | Sverige | momsregistreringsnummer | 瑞典 | Sweden | ✅ |
| SI | Slovenija | ID za DDV | 斯洛文尼亚 | Slovenia | ✅ |
| SK | Slovensko | IČ DPH | 斯洛伐克 | Slovakia | ✅ |
| GB | United Kingdom | VAT registration number | 英国 | United Kingdom | — |
| XI | Northern Ireland | VAT registration number (XI) | 北爱尔兰 | Northern Ireland | — |

> 叫法取当地商务常用写法；部分国家有不止一种官方接受的写法，表中列最主要的那种。
> Terms follow common local business usage — some countries accept more than one form; the main one is shown.

## 快速开始（本地）

```bash
npm install
npm run build
npm start            # stdio 传输，接任意 MCP 客户端
npm test             # vitest 全绿
npm run verify       # 生成真实 payload 验证报告 verify-report.html
```

### 与 MCP 客户端对接（stdio）

```json
{
  "mcpServers": {
    "vat-validator": {
      "command": "node",
      "args": ["/abs/path/vies-vat-validator-mcp/dist/index.js"]
    }
  }
}
```

### 通过 HTTP 对接（远程 / Apify）

把你的 MCP 客户端指向 Streamable HTTP 端点：

```
https://neeenja--vies-vat-validator-mcp.apify.actor/mcp
```

并带上请求头 `Authorization: Bearer <APIFY_TOKEN>`。

## 调用示例

**格式预校验（免费）**
```json
{ "name": "check_vat_format", "arguments": { "vat": "FR123456789" } }
```
→ `{ "formatValid": true, "normalized": "FR123456789", "pattern": "^([A-Z]{2})?\\d{9}$" }`

**实查（付费事件）**
```json
{ "name": "validate_vat", "arguments": { "vat": "FR123456789", "useCache": true, "live": true } }
```
→ `{ "valid": true, "formatValid": true, "viesValid": true, "source": "vies", "name": "...", "address": "..." }`

## 错误码（节选）

| 代码 | 中文 | EN |
|---|---|---|
| `VAT_FORMAT_INVALID` | 格式不符 | format mismatch |
| `VAT_VIES_INVALID` | VIES 判定无效 | VIES says invalid |
| `VIES_MS_UNAVAILABLE` | 成员国系统不可用 | member state down |
| `VIES_TIMEOUT` | 超时 | timeout |
| `NETWORK_ERROR` | 网络错误 | network error |

完整表见 `get_error_codes` 或 `vat://error-codes`。

## 部署（Apify Pay-Per-Event）

```bash
npm run apify:login      # 本人先完成 KYC（一次性）
npm run apify:validate   # 校验 actor.json
npm run apify:push       # 上架
```

计费见 `.actor/actor.json` 的 `pricingEvents`：格式 / 错误 / 国家查询免费，仅 `mcp-validate-vat` 计费。

## 设计红线

- 不引入 `express` / `soap` / `fast-xml-parser`：SOAP 信封手写、响应用命名空间无关的正则提取。
- 永不崩溃：VIES 故障 / 网络错误全部映射为双语错误码。
- 免费层（格式校验 + 缓存）保证冷启动零成本。

完整契约见 [SPEC.md](./SPEC.md)。

---

<a id="繁體中文"></a>
# 繁體中文

## 為什麼做這個

- **監管剛需** —— 歐盟 B2B 交易要求核驗對方 VAT 稅號（逆向徵收 / 合規憑證）。
- **VIES 又慢又抖** —— 官方 SOAP 介面頻繁限流、偶發停機，快取 + 優雅降級是必選項。
- **零冷啟動成本** —— 免費官方資料源，疊加一層封裝 + 可解釋的雙語輸出，按事件計費。

## 你能拿到什麼

| 能力 | 說明 | 計費 |
|---|---|---|
| `validate_vat` | 先做免費本地格式校驗，再依需求呼叫歐盟官方 VIES 介面核驗真實性；結構化 + 雙語錯誤 | $0.0005 / 次 |
| `check_vat_format` | 純本地正則格式校驗，**零網路、零成本** | 免費 |
| `list_supported_countries` | 回傳支援國家（母語名 + 當地 VAT 叫法 + 中/英） | 免費 |
| `get_error_codes` | 回傳完整中英雙語錯誤碼表 | 免費 |
| resources | `vat://error-codes` / `vat://supported-countries` / `vat://spec` | 免費 |
| prompts | `vat_compliance_guide` / `explain_vat_result` | 免費 |

涵蓋 **EU 27 + GB + XI**（北愛爾蘭）。每個國家還帶**母語名**，以及更實用的**當地對 VAT 號的叫法**——這才是當地人真正會搜的詞：

| 代码 Code | 母语名 Native | 当地 VAT 叫法 Local VAT term | 中文 | English | EU |
|---|---|---|---|---|---|
| AT | Österreich | UID-Nummer | 奥地利 | Austria | ✅ |
| BE | België / Belgique | BTW-nummer / numéro de TVA | 比利时 | Belgium | ✅ |
| BG | България | ДДС номер | 保加利亚 | Bulgaria | ✅ |
| CY | Κύπρος / Kıbrıs | Αριθμός ΦΠΑ | 塞浦路斯 | Cyprus | ✅ |
| CZ | Česko | DIČ | 捷克 | Czech Republic | ✅ |
| DE | Deutschland | USt-IdNr. | 德国 | Germany | ✅ |
| DK | Danmark | CVR-nummer | 丹麦 | Denmark | ✅ |
| EE | Eesti | KMKR number | 爱沙尼亚 | Estonia | ✅ |
| EL | Ελλάδα | Αριθμός ΦΠΑ | 希腊 | Greece | ✅ |
| ES | España | NIF (IVA) | 西班牙 | Spain | ✅ |
| FI | Suomi | ALV-numero | 芬兰 | Finland | ✅ |
| FR | France | numéro de TVA | 法国 | France | ✅ |
| HR | Hrvatska | PDV broj | 克罗地亚 | Croatia | ✅ |
| HU | Magyarország | ÁFA-szám | 匈牙利 | Hungary | ✅ |
| IE | Ireland / Éire | VAT number | 爱尔兰 | Ireland | ✅ |
| IT | Italia | Partita IVA | 意大利 | Italy | ✅ |
| LT | Lietuva | PVM kodas | 立陶宛 | Lithuania | ✅ |
| LU | Lëtzebuerg / Luxembourg | numéro TVA | 卢森堡 | Luxembourg | ✅ |
| LV | Latvija | PVN numurs | 拉脱维亚 | Latvia | ✅ |
| MT | Malta | VAT number | 马耳他 | Malta | ✅ |
| NL | Nederland | btw-nummer | 荷兰 | Netherlands | ✅ |
| PL | Polska | NIP | 波兰 | Poland | ✅ |
| PT | Portugal | NIF | 葡萄牙 | Portugal | ✅ |
| RO | România | cod de TVA | 罗马尼亚 | Romania | ✅ |
| SE | Sverige | momsregistreringsnummer | 瑞典 | Sweden | ✅ |
| SI | Slovenija | ID za DDV | 斯洛文尼亚 | Slovenia | ✅ |
| SK | Slovensko | IČ DPH | 斯洛伐克 | Slovakia | ✅ |
| GB | United Kingdom | VAT registration number | 英国 | United Kingdom | — |
| XI | Northern Ireland | VAT registration number (XI) | 北爱尔兰 | Northern Ireland | — |

> 叫法取当地商务常用写法；部分国家有不止一种官方接受的写法，表中列最主要的那种。
> Terms follow common local business usage — some countries accept more than one form; the main one is shown.

## 快速開始（本地）

```bash
npm install
npm run build
npm start            # stdio 傳輸，接任意 MCP 用戶端
npm test             # vitest 全綠
npm run verify       # 產生真實 payload 驗證報告 verify-report.html
```

### 與 MCP 用戶端對接（stdio）

```json
{
  "mcpServers": {
    "vat-validator": {
      "command": "node",
      "args": ["/abs/path/vies-vat-validator-mcp/dist/index.js"]
    }
  }
}
```

### 透過 HTTP 對接（遠端 / Apify）

將你的 MCP 用戶端指向 Streamable HTTP 端點：

```
https://neeenja--vies-vat-validator-mcp.apify.actor/mcp
```

並帶上請求標頭 `Authorization: Bearer <APIFY_TOKEN>`。

## 呼叫範例

**格式預校驗（免費）**
```json
{ "name": "check_vat_format", "arguments": { "vat": "FR123456789" } }
```
→ `{ "formatValid": true, "normalized": "FR123456789", "pattern": "^([A-Z]{2})?\\d{9}$" }`

**實查（付費事件）**
```json
{ "name": "validate_vat", "arguments": { "vat": "FR123456789", "useCache": true, "live": true } }
```
→ `{ "valid": true, "formatValid": true, "viesValid": true, "source": "vies", "name": "...", "address": "..." }`

## 錯誤碼（節選）

| 代碼 | 中文 | EN |
|---|---|---|
| `VAT_FORMAT_INVALID` | 格式不符 | format mismatch |
| `VAT_VIES_INVALID` | VIES 判定無效 | VIES says invalid |
| `VIES_MS_UNAVAILABLE` | 成員國系統不可用 | member state down |
| `VIES_TIMEOUT` | 逾時 | timeout |
| `NETWORK_ERROR` | 網路錯誤 | network error |

完整表見 `get_error_codes` 或 `vat://error-codes`。

## 部署（Apify Pay-Per-Event）

```bash
npm run apify:login      # 本人先完成 KYC（一次性）
npm run apify:validate   # 校驗 actor.json
npm run apify:push       # 上架
```

計費見 `.actor/actor.json` 的 `pricingEvents`：格式 / 錯誤 / 國家查詢免費，僅 `mcp-validate-vat` 計費。

## 設計紅線

- 不引入 `express` / `soap` / `fast-xml-parser`：SOAP 信封手寫、回應用命名空間無關的正則提取。
- 永不崩潰：VIES 故障 / 網路錯誤全部映射為雙語錯誤碼。
- 免費層（格式校驗 + 快取）保證冷啟動零成本。

完整契約見 [SPEC.md](./SPEC.md)。

---

## License

MIT — see [LICENSE](./LICENSE).

---

## Support · 赞助 · 贊助

**EN** — **VIES VAT Validator MCP** is open source (MIT), ad-free. It is funded by the community, not by ads. If it powers your agents or workflow, please support it:
- ☕ Ko-fi (the **Sponsor** ❤️ button on this repo routes here): https://ko-fi.com/panstories

**简体中文** — **VIES VAT Validator MCP** 开源（MIT）、无广告，由社区资助而非广告。若它支撑了你的智能体或工作流，欢迎赞助：点本仓库的 **Sponsor** 按钮（跳转 Ko-fi）或前往 https://ko-fi.com/panstories

**繁體中文** — **VIES VAT Validator MCP** 開源（MIT）、無廣告，由社群資助而非廣告。若它支撐了你的智能體或工作流，歡迎贊助：點本倉庫的 **Sponsor** 按鈕（導向 Ko-fi）或前往 https://ko-fi.com/panstories

Thank you! · 谢谢 · 謝謝 💙
