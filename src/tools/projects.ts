import { FilevineClient } from "../client";
import { z } from "zod";

export function registerProjectTools(server: any, fv: FilevineClient) {
  server.tool(
    "filevine_search_projects",
    "Search Filevine projects/cases by phase, project type, or client name",
    {
      query: z.string().optional().describe("Search by client name or project name"),
      phase: z.string().optional().describe("Filter by phase name (e.g. Pre-Demand, Settlement)"),
      projectTypeId: z.number().optional().describe("Filter by project type ID"),
      limit: z.number().optional().describe("Max results (default 20)"),
      offset: z.number().optional().describe("Pagination offset"),
    },
    async (args: any) => {
      try {
        const params: Record<string, unknown> = {
          requestedCount: args.limit || 20,
          offset: args.offset || 0,
        };
        if (args.query) params["search"] = args.query;
        if (args.projectTypeId) params["projectTypeId"] = args.projectTypeId;
        const data = await fv.get<any>("/projects", params);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "filevine_get_project",
    "Get full details of a Filevine project/case by project ID",
    { projectId: z.number().describe("The Filevine project ID") },
    async (args: any) => {
      try {
        const data = await fv.get<any>(`projects/${args.projectId}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "filevine_create_project",
    "Create a new Filevine project/case",
    {
      projectTypeId: z.number().describe("Project type ID"),
      clientContactId: z.number().optional().describe("Contact ID for the client"),
      caseNumber: z.string().optional().describe("Optional case number"),
      description: z.string().optional().describe("Optional description"),
    },
    async (args: any) => {
      try {
        const data = await fv.post<any>("/projects", args);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "filevine_update_project_phase",
    "Move a Filevine project to a different phase",
    {
      projectId: z.number().describe("The Filevine project ID"),
      phaseId: z.number().describe("The target phase ID"),
    },
    async (args: any) => {
      try {
        const data = await fv.patch<any>(`projects/${args.projectId}`, {
          phase: { id: args.phaseId },
        });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "filevine_list_project_types",
    "List all available project/case types in Filevine",
    {},
    async (_args: any) => {
      try {
        const data = await fv.get<any>("/projecttypes");
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "filevine_list_phases",
    "List all phases available in Filevine",
    { projectTypeId: z.number().optional().describe("Filter phases by project type") },
    async (args: any) => {
      try {
        const params = args.projectTypeId ? { projectTypeId: args.projectTypeId } : {};
        const data = await fv.get<any>("/phases", params);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "filevine_get_section",
    "Get data from a specific section of a Filevine project (e.g. intake, medical, demand)",
    {
      projectId: z.number().describe("The Filevine project ID"),
      sectionSelector: z.string().describe("Section selector/slug (e.g. 'intake', 'medicalInfo')"),
    },
    async (args: any) => {
      try {
        const data = await fv.get<any>(`projects/${args.projectId}/sections/${args.sectionSelector}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "filevine_update_section",
    "Update fields in a specific section of a Filevine project",
    {
      projectId: z.number().describe("The Filevine project ID"),
      sectionSelector: z.string().describe("Section selector/slug"),
      fields: z.record(z.unknown()).describe("Key-value pairs of fields to update"),
    },
    async (args: any) => {
      try {
        const data = await fv.put<any>(`projects/${args.projectId}/sections/${args.sectionSelector}`, args.fields);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
      }
    }
  );
}