# Apify actor Dockerfile for vat-validator-mcp
FROM apify/actor-node:22-slim

# Copy package manifests and install ALL deps (incl. dev/typescript).
# The apify/actor-node base image sets NODE_ENV=production, which makes npm
# silently skip devDependencies (where typescript lives) unless we force
# --include=dev. Without this, `tsc` is never installed and the build fails.
COPY package.json ./
RUN npm install --include=dev --no-audit --no-fund

# Copy source.
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript to dist. Invoke the locally-installed tsc binary directly
# (node node_modules/typescript/bin/tsc) — `npx tsc` resolves to the wrong
# typosquat "tsc@2.0.4" package in the cloud build and fails.
RUN node node_modules/typescript/bin/tsc -p tsconfig.json

# Slim the image: drop dev deps (typescript/tsx/vitest) now that dist/ is built.
# Runtime only needs @modelcontextprotocol/sdk + zod (both in dependencies).
RUN npm prune --omit=dev --no-audit --no-fund

# Run the Apify web server (StreamableHTTP on port 3000).
ENV APIFY_WEB_SERVER_PORT=3000
CMD ["node", "dist/index.js"]
