"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerProjectTools = registerProjectTools;
const zod_1 = require("zod");
function registerProjectTools(server, fv) {
    server.tool("filevine_search_projects", "Search Filevine projects/cases by name, phase, hashtags, dates, and more", {
        searchTerm: zod_1.z.string().optional().describe("Free-text search term"),
        name: zod_1.z.string().optional().describe("Filter by project name"),
        number: zod_1.z.string().optional().describe("Filter by project/case number"),
        phaseName: zod_1.z.string().optional().describe("Filter by exact phase name (e.g. Pre-Demand, Settlement)"),
        projectID: zod_1.z.number().optional().describe("Filter by project ID"),
        hashtags: zod_1.z.array(zod_1.z.string()).optional().describe("Hashtags without # (e.g. ['foo', 'bar'])"),
        createdSince: zod_1.z.string().optional().describe("Filter projects created since this date (mm/dd/yyyy, mm-dd-yyyy, or yyyy-mm-dd)"),
        incidentDate: zod_1.z.string().optional().describe("Filter by incident date (mm/dd/yyyy, mm-dd-yyyy, or yyyy-mm-dd)"),
        latestActivitySince: zod_1.z.string().optional().describe("Filter by latest activity since this date"),
        latestActivityBefore: zod_1.z.string().optional().describe("Filter by latest activity before this date"),
        excludeArchived: zod_1.z.boolean().optional().describe("Exclude archived projects (default false)"),
        limit: zod_1.z.number().optional().describe("Max results, 0-1000 (default 50)"),
        offset: zod_1.z.number().optional().describe("Pagination offset (default 0)"),
        sortBy: zod_1.z.enum([
            "projectOrClientName", "projectName", "clientName", "phaseName", "phaseDate",
            "phaseId", "lastActivity", "createdDate", "projectId", "projectTypeId",
            "clientId", "firstPrimaryName", "firstPrimaryUsername",
        ]).optional().describe("Field to sort by (defaults to projectId descending)"),
        orderBy: zod_1.z.enum(["asc", "desc"]).optional().describe("Sort order: asc or desc"),
        requestedFields: zod_1.z.string().optional().describe("Comma-separated fields to return (default *)"),
    }, async (args) => {
        try {
            const params = {
                limit: args.limit ?? 50,
                offset: args.offset ?? 0,
            };
            if (args.searchTerm)
                params.searchTerm = args.searchTerm;
            if (args.name)
                params.name = args.name;
            if (args.number)
                params.number = args.number;
            if (args.phaseName)
                params.phaseName = args.phaseName;
            if (args.projectID)
                params.projectID = args.projectID;
            if (args.hashtags?.length)
                params.hashtags = args.hashtags;
            if (args.createdSince)
                params.createdSince = args.createdSince;
            if (args.incidentDate)
                params.incidentDate = args.incidentDate;
            if (args.latestActivitySince)
                params.latestActivitySince = args.latestActivitySince;
            if (args.latestActivityBefore)
                params.latestActivityBefore = args.latestActivityBefore;
            if (args.excludeArchived !== undefined)
                params.excludeArchived = args.excludeArchived;
            if (args.sortBy)
                params.sortBy = args.sortBy;
            if (args.orderBy)
                params.orderBy = args.orderBy;
            if (args.requestedFields)
                params.requestedFields = args.requestedFields;
            const data = await fv.get("/Projects", params);
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }
        catch (e) {
            return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
        }
    });
    server.tool("filevine_get_project", "Get full details of a Filevine project/case by project ID", {
        projectId: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).describe("The Filevine project ID"),
        requestedFields: zod_1.z.string().optional().describe("Comma-separated fields to return (default *)"),
    }, async (args) => {
        try {
            const params = {};
            if (args.requestedFields)
                params.requestedFields = args.requestedFields;
            const data = await fv.get(`/Projects/${args.projectId}`, params);
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }
        catch (e) {
            return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
        }
    });
}
