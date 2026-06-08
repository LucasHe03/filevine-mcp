import { FilevineClient } from "../client";
import { z } from "zod";

export function registerContactTools(server: any, fv: FilevineClient) {
  server.tool(
    "filevine_search_contacts",
    "Search Filevine contacts by name, email, or phone",
    {
      query: z.string().optional().describe("Search by name, email, or phone"),
      limit: z.number().optional().describe("Max results (default 20)"),
    },
    async (args: any) => {
      try {
        const data = await fv.get<any>("/contacts", {
          search: args.query || "",
          requestedCount: args.limit || 20,
        });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "filevine_get_contact",
    "Get full details of a Filevine contact by contact ID",
    { contactId: z.number().describe("The Filevine contact ID") },
    async (args: any) => {
      try {
        const data = await fv.get<any>(`contacts/${args.contactId}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "filevine_create_contact",
    "Create a new contact in Filevine",
    {
      firstName: z.string().describe("First name"),
      lastName: z.string().describe("Last name"),
      email: z.string().optional().describe("Email address"),
      phone: z.string().optional().describe("Phone number"),
      address: z.string().optional().describe("Street address"),
      city: z.string().optional().describe("City"),
      state: z.string().optional().describe("State (e.g. OH)"),
      zip: z.string().optional().describe("Zip code"),
    },
    async (args: any) => {
      try {
        const payload: Record<string, unknown> = {
          personTypes: ["Client"],
          name: { firstName: args.firstName, lastName: args.lastName },
        };
        if (args.email) payload["emails"] = [{ address: args.email, isPrimary: true }];
        if (args.phone) payload["phones"] = [{ number: args.phone, isPrimary: true }];
        if (args.address) {
          payload["addresses"] = [{
            street: args.address, city: args.city || "",
            state: args.state || "", zip: args.zip || "", isPrimary: true,
          }];
        }
        const data = await fv.post<any>("/contacts", payload);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "filevine_update_contact",
    "Update an existing Filevine contact",
    {
      contactId: z.number().describe("The Filevine contact ID"),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
    },
    async (args: any) => {
      try {
        const { contactId, ...fields } = args;
        const data = await fv.patch<any>(`contacts/${contactId}`, fields);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
      }
    }
  );
}