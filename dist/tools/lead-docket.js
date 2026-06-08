"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerLeadDocketTools = registerLeadDocketTools;
const axios_1 = __importDefault(require("axios"));
const zod_1 = require("zod");
const LEAD_DOCKET_BASE = "https://app.leaddocket.com/api";
function getLeadDocketClient() {
    return axios_1.default.create({
        baseURL: LEAD_DOCKET_BASE,
        headers: {
            Authorization: `Bearer ${process.env.LEAD_DOCKET_API_KEY}`,
            "Content-Type": "application/json",
        },
    });
}
function registerLeadDocketTools(server) {
    const hasApiKey = !!process.env.LEAD_DOCKET_API_KEY;
    server.tool("filevine_lead_search", "Search Lead Docket intake leads by status, source, date range, or assignee", {
        status: zod_1.z.string().optional().describe("Filter by lead status (New, Contacted, Qualified, Converted, Declined)"),
        source: zod_1.z.string().optional().describe("Filter by lead source (e.g. PPC, Referral, Web)"),
        assignedTo: zod_1.z.string().optional().describe("Filter by assigned staff name or ID"),
        dateFrom: zod_1.z.string().optional().describe("Start date filter (ISO format)"),
        dateTo: zod_1.z.string().optional().describe("End date filter (ISO format)"),
        limit: zod_1.z.number().optional().describe("Max results (default 20)"),
    }, async (args) => {
        if (!hasApiKey)
            return { content: [{ type: "text", text: "LEAD_DOCKET_API_KEY not configured." }], isError: true };
        try {
            const params = { pageSize: args.limit || 20 };
            if (args.status)
                params["status"] = args.status;
            if (args.source)
                params["source"] = args.source;
            if (args.assignedTo)
                params["assignedTo"] = args.assignedTo;
            if (args.dateFrom)
                params["dateFrom"] = args.dateFrom;
            if (args.dateTo)
                params["dateTo"] = args.dateTo;
            const resp = await getLeadDocketClient().get("/leads", { params });
            return { content: [{ type: "text", text: JSON.stringify(resp.data, null, 2) }] };
        }
        catch (e) {
            return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
        }
    });
    server.tool("filevine_lead_get", "Get full details of a Lead Docket lead including intake form data and scoring", { leadId: zod_1.z.string().describe("The Lead Docket lead ID") }, async (args) => {
        if (!hasApiKey)
            return { content: [{ type: "text", text: "LEAD_DOCKET_API_KEY not configured." }], isError: true };
        try {
            const resp = await getLeadDocketClient().get(`/leads/${args.leadId}`);
            return { content: [{ type: "text", text: JSON.stringify(resp.data, null, 2) }] };
        }
        catch (e) {
            return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
        }
    });
    server.tool("filevine_lead_update_status", "Update the status of a Lead Docket lead", {
        leadId: zod_1.z.string().describe("The Lead Docket lead ID"),
        status: zod_1.z.enum(["New", "Contacted", "Qualified", "Converted", "Declined"]).describe("New status"),
        notes: zod_1.z.string().optional().describe("Optional notes about the status change"),
    }, async (args) => {
        if (!hasApiKey)
            return { content: [{ type: "text", text: "LEAD_DOCKET_API_KEY not configured." }], isError: true };
        try {
            const resp = await getLeadDocketClient().patch(`/leads/${args.leadId}`, { status: args.status, notes: args.notes });
            return { content: [{ type: "text", text: JSON.stringify(resp.data, null, 2) }] };
        }
        catch (e) {
            return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
        }
    });
    server.tool("filevine_lead_assign", "Reassign a Lead Docket lead to a different staff member", {
        leadId: zod_1.z.string().describe("The Lead Docket lead ID"),
        assigneeId: zod_1.z.string().describe("User ID or email of the new assignee"),
    }, async (args) => {
        if (!hasApiKey)
            return { content: [{ type: "text", text: "LEAD_DOCKET_API_KEY not configured." }], isError: true };
        try {
            const resp = await getLeadDocketClient().patch(`/leads/${args.leadId}`, { assignedTo: args.assigneeId });
            return { content: [{ type: "text", text: JSON.stringify(resp.data, null, 2) }] };
        }
        catch (e) {
            return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
        }
    });
    server.tool("filevine_lead_convert_to_project", "Convert a qualified Lead Docket lead into a new Filevine project/case", {
        leadId: zod_1.z.string().describe("The Lead Docket lead ID"),
        projectTypeId: zod_1.z.number().describe("Filevine project type ID for the new case"),
    }, async (args) => {
        if (!hasApiKey)
            return { content: [{ type: "text", text: "LEAD_DOCKET_API_KEY not configured." }], isError: true };
        try {
            const resp = await getLeadDocketClient().post(`/leads/${args.leadId}/convert`, { projectTypeId: args.projectTypeId });
            return { content: [{ type: "text", text: JSON.stringify(resp.data, null, 2) }] };
        }
        catch (e) {
            return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
        }
    });
    server.tool("filevine_lead_list_sources", "List all Lead Docket lead sources (PPC campaigns, referrals, web forms, etc.)", {}, async (_args) => {
        if (!hasApiKey)
            return { content: [{ type: "text", text: "LEAD_DOCKET_API_KEY not configured." }], isError: true };
        try {
            const resp = await getLeadDocketClient().get("/sources");
            return { content: [{ type: "text", text: JSON.stringify(resp.data, null, 2) }] };
        }
        catch (e) {
            return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
        }
    });
}
