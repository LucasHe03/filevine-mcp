#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const client_1 = require("./client");
const projects_1 = require("./tools/projects");
const notes_tasks_1 = require("./tools/notes-tasks");
const users_1 = require("./tools/users");
async function main() {
    let fv;
    try {
        fv = new client_1.FilevineClient();
    }
    catch (e) {
        console.error(`[filevine-mcp] Failed to initialize: ${e.message}`);
        process.exit(1);
    }
    const server = new mcp_js_1.McpServer({
        name: "filevine-mcp",
        version: "1.0.0",
    });
    (0, projects_1.registerProjectTools)(server, fv);
    (0, notes_tasks_1.registerNotesAndTasksTools)(server, fv);
    (0, users_1.registerUserTools)(server, fv);
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error("[filevine-mcp] Server running. Tools ready.");
}
main().catch((e) => {
    console.error("[filevine-mcp] Fatal error:", e);
    process.exit(1);
});
