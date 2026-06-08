import { FilevineClient } from "../client";
import { z } from "zod";

export function registerNotesAndTasksTools(server: any, fv: FilevineClient) {
  server.tool(
    "filevine_create_note",
    "Add a note to a Filevine project/case",
    {
      projectId: z.number().describe("The Filevine project ID"),
      body: z.string().describe("The note text/body"),
      isPrivate: z.boolean().optional().describe("Whether the note is private (default false)"),
    },
    async (args: any) => {
      try {
        const data = await fv.post<any>(`projects/${args.projectId}/notes`, {
          body: args.body,
          isPrivate: args.isPrivate || false,
        });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "filevine_get_notes",
    "Get notes/activity feed for a Filevine project",
    {
      projectId: z.number().describe("The Filevine project ID"),
      limit: z.number().optional().describe("Max results (default 20)"),
    },
    async (args: any) => {
      try {
        const data = await fv.get<any>(`projects/${args.projectId}/notes`, {
          requestedCount: args.limit || 20,
        });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "filevine_create_task",
    "Create a task on a Filevine project",
    {
      projectId: z.number().describe("The Filevine project ID"),
      title: z.string().describe("Task title/description"),
      dueDate: z.string().optional().describe("Due date in ISO format (e.g. 2026-06-15)"),
      assigneeUserId: z.number().optional().describe("User ID to assign the task to"),
      priority: z.enum(["low", "normal", "high"]).optional().describe("Task priority"),
    },
    async (args: any) => {
      try {
        const payload: Record<string, unknown> = {
          taskBody: args.title,
          priority: args.priority || "normal",
        };
        if (args.dueDate) payload["dueDate"] = args.dueDate;
        if (args.assigneeUserId) payload["assigneeId"] = { native: args.assigneeUserId };
        const data = await fv.post<any>(`projects/${args.projectId}/tasks`, payload);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "filevine_get_tasks",
    "Get tasks for a Filevine project",
    {
      projectId: z.number().describe("The Filevine project ID"),
      completed: z.boolean().optional().describe("Include completed tasks (default false)"),
      limit: z.number().optional().describe("Max results (default 20)"),
    },
    async (args: any) => {
      try {
        const data = await fv.get<any>(`projects/${args.projectId}/tasks`, {
          requestedCount: args.limit || 20,
          includeCompleted: args.completed || false,
        });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "filevine_complete_task",
    "Mark a task as complete in Filevine",
    {
      projectId: z.number().describe("The Filevine project ID"),
      taskId: z.number().describe("The task ID to complete"),
    },
    async (args: any) => {
      try {
        const data = await fv.patch<any>(`projects/${args.projectId}/tasks/${args.taskId}`, {
          isComplete: true,
        });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
      }
    }
  );
}