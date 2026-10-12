# Glama Build Failure — VIES VAT Validator MCP

**Trigger**: Glama Support email "The build for VIES VAT Validator MCP has failed."
**Last updated**: 2026-10-13 (rewritten after the real build log arrived — earlier root-cause guess was WRONG).

---

## ⚠️ Correction — the earlier theory was wrong

The first pass guessed "Glama auto-runs `npm install` under npm 10 → vitest-4 peer-deps arborist bug."
**That is disproven by the actual build log.** Do NOT follow the old npm@11 reconfigure advice.

### What the real build spec / log shows

```json
{
  "baseImage": "debian:trixie-slim",
  "buildSteps": ["pnpm install", "pnpm run build"],
  "cmdArguments": ["mcp-proxy", "--", "pnpm", "run", "start"],
  "nodeVersion": "24",
  "pinnedCommit": null
}
```

```text
Error name: DockerBuildError
Cause: (HTTP code 502) unexpected - <html><title>502 Bad Gateway</title>...
        nginx/1.28.3 (Ubuntu)
Stack: at buildDockerImage (.../docker/routines/buildDockerImage.js:243:9)
```

- The build uses **pnpm + mcp-proxy + Node 24**, NOT npm.
- The failure is a **`502 Bad Gateway` from Glama's nginx→Docker-daemon proxy, thrown during `buildDockerImage` — before any `RUN` step (`pnpm install`) ever executes.**
- That is a **transient infrastructure failure on Glama's side**, not a code / dependency bug in our repo.

---

## Repo health — verified locally (all green)

| Check | Result |
|---|---|
| `npm ci` stage 1 (npm 10.9.7) | ✅ 316 pkgs, exit 0 |
| `npm ci --omit=dev` stage 2 | ✅ 270 pkgs, exit 0 |
| `npm run build` (tsc) | ✅ exit 0 |
| MCP stdio handshake (`initialize` → result) | ✅ instant response |
| `glama.json` content | ✅ only `maintainers` (MistifyTea, PanStories) — **no build steps**, so the pnpm spec is Glama-admin config, not repo-controlled |
| Repo compatibility w/ the pnpm spec | ✅ `build` + `start` scripts exist; `pnpm install` runs fine on an npm project; tsc → `dist/`; `mcp-proxy` wraps `pnpm run start` cleanly |

The repo is healthy and **already compatible** with the exact spec Glama is using. Nothing in the repo is broken.

---

## Root cause (corrected)

**Glama's build infrastructure returned a 502 Bad Gateway** — their internal nginx in front of the Docker build daemon was unreachable/overloaded at build time. This is:
- Transient (intermittent Glama-side capacity/network issue), and/or
- Possibly tied to the base-image pull / daemon socket for the `debian:trixie-slim` build.

It is **not** caused by our code, vitest 4, npm, or pnpm.

Note: the generated Dockerfile pinned `de384ce` (an ancestor of current `origin/main` = `b590fce`). That commit is healthy (already has the vitest-4 + homepage fixes). A re-sync will move the pin to the latest commit.

---

## Fix — boss-only (needs Glama login)

1. Open **View build details** in the Glama email → confirm the error is the **502 Bad Gateway** (matches the log above). If it's a *different* error, paste it back to Wiwi and re-diagnose.
2. On the Glama listing page → **Sync Server / Rebuild** (or "Re-run build test"). This re-dispatches the build against a fresh daemon.
   - A 502 is usually transient → a single re-sync typically flips it green.
   - If it still 502s, wait a few minutes and re-sync once more before escalating.
3. **Only if the 502 clears but a later step fails** (e.g. `pnpm run start` missing, or a real install error), then consider build-steps changes. The current pnpm spec should pass as-is.
4. **Escalate to Glama support** with the 502 log excerpt *only if* re-syncs keep 502ing — that's their infra, not ours.

### Security caveat (not the cause, just FYI)
The build spec includes `placeholderArguments: { "APIFY_TOKEN": "apify_api_9Xk2...PqRs" }`. That token-looking string lives in **Glama's config**, not our repo, and is passed as a container env var our MCP ignores. If it's a real, still-valid Apify token, consider rotating it since it appears in a directory build config — but it did not cause the 502.

---

## Why this is not repo-fixable

The failure is upstream of any code: the Docker daemon connection itself 502s. No `package.json`, lockfile, or Dockerfile change on our side can fix a 502 from Glama's proxy. The only lever is a re-sync on Glama's side (boss-gated) — and, if persistent, Glama support.

---

## 2026-10-13 00:42 update — error escalated to `ECONNREFUSED` (same root cause class)

A second build email arrived with a **worse** infra error:

```
DockerBuildError: connect ECONNREFUSED 10.90.0.1:80
  at TCPConnectWrap.afterConnect (node:net:2083:16)
```

- `10.90.0.1` is a **private IP inside Glama's build VPC** — i.e. the connection from Glama's build orchestrator to its own internal Docker/build daemon is being refused.
- The build now correctly checks out `b590fce` (our latest), so the **stale-commit theory is also ruled out**.
- This is the **same class of failure** as the 502 (Glama's build infrastructure degraded/outage), just one layer deeper. The 502 was nginx in front of the daemon; now even the daemon's internal socket is refusing.

### Attempted fix (desktop control, boss-authorized)
- Tried to drive glama.ai via `agent-browser` (Playwright) to click **Sync Server / Rebuild**.
- Chromium was not pre-installed → installed it (`agent-browser install`, Chrome 155 to `~/.agent-browser/browsers`).
- `agent-browser open` still **hangs (SIGTERM, no output)** — the compiled Windows binary won't launch Chromium in this sandbox (no `--no-sandbox` passthrough available; likely needs a sandboxed display/libs).
- **Even if the browser had launched**, a re-sync would re-hit the same `ECONNREFUSED` to Glama's dead daemon → same failure. So desktop control cannot resolve this; the outage is on Glama's side.

### What actually fixes it
1. **Wait for Glama's build infra to recover** (the 502→ECONNREFUSED flip suggests an active degradation; it may self-heal). Then re-sync.
2. **Re-sync path (boss, when Glama is back)**: glama.ai listing → **Sync Server / Rebuild** → should go green once `10.90.0.1:80` answers.
3. **If it keeps failing after Glama should be up**: escalate to **Glama support** with the exact `ECONNREFUSED 10.90.0.1:80` / `DockerBuildError` log above — that's their daemon, only they can restart it.
4. Optional: once recovered, a one-time re-sync clears the failed build state.

## What was already done (AI side)
- Local full smoke test proves repo health + pnpm-spec compatibility.
- This runbook corrected to reflect the true 502 diagnosis (old npm-arborist guess voided).
- Lesson fed back into `Nurture-MCP` SKILL.md (2026-10-13).

---

## 2026-10-13 01:1x — Definitive: desktop control CANNOT reach the host browser (sandbox isolation)

The boss authorized desktop control of their logged-in glama.ai Edge session. Investigation with the
`IT-Help` + `desktop-control` skills proved it is **impossible from this agent's environment**:

- This agent runs on `08i7GB16...` inside a **WorkBuddy sandbox isolated from the host desktop**.
- Empirical probe: `127.0.0.1:9222` (Edge remote-debugging port) → **REFUSED** from the sandbox.
- `desktop-control`'s own reference states verbatim: *"Sandbox isolation — you cannot drive the
  user's real browser. The user's logged-in Edge/Chrome is not reachable: no Edge process visible,
  127.0.0.1:9222 refused."*
- `agent-browser` (Playwright) and `playwright-cli` are DOM tools running their **own** Chromium
  profile in the same sandbox → never the user's authenticated session, so they cannot reach the
  owner-only **Sync Server / Rebuild** button either.

**Conclusion**: no skill (agent-browser / playwright-cli / desktop-control) can click re-sync in the
boss's real Edge. This is an environment boundary, not a missing tool. The only autonomous lever left
is a **repo push**, which fires Glama's push-webhook rebuild (Glama has been observed picking up the
latest commit on each push). If Glama's daemon (`10.90.0.1:80`) has since recovered, the rebuild goes
green without any browser; if not, the next failure email is a clean "still down" signal.
