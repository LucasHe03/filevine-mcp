"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerReportTools = registerReportTools;
const zod_1 = require("zod");
function registerReportTools(server, fv) {
    server.tool("filevine_run_report", "Run a saved Filevine report by report ID", {
        reportId: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).describe("The saved report ID"),
        includeTotalInJson: zod_1.z.boolean().optional().describe("Include total row count in JSON response (default false)"),
        limit: zod_1.z.number().optional().describe("Max rows to return, 0-30000 (default 30000)"),
        offset: zod_1.z.number().optional().describe("Pagination offset (default 0)"),
        tzOffset: zod_1.z.number().optional().describe("Timezone offset in minutes (default 0)"),
    }, async (args) => {
        try {
            const params = {
                limit: args.limit ?? 30000,
                offset: args.offset ?? 0,
                tzOffset: args.tzOffset ?? 0,
            };
            if (args.includeTotalInJson !== undefined)
                params.includeTotalInJson = args.includeTotalInJson;
            const data = await fv.get(`/Reports/${args.reportId}`, params);
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }
        catch (e) {
            return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
        }
    });
}
