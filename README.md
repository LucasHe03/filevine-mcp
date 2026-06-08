# filevine-mcp

A working MCP server for Filevine case management + Lead Docket intake, built for Claude Desktop.

## Tools included

**Filevine (20 tools)**
- `filevine_search_projects` — search cases by name, phase, type
- `filevine_get_project` — get full case details
- `filevine_create_project` — create a new case
- `filevine_update_project_phase` — move a case to a new phase
- `filevine_list_project_types` — list all case types
- `filevine_list_phases` — list all phases
- `filevine_get_section` — read a case section (intake, medical, etc.)
- `filevine_update_section` — write fields to a case section
- `filevine_create_note` — add a note to a case
- `filevine_get_notes` — get notes/activity for a case
- `filevine_create_task` — create a task on a case
- `filevine_get_tasks` — list tasks on a case
- `filevine_complete_task` — mark a task complete
- `filevine_search_contacts` — search contacts
- `filevine_get_contact` — get contact details
- `filevine_create_contact` — create a new contact
- `filevine_update_contact` — update a contact
- `filevine_search_documents` — search documents
- `filevine_get_document` — get document metadata
- `filevine_get_document_link` — get a download link for a document
- `filevine_list_folders` — list document folders in a case

**Lead Docket (6 tools)**
- `filevine_lead_search` — search leads by status, source, date
- `filevine_lead_get` — get full lead details
- `filevine_lead_update_status` — update lead status
- `filevine_lead_assign` — reassign a lead
- `filevine_lead_convert_to_project` — convert lead to Filevine case
- `filevine_lead_list_sources` — list all lead sources

## Setup

### 1. Install dependencies & build

```bash
cd filevine-mcp
npm install --legacy-peer-deps
npm run build
```

### 2. Add Claude Desktop config

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "filevine": {
      "command": "node",
      "args": ["/Users/lucash/Downloads/filevine-mcp/dist/index.js"],
      "env": {
        "FILEVINE_CLIENT_ID": "your_client_id",
        "FILEVINE_CLIENT_SECRET": "your_client_secret",
        "FILEVINE_PAT": "your_pat",
        "FILEVINE_USER_ID": "your_user_id",
        "FILEVINE_ORG_ID": "5655",
        "FILEVINE_REGION": "us",
        "LEAD_DOCKET_API_KEY": "your_lead_docket_key"
      }
    }
  }
}
```

### 3. Restart Claude Desktop

The Filevine tools will appear automatically.

## Getting your credentials

- **Client ID / Client Secret**: Filevine Org Admin → Integrations → API
- **PAT**: Filevine Org Admin → API → Personal Access Tokens → Generate New
- **User ID**: Visible in your Filevine profile URL or PAT generation page
- **Org ID**: `5655` (already set)
- **Lead Docket API Key**: Lead Docket Admin Settings → API
