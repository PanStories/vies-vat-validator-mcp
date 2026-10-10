# Glama Build Failure — VIES VAT Validator MCP (2026-10-10)

**Trigger**: Glama Support email 2026-10-10 03:56 — "The build for VIES VAT Validator MCP has failed."

## What we verified (repo is healthy — all local, 2026-10-10)

| Check | Result |
|---|---|
| `npm ci` stage 1 (full deps, npm 10.9.7 = what node:22 ships) | ✅ 316 pkgs, exit 0 |
| `npm ci --omit=dev` stage 2 (npm 10.9.7) | ✅ 270 pkgs, exit 0 |
| `npm run build` (tsc) | ✅ exit 0 |
| MCP stdio handshake (`initialize` → result, the "ping" Glama runs) | ✅ instant response |

## Root cause (best-supported)

Glama does **not** build from the repo's `Dockerfile.glama` — it generates its own image
(debian + node, clone into `/app`) and **auto-detects build steps** (typically `npm install`).
Under npm 10.x, `npm install` of vitest 4's peer deps hits the arborist `#loadPeerSet` bug —
**the exact failure already proven on the Apify cloud build** and fixed there by pinning
npm@11 in `.actor/Dockerfile` (commit `82d0c9b`, 2026-10-09: "cloud build was failing").
The Glama-side equivalent was never applied because that setting lives in Glama's admin UI,
not the repo. (Corroborating precedent: github.com/alexar76/aimarket-mcp `docs/GLAMA.md` —
"Glama does not use repo Dockerfiles … Configure the Build steps field in admin — do not
rely on auto-detected …".)

## Fix — boss-only (needs Glama login)

1. Open the **View build details** link in the Glama email → confirm the exact failing step
   (expect an `npm install`/ERESOLVE/arborist error; if it's something else, paste it back to Wiwi).
2. On the listing page → **Claim** ownership (`glama.json` with maintainers
   `MistifyTea`, `PanStories` is already in the repo to trigger this).
3. Glama Admin → Dockerfile / build page → set:
   - **Build steps** (ordered):
     ```json
     ["npm install -g npm@11 --no-audit --no-fund", "npm ci --include=dev --no-audit --no-fund", "npm run build"]
     ```
   - **CMD arguments**: `["node", "dist/index.js"]`
   - **Pinned commit**: `main`
   - (Leave Glama's default image; do NOT point it at `Dockerfile.glama` — that file is
     for local/self-host builds only.)
4. **Sync Server** → re-run the build test. Success = listing gains the "usable" /
   Docker green check.

## Why not repo-fixable

The bug is in npm 10's resolver, not our code; the repo already installs cleanly from its
lockfile via `npm ci` (both stages verified). Glama's auto-detected `npm install` path
bypasses the lockfile's resolved peer set, so only the admin build-steps override fixes it.
