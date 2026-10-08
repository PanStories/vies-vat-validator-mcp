#!/usr/bin/env node
// Unified entry point for vies-vat-validator-mcp.
//
// - Local / MCP client (no web-server port env): stdio transport.
// - Apify Standby / remote MCP client: Streamable HTTP server listening on the
//   platform-assigned port. It MUST answer Apify's container readiness probe on
//   GET / (header x-apify-container-server-readiness-probe) or the standby run is
//   never marked READY and gets killed as "idle". This is the #1 cause of a
//   standby MCP that "builds but never serves".
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMcpServer } from "./mcp/server.js";

const PORT = Number(
  process.env.ACTOR_WEB_SERVER_PORT ??
    process.env.APIFY_CONTAINER_PORT ??
    process.env.PORT ??
    3000,
);
const HOST = process.env.HOST ?? "0.0.0.0";
const MCP_PATH = "/mcp";

// Apify platform detection. On the platform, billing + Actor APIs are available.
const AT_HOME = !!(
  process.env.APIFY_TOKEN ||
  process.env.APIFY_ACTOR_EVENTS ||
  process.env.APIFY_META_ORIGIN
);

/**
 * Initialize the Apify Actor when running on the platform. `Actor.charge()` (used
 * by the tools via src/mcp/charge.ts) requires the Actor to be initialized first.
 * Imported lazily so local / self-hosted runs never need the heavy `apify` dep.
 */
async function initApify(): Promise<{ charge: (event: string) => Promise<void> }> {
  if (!AT_HOME) return { charge: async () => {} };
  try {
    // @ts-ignore - `apify` is only installed inside the Apify container image.
    const mod: any = await import("apify");
    const Actor = mod?.Actor;
    if (Actor?.init) await Actor.init();
    return {
      charge: async (event: string) => {
        if (Actor?.charge) await Actor.charge(event);
      },
    };
  } catch {
    // apify missing — run without platform billing.
    return { charge: async () => {} };
  }
}

function sendJson(
  res: ServerResponse,
  status: number,
  payload: unknown,
  headers: Record<string, string> = {},
): void {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    ...headers,
  });
  res.end(body);
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  if (!chunks.length) return undefined;
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  return raw ? JSON.parse(raw) : undefined;
}

async function startHttpServer(): Promise<void> {
  await initApify();

  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    // --- Apify container readiness probe: must return 200 or the run is killed. ---
    if (path === "/") {
      if (req.headers["x-apify-container-server-readiness-probe"]) {
        sendJson(res, 200, { status: "ready" });
        return;
      }
      sendJson(res, 200, {
        name: "vies-vat-validator-mcp",
        version: "1.0.1",
        transport: "streamable-http",
        mcpEndpoint: MCP_PATH,
        health: "/health",
        tools: [
          "validate_vat",
          "check_vat_format",
          "list_supported_countries",
          "get_error_codes",
        ],
        pricing: { "validate_vat (live VIES)": "$0.0005", others: "free" },
      });
      return;
    }

    if (path === "/health") {
      sendJson(res, 200, {
        status: "ok",
        uptime: Math.round(process.uptime()),
        apify: AT_HOME,
      });
      return;
    }

    // --- MCP protocol endpoint (stateless Streamable HTTP) ---
    if (path === MCP_PATH) {
      if (req.method !== "POST") {
        sendJson(
          res,
          405,
          {
            jsonrpc: "2.0",
            error: {
              code: -32000,
              message: "Method Not Allowed: stateless server accepts POST only on /mcp",
            },
            id: null,
          },
          { Allow: "POST" },
        );
        return;
      }
      try {
        const body = await readJsonBody(req);
        // New server + transport per request (stateless; supports concurrency/cold start).
        const mcp = createMcpServer();
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: undefined,
          enableJsonResponse: true,
        });
        res.on("close", () => {
          void transport.close();
          void mcp.close();
        });
        await mcp.connect(transport);
        await transport.handleRequest(req, res, body);
      } catch (err) {
        console.error("[vies-vat-validator-mcp] request error:", err);
        if (!res.headersSent) {
          sendJson(res, 500, {
            jsonrpc: "2.0",
            error: { code: -32603, message: `Internal server error: ${(err as Error)?.message ?? err}` },
            id: null,
          });
        }
      }
      return;
    }

    sendJson(res, 404, { error: "Not found", mcpEndpoint: MCP_PATH });
  });

  server.listen(PORT, HOST, () => {
    console.log(
      `[vies-vat-validator-mcp] Streamable HTTP server listening on http://${HOST}:${PORT}${MCP_PATH}`,
    );
    console.log(
      `[vies-vat-validator-mcp] standby=${process.env.APIFY_META_ORIGIN ?? "local"} apify=${AT_HOME}`,
    );
  });
}

async function startStdio(): Promise<void> {
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("vies-vat-validator-mcp running on stdio");
}

async function main(): Promise<void> {
  const wantsHttp =
    process.env.ACTOR_WEB_SERVER_PORT ||
    process.env.APIFY_CONTAINER_PORT ||
    process.env.APIFY_WEB_SERVER_PORT ||
    process.argv.includes("--http");
  if (wantsHttp) {
    await startHttpServer();
  } else {
    await startStdio();
  }
}

main().catch((err) => {
  console.error("Fatal error starting vies-vat-validator-mcp:", err);
  process.exit(1);
});
