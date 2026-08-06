# IQPROMPT MCP Frontend Build Specification

## Purpose

Build a responsive landing page for **IQPROMPT MCP**. It has two jobs:

1. Explain why IQPROMPT MCP is valuable to AI users, client teams, engineering teams, and stakeholders.
2. Give an implementer enough technical documentation to connect an MCP-capable AI client to the service.

The page is documentation-first, not a generic marketing page. The setup endpoint and tool reference must be easy to find and scan.

## Product Summary

IQPROMPT MCP is a thin Model Context Protocol proxy. It connects an MCP client to IQPROMPT's prompt-enhancement API:

```text
MCP client -> IQPROMPT MCP (/mcp and helper routes) -> IQPROMPT API
```

Users keep working in their existing AI client. They can validate their connection, create a session, improve a general prompt, or improve a prompt for a coding agent.

## Page Requirements

### Header

- Brand logo links to `https://iqprompt.ai/`.
- Navigation anchors: `Setup`, `API reference`, and `Benefits`.
- Primary header action scrolls to the setup section: `Connect MCP`.
- On small screens, hide the nav links but retain brand and the action where space allows.

### Hero

Use this content:

- Eyebrow: `IQPROMPT MCP`
- Heading: `Prompt expertise, wired into the AI work already happening.`
- Body: `IQPROMPT MCP gives ChatGPT, Cursor, Claude, and other MCP clients a secure path to sharpen prompts, retain multi-turn context, and deliver clearer work without tab switching.`
- Primary action: `Set up the endpoint` -> `#setup`
- Secondary action: `Read the API reference` -> `#tools`

Show supported-client links or chips:

| Label | Link |
| --- | --- |
| ChatGPT | `https://chatgpt.com` |
| Cursor | `https://cursor.com` |
| Claude Desktop | `https://claude.ai/download` |
| Any MCP-capable client | `https://modelcontextprotocol.io` |

Include a product-workflow visual with a rough prompt, the tool name `enhance_prompt`, and an improved prompt. It is illustrative only; it must not claim to be a live request or a connected user session.

## Setup Section

Use `id="setup"`.

### Required endpoint

Prominently show this exact Streamable HTTP endpoint:

```text
https://mcp.iqprompt.ai/mcp
```

Label it `MCP Streamable HTTP endpoint`. Make it selectable and provide a copy control if the design system supports one. The “Get API key” action links to `https://iqprompt.ai/` in a new tab.

### Setup flow

1. **Get an IQPROMPT API key**: Create or sign in to IQPROMPT and generate a personal API key.
2. **Add the MCP endpoint**: Paste the Streamable HTTP URL into the client’s MCP connector settings.
3. **Authorize once**: Complete OAuth, or provide a key when the client supports direct headers.
4. **Ask your AI to enhance**: Call IQPROMPT tools in the active conversation and keep context across refinements.

### Example configuration

Show this as an illustrative Streamable HTTP configuration example. Do not present it as the only supported client syntax; MCP clients vary in their configuration format.

```json
{
  "mcpServers": {
    "iqprompt": {
      "url": "https://mcp.iqprompt.ai/mcp"
    }
  }
}
```

### Authentication guidance

- OAuth is enabled by default. OAuth-capable clients open IQPROMPT's connect flow where each user pastes and validates their own key.
- Clients can send `X-API-Key: <user key>`.
- The service also accepts `Authorization: Bearer iq_...` or `Authorization: Bearer iq-...`.
- Local and single-tenant deployments can use `IQPROMPT_API_KEY` as an environment fallback.
- A missing key returns a tool error that tells the caller how to connect.

Do not expose a real API key input, key storage, or auth workflow in this landing page.

## MCP API Reference

Use `id="tools"`. Display the tools as a dense, responsive reference table. On desktop: name and description, parameters, then return value. On small screens: stack each tool's fields.

All tools return JSON strings. Authentication is resolved for every tool call.

| Tool | Purpose | Parameters | Result |
| --- | --- | --- | --- |
| `test_connection` | Validates the caller API key. It does not create a prompt or session. | None | `{ "status": "ok", "upstream": "https://dev.iqprompt.ai" }` or `{ "status": "error", "error": "..." }` |
| `create_session` | Creates an empty session for multi-turn continuity. | `end_user_email` optional | `{ "session_id": "..." }` |
| `enhance_prompt` | Enhances a general prompt. Prefer the coding-specific tool for coding-agent prompts. | `prompt` required; `session_id`, `mode`, `category`, `language`, `output_format`, `end_user_email`, `session_action`, `mcp_context` optional | Upstream JSON, normally including the enhanced prompt and `session_id` |
| `enhance_for_coding_agent` | Enhances prompts for Copilot, Cursor, Claude Code, and other coding agents. It forces `category="coding_agent"`. | `prompt` required; `session_id`, `mode`, `language`, `output_format`, `end_user_email`, `session_action`, `mcp_context` optional | Upstream JSON, normally including the enhanced prompt and `session_id` |

### Parameter rules

- `prompt`: whitespace-only values are invalid.
- `mode`: `foundation`, `advanced`, or `enhanced`; default is `advanced`.
- `output_format`: `prose` or `structured`; default is `prose`.
- `language`: optional output-language code, for example `en` or `es`.
- `category`: optional domain hint such as `technology`, `marketing`, or `coding_agent`; unavailable in `enhance_for_coding_agent` because that category is fixed.
- `session_action`: use `reset` to drop the current context and start fresh.
- `mcp_context`: optional runtime metadata used for semantic resolution.

### Session behavior callout

- The service caches sessions process-locally by upstream URL, API key, and lowercased end-user email.
- Later enhance calls can reuse the cached session when a caller omits `session_id`.
- Call `create_session` to explicitly create and store a new session.
- Passing `session_action: "reset"` starts with fresh context.
- Cache state is not durable across redeploys or multiple instances. For durable continuity, clients must pass `session_id` explicitly.

## HTTP Endpoint Reference

Use this as a separate compact reference block. It describes the MCP server, not the IQPROMPT upstream API.

| Method | Path | Purpose |
| --- | --- | --- |
| Streamable HTTP | `/mcp` | Main MCP endpoint for tools, sessions, and protocol handling. |
| GET | `/health` | Liveness information: `{ status, oauth, upstream }`. `status` is `ok` while the process is running. |
| GET | `/connect?state=...` | OAuth page that accepts an authorization state. Missing `state` returns HTTP 400. |
| POST | `/connect` | Accepts a pasted IQPROMPT API key, validates it upstream, and continues the OAuth flow. |
| GET | `/.well-known/oauth-authorization-server` | OAuth discovery endpoint when OAuth is enabled. |

The IQPROMPT upstream API is configured through `IQPROMPT_API_URL` and defaults to `https://dev.iqprompt.ai`. The MCP server applies the required upstream headers; the frontend never calls those upstream routes directly.

## Benefits Section

Use `id="benefits"`. Build four equal-weight outcome cards or a readable grid.

| Audience | Copy |
| --- | --- |
| AI users | Turn an incomplete thought into a useful instruction without leaving the AI workspace. |
| Engineering teams | Standardize prompt quality across coding agents while preserving each developer's working context. |
| Client teams | Give every role a repeatable way to produce more specific, structured requests from day one. |
| Stakeholders | Build prompt quality into existing AI adoption instead of asking people to learn another destination. |

Section heading: `A better prompt is a better next step.`

Supporting copy: `IQPROMPT MCP makes prompt quality an operating capability, not another place people need to remember to visit.`

## Final CTA

- Eyebrow: `Ready to connect`
- Heading: `Bring IQPROMPT into the conversations where the work gets done.`
- Display `https://mcp.iqprompt.ai/mcp` as the final endpoint reminder.
- Primary action: `Get API key` -> `https://iqprompt.ai/` in a new tab.
- Secondary action: `Review tools` -> `#tools`.

## Visual and Interaction Direction

- Use a technical, editorial, black and near-black visual treatment with a restrained cyan accent. Avoid a generic SaaS dashboard or oversized marketing cards.
- Keep documentation surfaces dense and scan-friendly: tool and route data should look like a reference, not a set of feature tiles.
- Use `code` styling for tool names, endpoint URLs, parameters, header names, values, and JSON.
- Cards can use a maximum `8px` corner radius. Avoid card-inside-card composition.
- No decorative gradients, bokeh, or floating blobs. A subtle technical grid, line, or glow is acceptable when it does not interfere with content.
- Anchor links should scroll smoothly and retain accessible focus states.
- All external links open in a new tab with `rel="noreferrer"`.
- Maintain text contrast and test at 320px, 768px, and 1440px widths. No horizontal page overflow is acceptable.

## Acceptance Criteria

- The correct endpoint appears in the hero-adjacent setup content and final CTA.
- The setup flow, authentication paths, four tools, parameter defaults, session behavior, and HTTP routes match this document.
- The page explicitly distinguishes MCP service endpoints from the upstream IQPROMPT API.
- The page describes value for users, engineering teams, client teams, and stakeholders.
- Desktop tables or grids collapse to readable single-column content on small screens.
- The page builds with `npm run build` and has no horizontal overflow at mobile widths.