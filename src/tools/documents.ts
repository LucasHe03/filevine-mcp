import { FilevineClient } from "../client";
import { z } from "zod";

export function registerDocumentTools(server: any, fv: FilevineClient) {
  server.tool(
    "filevine_search_documents",
    "Search documents across Filevine projects",
    {
      projectId: z.number().optional().describe("Limit search to a specific project"),
      query: z.string().optional().describe("Search by filename or content"),
      limit: z.number().optional().describe("Max results (default 20)"),
    },
    async (args: any) => {
      try {
        const params: Record<string, unknown> = { requestedCount: args.limit || 20 };
        if (args.query) params["search"] = args.query;
        const path = args.projectId
          ? `projects/${args.projectId}/documents`
          : "documents";
        const data = await fv.get<any>(path, params);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "filevine_get_document",
    "Get metadata and details for a specific Filevine document",
    {
      projectId: z.number().describe("The Filevine project ID"),
      documentId: z.number().describe("The document ID"),
    },
    async (args: any) => {
      try {
        const data = await fv.get<any>(`projects/${args.projectId}/documents/${args.documentId}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "filevine_get_document_link",
    "Get a download link for a Filevine document",
    {
      projectId: z.number().describe("The Filevine project ID"),
      documentId: z.number().describe("The document ID"),
    },
    async (args: any) => {
      try {
        const data = await fv.get<any>(`projects/${args.projectId}/documents/${args.documentId}/download`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "filevine_list_folders",
    "List document folders in a Filevine project",
    { projectId: z.number().describe("The Filevine project ID") },
    async (args: any) => {
      try {
        const data = await fv.get<any>(`projects/${args.projectId}/folders`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
      }
    }
  );
}