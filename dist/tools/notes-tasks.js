"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerNotesAndTasksTools = registerNotesAndTasksTools;
const zod_1 = require("zod");
function registerNotesAndTasksTools(server, fv) {
    server.tool("filevine_create_note", "Add a note to a Filevine project/case", {
        projectId: zod_1.z.number().describe("The Filevine project ID"),
        body: zod_1.z.string().describe("The note text/body"),
        isPrivate: zod_1.z.boolean().optional().describe("Whether the note is private (default false)"),
    }, async (args) => {
        try {
            const data = await fv.post(`projects/${args.projectId}/notes`, {
                body: args.body,
                isPrivate: args.isPrivate || false,
            });
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }
        catch (e) {
            return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
        }
    });
    server.tool("filevine_get_notes", "Get notes/activity feed for a Filevine project", {
        projectId: zod_1.z.number().describe("The Filevine project ID"),
        limit: zod_1.z.number().optional().describe("Max results (default 20)"),
    }, async (args) => {
        try {
            const data = await fv.get(`projects/${args.projectId}/notes`, {
                requestedCount: args.limit || 20,
            });
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }
        catch (e) {
            return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
        }
    });
    server.tool("filevine_create_task", "Create a task on a Filevine project", {
        projectId: zod_1.z.number().describe("The Filevine project ID"),
        title: zod_1.z.string().describe("Task title/description"),
        dueDate: zod_1.z.string().optional().describe("Due date in ISO format (e.g. 2026-06-15)"),
        assigneeUserId: zod_1.z.number().optional().describe("User ID to assign the task to"),
        priority: zod_1.z.enum(["low", "normal", "high"]).optional().describe("Task priority"),
    }, async (args) => {
        try {
            const payload = {
                taskBody: args.title,
                priority: args.priority || "normal",
            };
            if (args.dueDate)
                payload["dueDate"] = args.dueDate;
            if (args.assigneeUserId)
                payload["assigneeId"] = { native: args.assigneeUserId };
            const data = await fv.post(`projects/${args.projectId}/tasks`, payload);
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }
        catch (e) {
            return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
        }
    });
    server.tool("filevine_get_tasks", "Get tasks for a Filevine project", {
        projectId: zod_1.z.number().describe("The Filevine project ID"),
        completed: zod_1.z.boolean().optional().describe("Include completed tasks (default false)"),
        limit: zod_1.z.number().optional().describe("Max results (default 20)"),
    }, async (args) => {
        try {
            const data = await fv.get(`projects/${args.projectId}/tasks`, {
                requestedCount: args.limit || 20,
                includeCompleted: args.completed || false,
            });
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }
        catch (e) {
            return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
        }
    });
    server.tool("filevine_complete_task", "Mark a task as complete in Filevine", {
        projectId: zod_1.z.number().describe("The Filevine project ID"),
        taskId: zod_1.z.number().describe("The task ID to complete"),
    }, async (args) => {
        try {
            const data = await fv.patch(`projects/${args.projectId}/tasks/${args.taskId}`, {
                isComplete: true,
            });
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }
        catch (e) {
            return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
        }
    });
}
