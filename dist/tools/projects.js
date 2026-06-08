"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerProjectTools = registerProjectTools;
const zod_1 = require("zod");
function registerProjectTools(server, fv) {
    server.tool("filevine_search_projects", "Search Filevine projects/cases by phase, project type, or client name", {
        query: zod_1.z.string().optional().describe("Search by client name or project name"),
        phase: zod_1.z.string().optional().describe("Filter by phase name (e.g. Pre-Demand, Settlement)"),
        projectTypeId: zod_1.z.number().optional().describe("Filter by project type ID"),
        limit: zod_1.z.number().optional().describe("Max results (default 20)"),
        offset: zod_1.z.number().optional().describe("Pagination offset"),
    }, async (args) => {
        try {
            const params = {
                requestedCount: args.limit || 20,
                offset: args.offset || 0,
            };
            if (args.query)
                params["search"] = args.query;
            if (args.projectTypeId)
                params["projectTypeId"] = args.projectTypeId;
            const data = await fv.get("/projects", params);
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }
        catch (e) {
            return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
        }
    });
    server.tool("filevine_get_project", "Get full details of a Filevine project/case by project ID", { projectId: zod_1.z.number().describe("The Filevine project ID") }, async (args) => {
        try {
            const data = await fv.get(`projects/${args.projectId}`);
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }
        catch (e) {
            return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
        }
    });
    server.tool("filevine_create_project", "Create a new Filevine project/case", {
        projectTypeId: zod_1.z.number().describe("Project type ID"),
        clientContactId: zod_1.z.number().optional().describe("Contact ID for the client"),
        caseNumber: zod_1.z.string().optional().describe("Optional case number"),
        description: zod_1.z.string().optional().describe("Optional description"),
    }, async (args) => {
        try {
            const data = await fv.post("/projects", args);
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }
        catch (e) {
            return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
        }
    });
    server.tool("filevine_update_project_phase", "Move a Filevine project to a different phase", {
        projectId: zod_1.z.number().describe("The Filevine project ID"),
        phaseId: zod_1.z.number().describe("The target phase ID"),
    }, async (args) => {
        try {
            const data = await fv.patch(`projects/${args.projectId}`, {
                phase: { id: args.phaseId },
            });
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }
        catch (e) {
            return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
        }
    });
    server.tool("filevine_list_project_types", "List all available project/case types in Filevine", {}, async (_args) => {
        try {
            const data = await fv.get("/projecttypes");
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }
        catch (e) {
            return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
        }
    });
    server.tool("filevine_list_phases", "List all phases available in Filevine", { projectTypeId: zod_1.z.number().optional().describe("Filter phases by project type") }, async (args) => {
        try {
            const params = args.projectTypeId ? { projectTypeId: args.projectTypeId } : {};
            const data = await fv.get("/phases", params);
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }
        catch (e) {
            return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
        }
    });
    server.tool("filevine_get_section", "Get data from a specific section of a Filevine project (e.g. intake, medical, demand)", {
        projectId: zod_1.z.number().describe("The Filevine project ID"),
        sectionSelector: zod_1.z.string().describe("Section selector/slug (e.g. 'intake', 'medicalInfo')"),
    }, async (args) => {
        try {
            const data = await fv.get(`projects/${args.projectId}/sections/${args.sectionSelector}`);
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }
        catch (e) {
            return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
        }
    });
    server.tool("filevine_update_section", "Update fields in a specific section of a Filevine project", {
        projectId: zod_1.z.number().describe("The Filevine project ID"),
        sectionSelector: zod_1.z.string().describe("Section selector/slug"),
        fields: zod_1.z.record(zod_1.z.unknown()).describe("Key-value pairs of fields to update"),
    }, async (args) => {
        try {
            const data = await fv.put(`projects/${args.projectId}/sections/${args.sectionSelector}`, args.fields);
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }
        catch (e) {
            return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
        }
    });
}
