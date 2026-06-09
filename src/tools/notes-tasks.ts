import { FilevineClient } from "../client";
import { z } from "zod";

function toNativeOrPartnerId(id: number | string): { Native?: number; Partner?: string } {
  if (typeof id === "number") return { Native: id };
  if (id.startsWith("@")) return { Partner: id.slice(1) };
  const asNum = Number(id);
  if (!Number.isNaN(asNum)) return { Native: asNum };
  return { Partner: id };
}

function withClaudePrefix(body: string): string {
  return `Claude: ${body}`;
}

export function registerNotesAndTasksTools(server: any, fv: FilevineClient) {
  server.tool(
    "filevine_create_note",
    "Create a note on a Filevine project",
    {
      projectId: z.union([z.number(), z.string()]).describe("Project ID (native integer or @partner ID)"),
      body: z.string().optional().describe("Note body text"),
      subject: z.string().optional().describe("Note subject/title"),
      authorId: z.number().optional().describe("Author user ID (defaults to authenticated user)"),
      notePartnerId: z.string().optional().describe("Client idempotency key; reuses existing note if already mapped"),
      source: z.string().optional().describe("Email source address"),
      destination: z.string().optional().describe("Email destination address"),
      createdAt: z.string().optional().describe("Creation timestamp ISO 8601 (must not be in future)"),
      typeTag: z.string().optional().describe('Note type tag; use "phcall" for phone call notes'),
      participantUserIds: z.array(z.number()).optional().describe("Participant user IDs (for phone calls)"),
      participantContactPersonIds: z.array(z.number()).optional().describe("Participant contact person IDs (for phone calls)"),
      phoneCallStartTime: z.string().optional().describe("Phone call start time ISO 8601"),
      phoneCallEndTime: z.string().optional().describe("Phone call end time ISO 8601"),
      isPinnedToProject: z.boolean().optional().describe("Pin note to project (default false)"),
      isPinnedToFeed: z.boolean().optional().describe("Pin note to feed (default false)"),
    },
    async (args: any) => {
      try {
        const payload: Record<string, unknown> = {
          ProjectId: toNativeOrPartnerId(args.projectId),
          Body: withClaudePrefix(args.body ?? ""),
        };
        if (args.subject !== undefined) payload.Subject = args.subject;
        if (args.authorId !== undefined) payload.AuthorId = { Native: args.authorId };
        if (args.notePartnerId !== undefined) payload.NoteId = { Partner: args.notePartnerId };
        if (args.source !== undefined) payload.Source = args.source;
        if (args.destination !== undefined) payload.Destination = args.destination;
        if (args.createdAt !== undefined) payload.CreatedAt = args.createdAt;
        if (args.typeTag !== undefined) payload.TypeTag = args.typeTag;
        if (args.participantUserIds !== undefined) payload.ParticipantUserIDs = args.participantUserIds;
        if (args.participantContactPersonIds !== undefined) payload.ParticipantContactPersonIDs = args.participantContactPersonIds;
        if (args.phoneCallStartTime !== undefined) payload.PhoneCallStartTime = args.phoneCallStartTime;
        if (args.phoneCallEndTime !== undefined) payload.PhoneCallEndTime = args.phoneCallEndTime;
        if (args.isPinnedToProject !== undefined) payload.IsPinnedToProject = args.isPinnedToProject;
        if (args.isPinnedToFeed !== undefined) payload.IsPinnedToFeed = args.isPinnedToFeed;
        const data = await fv.post<any>("/Notes", payload);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "filevine_get_notes",
    "Get notes and activity for a Filevine project",
    {
      projectId: z.union([z.number(), z.string()]).describe("Project ID (native integer or @partner ID)"),
      filterByType: z.enum([
        "None", "Note", "Task", "Sms", "Email", "Reminder", "Fax", "ClientPortal", "PhoneCall",
      ]).optional().describe("Filter by note type (default None)"),
      hashtags: z.string().optional().describe("Comma-delimited hashtags without # (e.g. foo,bar)"),
      createdStart: z.string().optional().describe("Notes created on or after this date (mm/dd/yyyy, mm-dd-yyyy, or yyyy-mm-dd)"),
      createdEnd: z.string().optional().describe("Notes created on or before this date"),
      taskFilter: z.string().optional().describe("Task filters (comma-separated): AssignedToMe, CompletedByMe, CompleteOnly, CreatedByMe, IncompleteOnly, PinnedOnly, UnpinnedOnly"),
      taskTargetStart: z.string().optional().describe("Tasks with due date on or after this date"),
      taskTargetEnd: z.string().optional().describe("Tasks with due date on or before this date"),
      limit: z.number().optional().describe("Max items per page, 0-1000 (default 50)"),
      offset: z.number().optional().describe("Pagination offset (default 0)"),
      requestedFields: z.string().optional().describe("Comma-separated fields to return (default *)"),
    },
    async (args: any) => {
      try {
        const params: Record<string, unknown> = {
          limit: args.limit ?? 50,
          offset: args.offset ?? 0,
        };
        if (args.filterByType) params.filterByType = args.filterByType;
        if (args.hashtags) params.hashtags = args.hashtags;
        if (args.createdStart) params.createdStart = args.createdStart;
        if (args.createdEnd) params.createdEnd = args.createdEnd;
        if (args.taskFilter) params.taskFilter = args.taskFilter;
        if (args.taskTargetStart) params.taskTargetStart = args.taskTargetStart;
        if (args.taskTargetEnd) params.taskTargetEnd = args.taskTargetEnd;
        if (args.requestedFields) params.requestedFields = args.requestedFields;
        const data = await fv.get<any>(`/Projects/${args.projectId}/Notes`, params);
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
      projectId: z.union([z.number(), z.string()]).describe("Project ID (native integer or @partner ID)"),
      body: z.string().describe("Task body text (required)"),
      assigneeId: z.number().optional().describe("Assignee native user ID (required if assigneeUsername not set)"),
      assigneeUsername: z.string().optional().describe("Assignee @username (required if assigneeId not set)"),
      subject: z.string().optional().describe("Task subject/title"),
      targetDate: z.string().optional().describe("Due date ISO 8601 or date phrase (defaults to today)"),
      taskPartnerId: z.string().optional().describe("Client idempotency key via NoteId.Partner"),
      documentIds: z.array(z.number()).optional().describe("Document IDs to attach"),
      createdAt: z.string().optional().describe("Creation timestamp ISO 8601 (must not be in future)"),
      isPinnedToProject: z.boolean().optional().describe("Pin task to project (default false)"),
      isPinnedToFeed: z.boolean().optional().describe("Pin task to feed (default false)"),
    },
    async (args: any) => {
      try {
        if (args.assigneeId === undefined && !args.assigneeUsername) {
          return {
            content: [{ type: "text", text: "Error: assigneeId or assigneeUsername is required" }],
            isError: true,
          };
        }

        const body = withClaudePrefix(args.body);
        const payload: Record<string, unknown> = {
          ProjectId: toNativeOrPartnerId(args.projectId),
          Body: body,
        };
        if (args.subject !== undefined) payload.Subject = args.subject;
        if (args.assigneeId !== undefined) {
          payload.AssigneeId = { Native: args.assigneeId };
        } else {
          const username = args.assigneeUsername.startsWith("@")
            ? args.assigneeUsername
            : `@${args.assigneeUsername}`;
          payload.Body = `${username} ${body}`;
        }
        if (args.targetDate !== undefined) payload.TargetDate = args.targetDate;
        if (args.taskPartnerId !== undefined) payload.NoteId = { Partner: args.taskPartnerId };
        if (args.documentIds?.length) {
          payload.Documents = args.documentIds.map((id: number) => ({ Native: id }));
        }
        if (args.createdAt !== undefined) payload.CreatedAt = args.createdAt;
        if (args.isPinnedToProject !== undefined) payload.IsPinnedToProject = args.isPinnedToProject;
        if (args.isPinnedToFeed !== undefined) payload.IsPinnedToFeed = args.isPinnedToFeed;

        const data = await fv.post<any>("/tasks", payload);
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
      projectId: z.union([z.number(), z.string()]).describe("Project ID (native integer or @partner ID)"),
      taskFilter: z.string().optional().describe("Comma-separated filters: AssignedToMe, CompletedByMe, CompleteOnly, CreatedByMe, IncompleteOnly, PinnedOnly, UnpinnedOnly"),
      hashtags: z.string().optional().describe("Comma-delimited hashtags without # (e.g. foo,bar)"),
      createdStart: z.string().optional().describe("Tasks created on or after this date (mm/dd/yyyy, mm-dd-yyyy, or yyyy-mm-dd)"),
      createdEnd: z.string().optional().describe("Tasks created on or before this date"),
      taskTargetStart: z.string().optional().describe("Tasks with due date on or after this date"),
      taskTargetEnd: z.string().optional().describe("Tasks with due date on or before this date"),
      limit: z.number().optional().describe("Max tasks per page, 0-1000 (default 50)"),
      offset: z.number().optional().describe("Pagination offset (default 0)"),
      requestedFields: z.string().optional().describe("Comma-separated fields to return (default *)"),
    },
    async (args: any) => {
      try {
        const params: Record<string, unknown> = {
          limit: args.limit ?? 50,
          offset: args.offset ?? 0,
        };
        if (args.taskFilter) params.taskFilter = args.taskFilter;
        if (args.hashtags) params.hashtags = args.hashtags;
        if (args.createdStart) params.createdStart = args.createdStart;
        if (args.createdEnd) params.createdEnd = args.createdEnd;
        if (args.taskTargetStart) params.taskTargetStart = args.taskTargetStart;
        if (args.taskTargetEnd) params.taskTargetEnd = args.taskTargetEnd;
        if (args.requestedFields) params.requestedFields = args.requestedFields;
        const data = await fv.get<any>(`/Projects/${args.projectId}/tasks`, params);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
      }
    }
  );
}