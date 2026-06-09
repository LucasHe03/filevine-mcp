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

  server.tool(
    "filevine_get_user_tasks",
    "Get tasks assigned to a specific Filevine user",
    {
      userId: z.union([z.number(), z.string()]).describe("User ID (native integer or @partner ID)"),
      includeCompleted: z.boolean().optional().describe("Include completed tasks (default false, open only)"),
      hashtags: z.string().optional().describe("Comma-delimited hashtags without # (e.g. foo,bar)"),
      createdStart: z.string().optional().describe("Tasks created on or after this date/time (UTC)"),
      createdEnd: z.string().optional().describe("Tasks created on or before this date/time (UTC)"),
      taskTargetStart: z.string().optional().describe("Tasks with due date on or after this date/time (UTC)"),
      taskTargetEnd: z.string().optional().describe("Tasks with due date on or before this date/time (UTC)"),
      limit: z.number().optional().describe("Max tasks per page, 1-1000 (default 50)"),
      offset: z.number().optional().describe("Pagination offset (default 0)"),
      requestedFields: z.string().optional().describe("Comma-separated fields to return (default *)"),
    },
    async (args: any) => {
      try {
        const params: Record<string, unknown> = {
          limit: args.limit ?? 50,
          offset: args.offset ?? 0,
        };
        if (args.includeCompleted !== undefined) params.includeCompleted = args.includeCompleted;
        if (args.hashtags) params.hashtags = args.hashtags;
        if (args.createdStart) params.createdStart = args.createdStart;
        if (args.createdEnd) params.createdEnd = args.createdEnd;
        if (args.taskTargetStart) params.taskTargetStart = args.taskTargetStart;
        if (args.taskTargetEnd) params.taskTargetEnd = args.taskTargetEnd;
        if (args.requestedFields) params.requestedFields = args.requestedFields;
        const data = await fv.get<any>(`/users/${args.userId}/tasks`, params);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
      }
    }
  );
}
