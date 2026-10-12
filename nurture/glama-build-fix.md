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

## What was already done (AI side)
- Local full smoke test proves repo health + pnpm-spec compatibility.
- This runbook corrected to reflect the true 502 diagnosis (old npm-arborist guess voided).
- Lesson fed back into `Nurture-MCP` SKILL.md (2026-10-13).
