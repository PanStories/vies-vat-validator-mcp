// Apify webServer request handler (StreamableHTTP, stateless).
// Exposed as `requestHandler` so `.actor/actor.json` can point to it.
// Runs inside Apify's managed server; locally testable via a plain http server.
import type { IncomingMessage, ServerResponse } from "http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpServer } from "./mcp/server.js";

function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      if (!data) return resolve(undefined);
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

function setCors(res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, mcp-session-id, Accept");
}

export const requestHandler = async (req: IncomingMessage, res: ServerResponse) => {
  setCors(res);
  if (req.method === "OPTIONS") {
    res.writeHead(204).end();
    return;
  }

  const url = new URL(req.url ?? "/", "http://localhost");
  if (url.pathname !== "/mcp") {
    res.writeHead(404).end("Not Found");
    return;
  }

  // Stateless mode does not support SSE streams.
  if (req.method === "GET") {
    res.writeHead(405).end("Method Not Allowed");
    return;
  }

  try {
    const body = (await readBody(req)) as Record<string, unknown> | undefined;
    // New transport + server per request (stateless).
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    const server = createMcpServer();
    await server.connect(transport);
    await transport.handleRequest(req, res, body);
  } catch (err) {
    if (!res.headersSent) {
      res.writeHead(500).end("Internal Server Error");
    }
  }
};
