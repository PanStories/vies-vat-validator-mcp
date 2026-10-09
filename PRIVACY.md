# Privacy Policy

**Product:** VIES VAT Validator MCP (MCP server)
**Operator:** PanStories
**Repository:** https://github.com/PanStories/vies-vat-validator-mcp
**Last updated:** 2026-10-09
**Effective date:** 2026-10-09

This policy explains what data VIES VAT Validator MCP ("the Service", "we") processes
when you connect to it as a Model Context Protocol (MCP) server — via the hosted endpoint
or a self-hosted build — and what we deliberately do **not** collect.

> **Note:** VAT numbers are usually business identifiers, but a sole trader's VAT number
> can be personal data. Only submit VAT numbers you are permitted to validate.

---

## 1. Summary (TL;DR)

- The Service is a **read-only** MCP server. Its tools only *look up* a VAT number's
  validity. They never register, modify, or act on any tax record.
- **No accounts, no sign-up, no cookies, no advertising or analytics trackers.**
- We do **not** sell, rent, or share your data with advertisers or data brokers.
- The input you submit — a **VAT number and its country** — is forwarded to the official
  **EU Commission VIES** service for validation, and may be held briefly in an
  **in-process (memory-only) cache**. It is **not** written to disk or any database.
- Hosting is provided by **Apify**; platform-level processing is governed by Apify's own
  privacy policy.

---

## 2. Data we process

| Data | Source | Why we process it | Retention |
|---|---|---|---|
| VAT number + country code | You | Format pre-check; forwarded to EU VIES for validation | In memory for the request; a successful result may be cached **in memory (default 24h TTL)** |
| IP address + User-Agent | Your request | Transient rate-limiting only | In-memory window; not persisted, not logged to disk |
| Apify API token | Apify gateway | Authenticates the caller at the platform edge | Not seen or stored by the Service |

## 3. What we do NOT collect

- No names, email addresses, phone numbers, or other personal identifiers.
- No accounts, passwords, or credentials.
- No persistent store of VAT numbers or validation results (the cache is memory-only and
  is discarded on restart).
- No cookies, analytics, pixels, or advertising trackers.

## 4. Third parties / data recipients

| Recipient | Purpose | What they see | Notes |
|---|---|---|---|
| **European Commission — VIES** (`ec.europa.eu`) | Official validation of EU VAT numbers | The VAT number + country code you submit | Public EU service; see the Commission's own privacy notices |
| **Apify** (hosting) | Runs the Standby container and meters usage | Request metadata | Subject to Apify's privacy policy |

We do not disclose your inputs to any other third party.

## 5. Hosting and infrastructure

The hosted Service runs on Apify's Standby infrastructure. Apify may process operational
metadata (timestamps, IP, billing records) as an independent controller. See
<https://apify.com/privacy-policy>. The Service runs no database and keeps no persistent
store of user data.

## 6. Self-hosted / open-source builds

This repository is open source (MIT). When you self-host, **you** are the data controller
for anything your deployment processes. The code ships with no telemetry that reports back
to us.

## 7. Security

Transport is encrypted (TLS) at the Apify edge. All requests require the Apify gateway
bearer token. See [`SECURITY.md`](./SECURITY.md) for the threat model and vulnerability
reporting.

## 8. Children's privacy

The Service is a developer tool not directed at children, and we do not knowingly process
data from children under 16.

## 9. Your rights

Because we do not maintain user profiles and the cache is memory-only, there is generally
no personal data to access, correct, or erase. If you believe we hold data about you,
contact us (Section 11) and we will respond within 30 days.

## 10. Changes to this policy

We may update this policy as the Service evolves. Material changes will be reflected in the
"Last updated" date and, where appropriate, in the repository changelog.

## 11. Contact

Privacy questions or requests:
**Open an issue** at <https://github.com/PanStories/vies-vat-validator-mcp/issues>.
For security matters, see [`SECURITY.md`](./SECURITY.md).

---

## 简体中文

**产品：** VIES VAT Validator MCP — 欧盟 VIES 增值税号校验 MCP server
**运营方：** PanStories
**最后更新：** 2026-10-09

> **提示：** VAT 税号通常为企业标识，但个体经营者税号可能属于个人信息；
> 请仅提交你有权校验的税号。

### 概要

- 本服务是**只读** MCP server，工具仅*查询*税号有效性，不会登记、修改或操作任何税务记录。
- **无账号、无注册、无 Cookie、无广告或分析追踪。**
- 我们**不会**向广告商或数据经纪商出售、出租或共享你的数据。
- 你提交的输入——**VAT 税号及所属国家**——将转发至欧盟官方 **VIES** 服务校验，
  并可能短暂保存在**进程内（仅内存）缓存**中，**不**写入磁盘或任何数据库。
- 托管由 **Apify** 提供，平台层处理受 Apify 隐私政策约束。

### 我们处理的数据

| 数据 | 来源 | 用途 | 保留 |
|---|---|---|---|
| VAT 税号 + 国家代码 | 调用方 | 格式预校验；转发至欧盟 VIES 校验 | 请求期间驻留内存；成功结果可**仅内存缓存（默认 24h TTL）** |
| IP + User-Agent | 请求 | 仅用于限流 | 内存窗口，不落盘 |
| Apify API token | Apify 网关 | 在平台边缘鉴权 | 本服务不接触、不存储 |

### 第三方

- **欧盟委员会 — VIES**（`ec.europa.eu`）：对 EU VAT 税号进行官方校验；对方将看到你提交的
  税号与国家代码。请参见欧盟委员会自身的隐私声明。
- **Apify**（托管）：运行 Standby 容器并计量。

### 自托管

本仓库为开源（MIT）。自托管时**你**即数据处理的控制者；代码不含任何回传遥测。
缓存为内存态，重启即丢弃。

### 联系方式

在 <https://github.com/PanStories/vies-vat-validator-mcp/issues> 提交 issue。
安全事项见 [`SECURITY.md`](./SECURITY.md)。
