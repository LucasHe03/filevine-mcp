#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { FilevineClient } from "./client";
import { registerProjectTools } from "./tools/projects";
import { registerNotesAndTasksTools } from "./tools/notes-tasks";
import { registerUserTools } from "./tools/users";

async function main() {
  let fv: FilevineClient;

  try {
    fv = new FilevineClient();
  } catch (e: any) {
    console.error(`[filevine-mcp] Failed to initialize: ${e.message}`);
    process.exit(1);
  }

  const server = new McpServer({
    name: "filevine-mcp",
    version: "1.0.0",
  });

  registerProjectTools(server, fv);
  registerNotesAndTasksTools(server, fv);
  registerUserTools(server, fv);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("[filevine-mcp] Server running. Tools ready.");
}

main().catch((e) => {
  console.error("[filevine-mcp] Fatal error:", e);
  process.exit(1);
});
