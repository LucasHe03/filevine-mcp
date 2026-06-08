"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDocumentTools = registerDocumentTools;
const zod_1 = require("zod");
function registerDocumentTools(server, fv) {
    server.tool("filevine_search_documents", "Search documents across Filevine projects", {
        projectId: zod_1.z.number().optional().describe("Limit search to a specific project"),
        query: zod_1.z.string().optional().describe("Search by filename or content"),
        limit: zod_1.z.number().optional().describe("Max results (default 20)"),
    }, async (args) => {
        try {
            const params = { requestedCount: args.limit || 20 };
            if (args.query)
                params["search"] = args.query;
            const path = args.projectId
                ? `projects/${args.projectId}/documents`
                : "documents";
            const data = await fv.get(path, params);
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }
        catch (e) {
            return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
        }
    });
    server.tool("filevine_get_document", "Get metadata and details for a specific Filevine document", {
        projectId: zod_1.z.number().describe("The Filevine project ID"),
        documentId: zod_1.z.number().describe("The document ID"),
    }, async (args) => {
        try {
            const data = await fv.get(`projects/${args.projectId}/documents/${args.documentId}`);
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }
        catch (e) {
            return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
        }
    });
    server.tool("filevine_get_document_link", "Get a download link for a Filevine document", {
        projectId: zod_1.z.number().describe("The Filevine project ID"),
        documentId: zod_1.z.number().describe("The document ID"),
    }, async (args) => {
        try {
            const data = await fv.get(`projects/${args.projectId}/documents/${args.documentId}/download`);
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }
        catch (e) {
            return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
        }
    });
    server.tool("filevine_list_folders", "List document folders in a Filevine project", { projectId: zod_1.z.number().describe("The Filevine project ID") }, async (args) => {
        try {
            const data = await fv.get(`projects/${args.projectId}/folders`);
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }
        catch (e) {
            return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
        }
    });
}
