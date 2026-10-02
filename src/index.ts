#!/usr/bin/env node
// Entry point.
// - Default (local / MCP client): stdio transport.
// - Apify webServer mode (APIFY_WEB_SERVER_PORT set): Apify imports
//   `src/handler.ts`'s `requestHandler` to serve MCP over HTTP; here we just
//   keep the process alive and must NOT start stdio.
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMcpServer } from "./mcp/server.js";

async function main() {
  if (process.env.APIFY_WEB_SERVER_PORT) {
    // Apify webServer mode: platform owns the HTTP server + requestHandler.
    // Keep the process alive without binding stdio.
    // eslint-disable-next-line no-empty
    await new Promise(() => {});
    return;
  }

  const server = createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal error starting VAT validator MCP:", err);
  process.exit(1);
});
