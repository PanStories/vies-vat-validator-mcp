# Apify actor Dockerfile for vat-validator-mcp
FROM apify/actor-node:22-slim

# Copy package manifests and install production deps.
COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund

# Copy source.
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript to dist.
RUN npm install --no-save typescript@5.5.4 --no-audit --no-fund \
  && npx tsc -p tsconfig.json

# Run the Apify web server (StreamableHTTP on port 3000).
ENV APIFY_WEB_SERVER_PORT=3000
CMD ["node", "dist/index.js"]
