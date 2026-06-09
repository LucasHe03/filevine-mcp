import { FilevineClient } from "../client";
import { z } from "zod";

export function registerUserTools(server: any, fv: FilevineClient) {
  server.tool(
    "filevine_list_users",
    "List Filevine users in the org, with optional filters by name, email, username, or access level",
    {
      name: z.string().optional().describe("Filter by user name"),
      email: z.string().optional().describe("Filter by email"),
      username: z.string().optional().describe("Filter by username"),
      accessLevel: z.string().optional().describe("Filter by access level"),
      limit: z.number().optional().describe("Max items to return, max 1000 (default 50)"),
      offset: z.number().optional().describe("Pagination offset (default 0)"),
      requestedFields: z.string().optional().describe("Comma-separated fields to return (default *)"),
    },
    async (args: any) => {
      try {
        const params: Record<string, unknown> = {
          limit: args.limit ?? 50,
          offset: args.offset ?? 0,
        };
        if (args.name) params.name = args.name;
        if (args.email) params.email = args.email;
        if (args.username) params.username = args.username;
        if (args.accessLevel) params.accessLevel = args.accessLevel;
        if (args.requestedFields) params.requestedFields = args.requestedFields;
        const data = await fv.get<any>("/Users", params);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
      }
    }
  );
}
