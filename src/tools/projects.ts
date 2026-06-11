import { FilevineClient } from "../client";
import { z } from "zod";

export function registerProjectTools(server: any, fv: FilevineClient) {
  server.tool(
    "filevine_search_projects",
    "Search Filevine projects/cases by name, phase, hashtags, dates, and more",
    {
      searchTerm: z.string().optional().describe("Free-text search term"),
      name: z.string().optional().describe("Filter by project name"),
      number: z.string().optional().describe("Filter by project/case number"),
      phaseName: z.string().optional().describe("Filter by exact phase name (e.g. Pre-Demand, Settlement)"),
      projectID: z.number().optional().describe("Filter by project ID"),
      hashtags: z.array(z.string()).optional().describe("Hashtags without # (e.g. ['foo', 'bar'])"),
      createdSince: z.string().optional().describe("Filter projects created since this date (mm/dd/yyyy, mm-dd-yyyy, or yyyy-mm-dd)"),
      incidentDate: z.string().optional().describe("Filter by incident date (mm/dd/yyyy, mm-dd-yyyy, or yyyy-mm-dd)"),
      latestActivitySince: z.string().optional().describe("Filter by latest activity since this date"),
      latestActivityBefore: z.string().optional().describe("Filter by latest activity before this date"),
      excludeArchived: z.boolean().optional().describe("Exclude archived projects (default false)"),
      limit: z.number().optional().describe("Max results, 0-1000 (default 50)"),
      offset: z.number().optional().describe("Pagination offset (default 0)"),
      sortBy: z.enum([
        "projectOrClientName", "projectName", "clientName", "phaseName", "phaseDate",
        "phaseId", "lastActivity", "createdDate", "projectId", "projectTypeId",
        "clientId", "firstPrimaryName", "firstPrimaryUsername",
      ]).optional().describe("Field to sort by (defaults to projectId descending)"),
      orderBy: z.enum(["asc", "desc"]).optional().describe("Sort order: asc or desc"),
      requestedFields: z.string().optional().describe("Comma-separated fields to return (default *)"),
    },
    async (args: any) => {
      try {
        const params: Record<string, unknown> = {
          limit: args.limit ?? 50,
          offset: args.offset ?? 0,
        };
        if (args.searchTerm) params.searchTerm = args.searchTerm;
        if (args.name) params.name = args.name;
        if (args.number) params.number = args.number;
        if (args.phaseName) params.phaseName = args.phaseName;
        if (args.projectID) params.projectID = args.projectID;
        if (args.hashtags?.length) params.hashtags = args.hashtags;
        if (args.createdSince) params.createdSince = args.createdSince;
        if (args.incidentDate) params.incidentDate = args.incidentDate;
        if (args.latestActivitySince) params.latestActivitySince = args.latestActivitySince;
        if (args.latestActivityBefore) params.latestActivityBefore = args.latestActivityBefore;
        if (args.excludeArchived !== undefined) params.excludeArchived = args.excludeArchived;
        if (args.sortBy) params.sortBy = args.sortBy;
        if (args.orderBy) params.orderBy = args.orderBy;
        if (args.requestedFields) params.requestedFields = args.requestedFields;
        const data = await fv.get<any>("/Projects", params);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "filevine_get_project",
    "Get full details of a Filevine project/case by project ID",
    {
      projectId: z.union([z.number(), z.string()]).describe("The Filevine project ID"),
      requestedFields: z.string().optional().describe("Comma-separated fields to return (default *)"),
    },
    async (args: any) => {
      try {
        const params: Record<string, unknown> = {};
        if (args.requestedFields) params.requestedFields = args.requestedFields;
        const data = await fv.get<any>(`/Projects/${args.projectId}`, params);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "filevine_get_project_type_sections",
    "Get available sections and field selectors for the org project type",
    {
      requestedFields: z.string().optional().describe("Comma-separated fields to return (default *)"),
    },
    async (args: any) => {
      try {
        const params: Record<string, unknown> = {};
        if (args.requestedFields) params.requestedFields = args.requestedFields;
        const data = await fv.get<any>("/ProjectTypes/15062/Sections", params);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "filevine_get_static_section",
    "Get field values for a static section on a project by section selector",
    {
      projectId: z.union([z.number(), z.string()]).describe("Project ID (native integer or @partner ID)"),
      selector: z.string().describe("Section selector from project type sections (e.g. intake, medicalInfo)"),
    },
    async (args: any) => {
      try {
        const data = await fv.get<any>(`/Projects/${args.projectId}/Forms/${args.selector}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "filevine_get_collection_items",
    "Get all items in a collection section on a project by section selector",
    {
      projectId: z.union([z.number(), z.string()]).describe("Project ID (native integer or @partner ID)"),
      selector: z.string().describe("Collection section selector from project type sections"),
    },
    async (args: any) => {
      try {
        const data = await fv.get<any>(`/Projects/${args.projectId}/Collections/${args.selector}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "filevine_get_collection_item",
    "Get a single collection item on a project by section selector and unique ID",
    {
      projectId: z.union([z.number(), z.string()]).describe("Project ID (native integer or @partner ID)"),
      selector: z.string().describe("Collection section selector"),
      uniqueId: z.union([z.number(), z.string()]).describe("Unique ID of the collection item"),
    },
    async (args: any) => {
      try {
        const data = await fv.get<any>(`/Projects/${args.projectId}/Collections/${args.selector}/${args.uniqueId}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
      }
    }
  );
}