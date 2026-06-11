import { FilevineClient } from "../client";
import { z } from "zod";

export function registerReportTools(server: any, fv: FilevineClient) {
  server.tool(
    "filevine_run_report",
    "Run a saved Filevine report by report ID",
    {
      reportId: z.union([z.number(), z.string()]).describe("The saved report ID"),
      includeTotalInJson: z.boolean().optional().describe("Include total row count in JSON response (default false)"),
      limit: z.number().optional().describe("Max rows to return, 0-30000 (default 30000)"),
      offset: z.number().optional().describe("Pagination offset (default 0)"),
      tzOffset: z.number().optional().describe("Timezone offset in minutes (default 0)"),
    },
    async (args: any) => {
      try {
        const params: Record<string, unknown> = {
          limit: args.limit ?? 30000,
          offset: args.offset ?? 0,
          tzOffset: args.tzOffset ?? 0,
        };
        if (args.includeTotalInJson !== undefined) params.includeTotalInJson = args.includeTotalInJson;
        const data = await fv.get<any>(`/Reports/${args.reportId}`, params);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
      }
    }
  );
}
