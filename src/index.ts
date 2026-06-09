#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { FilevineClient } from "./client";
import { registerProjectTools } from "./tools/projects";
import { registerNotesAndTasksTools } from "./tools/notes-tasks";
import { registerContactTools } from "./tools/contacts";
import { registerDocumentTools } from "./tools/documents";
import { registerLeadDocketTools } from "./tools/lead-docket";

async function main() {
  let fv: FilevineClient;

  try {
    fv = new FilevineClient();
  } catch (e: any) {
    console.error(`[filevine-mcp] Failed to initialize: ${e.message}`);
    process.exit(1);
  }

  console.error("[filevine-mcp] Config:", {
    region: process.env.FILEVINE_REGION || "us",
    orgId: process.env.FILEVINE_ORG_ID,
    userId: process.env.FILEVINE_USER_ID || "(not set)",
    debug: process.env.FILEVINE_DEBUG === "1" || process.env.FILEVINE_DEBUG === "true",
    clientIdSet: !!process.env.FILEVINE_CLIENT_ID,
    patSet: !!process.env.FILEVINE_PAT,
  });

  const server = new McpServer({
    name: "filevine-mcp",
    version: "1.0.0",
  });

  // Register all tool groups
  registerProjectTools(server, fv);
  registerNotesAndTasksTools(server, fv);
  registerContactTools(server, fv);
  registerDocumentTools(server, fv);
  registerLeadDocketTools(server);

  // Start server over stdio (required for Claude Desktop MCP)
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("[filevine-mcp] Server running. Tools ready.");
}

main().catch((e) => {
  console.error("[filevine-mcp] Fatal error:", e);
  process.exit(1);
});
