"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerContactTools = registerContactTools;
const zod_1 = require("zod");
function registerContactTools(server, fv) {
    server.tool("filevine_search_contacts", "Search Filevine contacts by name, email, or phone", {
        query: zod_1.z.string().optional().describe("Search by name, email, or phone"),
        limit: zod_1.z.number().optional().describe("Max results (default 20)"),
    }, async (args) => {
        try {
            const data = await fv.get("/contacts", {
                search: args.query || "",
                requestedCount: args.limit || 20,
            });
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }
        catch (e) {
            return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
        }
    });
    server.tool("filevine_get_contact", "Get full details of a Filevine contact by contact ID", { contactId: zod_1.z.number().describe("The Filevine contact ID") }, async (args) => {
        try {
            const data = await fv.get(`contacts/${args.contactId}`);
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }
        catch (e) {
            return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
        }
    });
    server.tool("filevine_create_contact", "Create a new contact in Filevine", {
        firstName: zod_1.z.string().describe("First name"),
        lastName: zod_1.z.string().describe("Last name"),
        email: zod_1.z.string().optional().describe("Email address"),
        phone: zod_1.z.string().optional().describe("Phone number"),
        address: zod_1.z.string().optional().describe("Street address"),
        city: zod_1.z.string().optional().describe("City"),
        state: zod_1.z.string().optional().describe("State (e.g. OH)"),
        zip: zod_1.z.string().optional().describe("Zip code"),
    }, async (args) => {
        try {
            const payload = {
                personTypes: ["Client"],
                name: { firstName: args.firstName, lastName: args.lastName },
            };
            if (args.email)
                payload["emails"] = [{ address: args.email, isPrimary: true }];
            if (args.phone)
                payload["phones"] = [{ number: args.phone, isPrimary: true }];
            if (args.address) {
                payload["addresses"] = [{
                        street: args.address, city: args.city || "",
                        state: args.state || "", zip: args.zip || "", isPrimary: true,
                    }];
            }
            const data = await fv.post("/contacts", payload);
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }
        catch (e) {
            return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
        }
    });
    server.tool("filevine_update_contact", "Update an existing Filevine contact", {
        contactId: zod_1.z.number().describe("The Filevine contact ID"),
        firstName: zod_1.z.string().optional(),
        lastName: zod_1.z.string().optional(),
        email: zod_1.z.string().optional(),
        phone: zod_1.z.string().optional(),
    }, async (args) => {
        try {
            const { contactId, ...fields } = args;
            const data = await fv.patch(`contacts/${contactId}`, fields);
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }
        catch (e) {
            return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
        }
    });
}
