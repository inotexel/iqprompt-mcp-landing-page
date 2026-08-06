import { useState } from "react";

const mcpEndpoint = "https://app.mcp.iqprompt.ai/mcp";
const streamableHttpConfig = `{
  "mcpServers": {
    "iqprompt": {
      "url": "${mcpEndpoint}",
      "headers": {
        "Authorization": "Bearer iq_your_api_key"
      }
    }
  }
}`;

const clients = [
  { label: "ChatGPT", icon: "chatgpt" },
  { label: "Cursor", icon: "cursor" },
  { label: "VS Code", icon: "vscode" },
  { label: "Claude Desktop", icon: "claude" },
  { label: "Any MCP-capable client", icon: "mcp" },
];

const setupSteps = [
  {
    number: "01",
    title: "Get an IQPROMPT API key",
    body: "Create or sign in to IQPROMPT and generate a personal API key.",
  },
  {
    number: "02",
    title: "Add the MCP endpoint",
    body: "Paste the Streamable HTTP URL into the client's MCP connector settings.",
  },
  {
    number: "03",
    title: "Authorize once",
    body: "Complete OAuth, or provide a key when the client supports direct headers.",
  },
  {
    number: "04",
    title: "Ask your AI to enhance",
    body: "Call IQPROMPT tools in the active conversation and keep context across refinements.",
  },
];

const authGuidance = [
  {
    id: "oauth",
    content: (
      <>
        OAuth is enabled by default. OAuth-capable clients open IQPROMPT&apos;s
        connect flow where each user pastes and validates their own key.
      </>
    ),
  },
  {
    id: "api-key-header",
    content: (
      <>
        Clients can send <code>X-API-Key: &lt;user key&gt;</code>.
      </>
    ),
  },
  {
    id: "bearer",
    content: (
      <>
        The service also accepts <code>Authorization: Bearer iq_...</code> or{" "}
        <code>Authorization: Bearer iq-...</code>.
      </>
    ),
  },
  {
    id: "env-fallback",
    content: (
      <>
        Local and single-tenant deployments can use{" "}
        <code>IQPROMPT_API_KEY</code> as an environment fallback.
      </>
    ),
  },
  {
    id: "missing-key",
    content: (
      <>
        A missing key returns a tool error that tells the caller how to connect.
      </>
    ),
  },
];

const tools = [
  {
    name: "test_connection",
    purpose:
      "Validates the caller API key. It does not create a prompt or session.",
    parameters: <span className="muted-value">None</span>,
    result: (
      <code>
        {'{ "status": "ok", "upstream": "https://dev.iqprompt.ai" }'} or{" "}
        {'{ "status": "error", "error": "..." }'}
      </code>
    ),
  },
  {
    name: "create_session",
    purpose: "Creates an empty session for multi-turn continuity.",
    parameters: (
      <>
        <code>end_user_email</code>
        <span className="param-state">optional</span>
      </>
    ),
    result: <code>{'{ "session_id": "..." }'}</code>,
  },
  {
    name: "enhance_prompt",
    purpose:
      "Enhances a general prompt. Prefer the coding-specific tool for coding-agent prompts.",
    parameters: (
      <>
        <code>prompt</code>
        <span className="param-state">required</span>; <code>session_id</code>,{" "}
        <code>mode</code>, <code>category</code>, <code>language</code>,{" "}
        <code>output_format</code>, <code>end_user_email</code>,{" "}
        <code>session_action</code>, <code>mcp_context</code>
        <span className="param-state">optional</span>
      </>
    ),
    result: (
      <>
        Upstream JSON, normally including the enhanced prompt and{" "}
        <code>session_id</code>
      </>
    ),
  },
  {
    name: "enhance_for_coding_agent",
    purpose:
      'Enhances prompts for Copilot, Cursor, Claude Code, and other coding agents. It forces category="coding_agent".',
    parameters: (
      <>
        <code>prompt</code>
        <span className="param-state">required</span>; <code>session_id</code>,{" "}
        <code>mode</code>, <code>language</code>, <code>output_format</code>,{" "}
        <code>end_user_email</code>, <code>session_action</code>,{" "}
        <code>mcp_context</code>
        <span className="param-state">optional</span>
      </>
    ),
    result: (
      <>
        Upstream JSON, normally including the enhanced prompt and{" "}
        <code>session_id</code>
      </>
    ),
  },
];

const parameterRules = [
  {
    name: "prompt",
    content: <>Whitespace-only values are invalid.</>,
  },
  {
    name: "mode",
    content: (
      <>
        <code>foundation</code>, <code>advanced</code>, or <code>enhanced</code>
        ; default is <code>advanced</code>.
      </>
    ),
  },
  {
    name: "output_format",
    content: (
      <>
        <code>prose</code> or <code>structured</code>; default is{" "}
        <code>prose</code>.
      </>
    ),
  },
  {
    name: "language",
    content: (
      <>
        Optional output-language code, for example <code>en</code> or{" "}
        <code>es</code>.
      </>
    ),
  },
  {
    name: "category",
    content: (
      <>
        Optional domain hint such as <code>technology</code>,{" "}
        <code>marketing</code>, or <code>coding_agent</code>; unavailable in{" "}
        <code>enhance_for_coding_agent</code> because that category is fixed.
      </>
    ),
  },
  {
    name: "session_action",
    content: (
      <>
        Use <code>reset</code> to drop the current context and start fresh.
      </>
    ),
  },
  {
    name: "mcp_context",
    content: <>Optional runtime metadata used for semantic resolution.</>,
  },
];

const sessionBehavior = [
  {
    id: "cache-key",
    content:
      "The service caches sessions process-locally by upstream URL, API key, and lowercased end-user email.",
  },
  {
    id: "reuse",
    content: (
      <>
        Later enhance calls can reuse the cached session when a caller omits{" "}
        <code>session_id</code>.
      </>
    ),
  },
  {
    id: "create",
    content: (
      <>
        Call <code>create_session</code> to explicitly create and store a new
        session.
      </>
    ),
  },
  {
    id: "reset",
    content: (
      <>
        Passing <code>session_action: &quot;reset&quot;</code> starts with fresh
        context.
      </>
    ),
  },
  {
    id: "durability",
    content: (
      <>
        Cache state is not durable across redeploys or multiple instances. For
        durable continuity, clients must pass <code>session_id</code>{" "}
        explicitly.
      </>
    ),
  },
];

const routes = [
  {
    method: "Streamable HTTP",
    path: "/mcp",
    purpose: "Main MCP endpoint for tools, sessions, and protocol handling.",
  },
  {
    method: "GET",
    path: "/health",
    purpose: (
      <>
        Liveness information: <code>{"{ status, oauth, upstream }"}</code>.{" "}
        <code>status</code> is <code>ok</code> while the process is running.
      </>
    ),
  },
  {
    method: "POST",
    path: "/connect",
    purpose:
      "Accepts a pasted IQPROMPT API key, validates it upstream, and continues the OAuth flow.",
  },
];

const outcomes = [
  {
    audience: "AI users",
    copy: "Turn an incomplete thought into a useful instruction without leaving the AI workspace.",
  },
  {
    audience: "Engineering teams",
    copy: "Standardize prompt quality across coding agents while preserving each developer's working context.",
  },
  {
    audience: "Client teams",
    copy: "Give every role a repeatable way to produce more specific, structured requests from day one.",
  },
  {
    audience: "Stakeholders",
    copy: "Build prompt quality into existing AI adoption instead of asking people to learn another destination.",
  },
];

function ClientLogo({ icon }: { icon: string }) {
  switch (icon) {
    case "chatgpt":
      return (
        <svg
          className="chatgpt-logo"
          viewBox="0 0 600 600"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M557 245.5a150 150 0 0 0-12.8-122.7 151 151 0 0 0-162.8-72.5 151.6 151.6 0 0 0-256.9 54.2 150 150 0 0 0-100 72.5 151 151 0 0 0 18.6 177.5c-13.6 40.8-9 85.6 12.8 122.7 32.8 57 98.6 86.3 162.9 72.5a151.4 151.4 0 0 0 257-54.9A151.4 151.4 0 0 0 557 245.6M331.5 560.7c-26.3 0-51.7-9.1-72-26l3.6-2 119.5-69c6-3.5 9.8-10 9.8-17V278.3l50.5 29.2q.8.4 1 1.3v139.6c-.2 62-50.4 112.2-112.4 112.3M90 457.6a112 112 0 0 1-13.4-75.3l3.6 2 119.5 69c6 3.6 13.5 3.6 19.6 0l146-84.2v58.3a2 2 0 0 1-.8 1.6l-121 69.8A112.5 112.5 0 0 1 90 457.6M58.5 197.4c13.3-23 34.2-40.4 59.2-49.3V290c-.1 7 3.6 13.5 9.7 17l145.3 83.8-50.5 29.2q-.8.5-1.8 0L99.7 350.3a112.6 112.6 0 0 1-41.2-153.5zm415 96.4-146-84.7 50.5-29q.8-.6 1.8 0l120.7 69.7a112.4 112.4 0 0 1-16.9 202.6v-142c-.2-6.9-4-13.2-10.2-16.6m50.2-75.6-3.6-2.1-119.3-69.6c-6-3.5-13.6-3.5-19.6 0l-146 84.2v-58.3q0-1 .7-1.5l120.8-69.7a112.5 112.5 0 0 1 167 116.5zm-316 103.4-50.5-29.1a2 2 0 0 1-1-1.4V151.9a112.5 112.5 0 0 1 184.4-86.4l-3.5 2-119.5 69c-6 3.5-9.8 10-9.8 17zm27.4-59.2 65-37.4 65.2 37.4v75l-65 37.5-65-37.5z"
          />
        </svg>
      );
    case "vscode":
      return (
        <svg viewBox="0 0 128 128" aria-hidden="true">
          <path
            fill="#007ACC"
            fillRule="evenodd"
            d="M90.767 127.126a7.968 7.968 0 0 0 6.35-.244l26.353-12.681a8 8 0 0 0 4.53-7.209V21.009a8 8 0 0 0-4.53-7.21L97.117 1.12a7.97 7.97 0 0 0-9.093 1.548l-50.45 46.026L15.6 32.013a5.328 5.328 0 0 0-6.807.302l-7.048 6.411a5.335 5.335 0 0 0-.006 7.888L20.796 64 1.74 81.387a5.336 5.336 0 0 0 .006 7.887l7.048 6.411a5.327 5.327 0 0 0 6.807.303l21.974-16.68 50.45 46.025a7.96 7.96 0 0 0 2.743 1.793Zm5.252-92.183L57.74 64l38.28 29.058V34.943Z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "cursor":
      return (
        <svg viewBox="0 0 600 600" aria-hidden="true">
          <path
            fill="#72716d"
            d="m299.5 300 260 150.1a19 19 0 0 1-6.8 6.8l-243 140.4a20 20 0 0 1-20.4 0l-243-140.4a19 19 0 0 1-6.8-6.8z"
          />
          <path
            fill="#55544f"
            d="M299.5 0v300l-260 150.1A19 19 0 0 1 37 441V159a19 19 0 0 1 9.3-16l243-140.4A20 20 0 0 1 299.5 0"
          />
          <path
            fill="#43413c"
            d="M559.5 149.9a19 19 0 0 0-6.8-6.8L309.7 2.7A20 20 0 0 0 299.5 0v300l260 150.1a19 19 0 0 0 2.5-9.2V159q0-5-2.5-9.2z"
          />
          <path
            fill="#d6d5d2"
            d="M541.3 160.4a9 9 0 0 1 0 8.7l-236 408.8c-1.6 2.8-5.8 1.7-5.8-1.5V307a12 12 0 0 0-1.6-6z"
          />
          <path
            fill="#fff"
            d="M541.3 160.4 298 300.9a12 12 0 0 0-4.4-4.4L60.2 161.8c-2.8-1.6-1.6-5.8 1.5-5.8h472c3.4 0 6.2 1.8 7.6 4.4"
          />
        </svg>
      );
    case "claude":
      return (
        <svg viewBox="0 0 600 600" aria-hidden="true">
          <path
            fill="#D97757"
            d="M119 398.8 236.3 333l2-5.8-2-3.1h-5.7l-19.6-1.2-67-1.9-58.2-2.4-56.3-3-14.2-3L2 295l1.4-8.8 11.9-8 17 1.5 37.8 2.6 56.6 3.9 41 2.4 61 6.3h9.6l1.4-3.9-3.3-2.4-2.6-2.4-58.6-39.7-63.4-42-33.2-24.1-18-12.3-9-11.4-4-25 16.3-18 22 1.4 5.5 1.5 22.2 17.1 47.4 36.7 62 45.6 9 7.5 3.6-2.6.4-1.8-4-6.8-33.7-60.8-36-62L146.5 64l-4.2-15.4a75 75 0 0 1-2.6-18l18.6-25.3L168.4 2l24.8 3.3 10.4 9L219 49.7l25 55.4 38.6 75.3 11.3 22.4 6 20.7 2.3 6.3h4V226l3-42.5 6-52.1 5.7-67 2-19 9.3-22.6 18.6-12.2 14.5 7 11.9 17-1.7 11-7 46.1-14 72.2-9 48.3h5.3l6-6 24.4-32.5 41.1-51.4 18.1-20.3 21.2-22.5 13.6-10.8h25.6L519.7 97l-8.5 29-26.4 33.5-21.9 28.4-31.4 42.3-19.6 33.8 1.8 2.7 4.7-.4 71-15.1 38.3-7 45.7-7.8 20.7 9.6 2.3 9.9-8.2 20-48.9 12.1-57.4 11.5-85.4 20.2-1 .8 1.1 1.5 38.5 3.6 16.5.9h40.3l75 5.6 19.7 13 11.7 15.8-2 12.1-30.1 15.4-40.8-9.7-95.1-22.6-32.6-8.1h-4.5v2.7l27.1 26.5 49.9 45 62.3 58 3.2 14.3-8 11.4-8.5-1.2-54.8-41.3-21.1-18.5-47.9-40.4h-3.2v4.3l11 16.1 58.3 87.6 3 26.9-4.2 8.7-15 5.3-16.7-3-34-48-35.3-53.8L331 400l-3.5 2-16.8 180.4-7.8 9.3-18.1 6.9-15.1-11.5-8-18.5 8-36.7 9.6-48 7.9-38 7-47.2 4.3-15.7-.3-1-3.4.4-35.7 48.9-54.2 73.2-42.9 46-10.2 4-17.8-9.2 1.6-16.5 10-14.6 59.3-75.5 35.8-46.8 23.1-27-.1-4h-1.4L104.6 463.4l-28 3.6-12.1-11.3 1.5-18.6 5.7-6 47.4-32.6-.2.1z"
          />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 600 600" aria-hidden="true">
          <path
            fill="currentColor"
            d="M392.2 58.6a64.7 64.7 0 0 0-90.2 0l-240.7 236a21.6 21.6 0 0 1-30 0 20.6 20.6 0 0 1 0-29.5L271.8 29a108 108 0 0 1 150.4 0 103 103 0 0 1 30 88.5 108 108 0 0 1 90.3 29.5l1.3 1.2a103 103 0 0 1 0 147.5L326.2 509.3a7 7 0 0 0 0 9.8l44.7 43.8a20.6 20.6 0 0 1 0 29.5 21.6 21.6 0 0 1-30 0L296 548.6a48 48 0 0 1 0-68.8l217.7-213.5a62 62 0 0 0 0-88.5l-1.3-1.2a64.7 64.7 0 0 0-90.1-.1L243 352.3l-.1.1-2.4 2.4a21.6 21.6 0 0 1-30.1 0 20.6 20.6 0 0 1 0-29.5L392.3 147a62 62 0 0 0-.1-88.4"
          />
          <path
            fill="currentColor"
            d="M362.1 117.6a20.6 20.6 0 0 0 0-29.5 21.6 21.6 0 0 0-30 0L154 262.6a103 103 0 0 0 0 147.5 108 108 0 0 0 150.4 0l178-174.5a20.6 20.6 0 0 0 0-29.5 21.6 21.6 0 0 0-30.2 0l-178 174.5a64.7 64.7 0 0 1-90.2 0 62 62 0 0 1 0-88.5z"
          />
        </svg>
      );
  }
}

function App() {
  const [copiedTarget, setCopiedTarget] = useState<string | null>(null);

  const copyValue = async (value: string, target: string) => {
    if (!navigator.clipboard) {
      setCopiedTarget(null);
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setCopiedTarget(target);
      window.setTimeout(() => setCopiedTarget(null), 1800);
    } catch {
      setCopiedTarget(null);
    }
  };

  return (
    <div className="site-shell">
      <header className="site-header">
        <a
          className="brand"
          href="https://iqprompt.ai/"
          target="_blank"
          rel="noreferrer"
        >
          <img
            src="/iqprompt-logo-opt.webp"
            alt="IQPROMPT Infinite Intelligence"
          />
        </a>
        <nav className="nav-links" aria-label="Primary navigation">
          <a href="#setup">Setup</a>
          <a href="#tools">API reference</a>
          <a href="#benefits">Benefits</a>
        </nav>
        <a className="button button-secondary header-action" href="#setup">
          Connect MCP
        </a>
      </header>

      <main>
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-wrap">
            <div className="hero-content">
              <p className="section-kicker">IQPROMPT MCP</p>
              <h1 id="hero-title">
                Prompt expertise, wired into the AI work already happening.
              </h1>
              <p className="hero-subtitle">
                IQPROMPT MCP gives ChatGPT, Cursor, Claude, and other MCP
                clients a secure path to sharpen prompts, retain multi-turn
                context, and deliver clearer work without tab switching.
              </p>

              <div className="hero-actions">
                <a className="button button-primary" href="#setup">
                  Set up the endpoint
                </a>
                <a className="button button-secondary" href="#tools">
                  Read the API reference
                </a>
              </div>

              <div className="client-stack">
                <span>Works in</span>
                <div className="client-row" aria-label="Supported MCP clients">
                  {clients.map((client) => (
                    <span className="client-chip" key={client.label}>
                      <ClientLogo icon={client.icon} />
                      <span>{client.label}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div
              className="hero-aside"
              aria-label="Illustrative IQPROMPT MCP workflow"
            >
              <article className="prompt-flow-panel">
                <div className="flow-panel-header">
                  <span>Illustrative flow</span>
                  <span>Not a live request</span>
                </div>
                <div className="flow-panel-body">
                  <div className="flow-block">
                    <span>Rough prompt</span>
                    <p>
                      write something about our new billing thing for customers
                    </p>
                  </div>

                  <div className="flow-action-row">
                    <span aria-hidden="true" />
                    <code>enhance_prompt</code>
                    <span aria-hidden="true" />
                  </div>

                  <div className="flow-block flow-block-improved">
                    <span>Improved prompt</span>
                    <p>
                      Draft a 150-word changelog entry announcing usage-based
                      billing to existing customers. Lead with what changes on
                      their next invoice, name the two new metered dimensions,
                      and close with a link to the migration guide. Plain,
                      factual tone; no exclamation marks.
                    </p>
                  </div>
                </div>
                <div className="flow-panel-footer">
                  Example only <span aria-hidden="true">&middot;</span> no
                  connected user session
                </div>
              </article>

              <article
                className="hero-endpoint-card"
                aria-label="MCP Streamable HTTP endpoint"
              >
                <div className="endpoint-card-heading">
                  <span>MCP Streamable HTTP endpoint</span>
                </div>
                <div className="endpoint-card-body">
                  <code>{mcpEndpoint}</code>
                  <button
                    className="copy-button"
                    type="button"
                    onClick={() => copyValue(mcpEndpoint, "hero")}
                    aria-label="Copy MCP Streamable HTTP endpoint from hero"
                  >
                    {copiedTarget === "hero" ? "Copied" : "Copy"}
                  </button>
                </div>
              </article>

              <p className="hero-route-note">
                MCP client -&gt; IQPROMPT MCP (/mcp and helper routes) -&gt;
                IQPROMPT API
              </p>
            </div>
          </div>
        </section>

        <section
          id="setup"
          className="section-band setup-section"
          aria-labelledby="setup-title"
        >
          <div className="content-wrap setup-wrap">
            <div className="setup-heading">
              <p className="numbered-kicker">
                <span>01</span>
                <span aria-hidden="true" />
                Setup
              </p>
              <h2 id="setup-title">One endpoint, then authorize once.</h2>
            </div>

            <article
              className="setup-endpoint-card"
              aria-label="MCP Streamable HTTP endpoint"
            >
              <div className="endpoint-card-heading">
                <span>MCP Streamable HTTP endpoint</span>
              </div>
              <div className="setup-endpoint-body">
                <code>{mcpEndpoint}</code>
                <button
                  className="copy-button"
                  type="button"
                  onClick={() => copyValue(mcpEndpoint, "setup")}
                  aria-label="Copy MCP Streamable HTTP endpoint"
                >
                  {copiedTarget === "setup" ? "Copied" : "Copy"}
                </button>
              </div>
              <a
                className="setup-key-link"
                href="https://iqprompt.ai/"
                target="_blank"
                rel="noreferrer"
              >
                Get API key -&gt;
              </a>
            </article>

            <div className="setup-detail-grid">
              <div className="setup-step-list" aria-label="Setup flow">
                {setupSteps.map((step) => (
                  <article key={step.number} className="setup-step">
                    <span>{step.number}</span>
                    <div>
                      <h3>{step.title}</h3>
                      <p>{step.body}</p>
                    </div>
                  </article>
                ))}
              </div>

              <div className="setup-info-column">
                <p className="setup-side-label">Example configuration</p>
                <article className="setup-code-panel">
                  <div className="setup-panel-heading">
                    <span>
                      Streamable HTTP <span aria-hidden="true">&middot;</span>{" "}
                      illustrative
                    </span>
                    <button
                      className="copy-button"
                      type="button"
                      onClick={() => copyValue(streamableHttpConfig, "config")}
                      aria-label="Copy illustrative Streamable HTTP configuration"
                    >
                      {copiedTarget === "config" ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <pre>{streamableHttpConfig}</pre>
                </article>
                <p className="setup-panel-note">
                  Client configuration formats vary. Treat this as one example,
                  not the only supported syntax.
                </p>

                <div className="setup-auth">
                  <p className="setup-side-label">Authentication</p>
                  <ul className="auth-list">
                    {authGuidance.map((item) => (
                      <li key={item.id}>{item.content}</li>
                    ))}
                  </ul>
                  <p className="auth-note">
                    This page never collects, stores, or validates a real API
                    key. Authorization happens in your MCP client.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="tools"
          className="section-band tools-section"
          aria-labelledby="tools-title"
        >
          <div className="content-wrap tools-wrap">
            <div className="tools-heading">
              <div>
                <p className="numbered-kicker">
                  <span>02</span>
                  <span aria-hidden="true" />
                  MCP API reference
                </p>
                <h2 id="tools-title">
                  Four tools, all returning JSON strings.
                </h2>
              </div>
              <p>
                Authentication is resolved for every tool call. These are the
                MCP service tools, not the upstream IQPROMPT API.
              </p>
            </div>

            <div
              className="tool-table"
              role="table"
              aria-label="IQPROMPT MCP tools"
            >
              <div className="table-header" role="row">
                <span role="columnheader">Tool</span>
                <span role="columnheader">Parameters</span>
                <span role="columnheader">Result</span>
              </div>
              {tools.map((tool) => (
                <article className="tool-row" key={tool.name} role="row">
                  <div className="tool-cell tool-name">
                    <span className="mobile-label">Tool</span>
                    <code>{tool.name}</code>
                    <p>{tool.purpose}</p>
                  </div>
                  <div className="tool-cell tool-params">
                    <span className="mobile-label">Parameters</span>
                    <p>{tool.parameters}</p>
                  </div>
                  <div className="tool-cell tool-result">
                    <span className="mobile-label">Result</span>
                    <p>{tool.result}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="tools-reference-grid">
              <article className="parameter-rules-panel">
                <p className="setup-side-label">Parameter rules</p>
                <div className="parameter-rules-table">
                  {parameterRules.map((rule) => (
                    <div className="parameter-rule-row" key={rule.name}>
                      <code>{rule.name}</code>
                      <p>{rule.content}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="session-behavior-panel">
                <p className="setup-side-label">Session behavior</p>
                <ul>
                  {sessionBehavior.map((item) => (
                    <li key={item.id}>{item.content}</li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section
          className="section-band routes-section"
          aria-labelledby="routes-title"
        >
          <div className="content-wrap routes-wrap">
            <div className="routes-layout">
              <div className="routes-heading">
                <p className="numbered-kicker">
                  <span>03</span>
                  <span aria-hidden="true" />
                  HTTP endpoint reference
                </p>
                <h2 id="routes-title">
                  Routes on the MCP server, not the IQPROMPT upstream API.
                </h2>
                <p className="routes-note">
                  The upstream API is configured through{" "}
                  <code>IQPROMPT_API_URL</code> and defaults to{" "}
                  <code>https://dev.iqprompt.ai</code>. The frontend never calls
                  those upstream routes directly.
                </p>
              </div>

              <div
                className="route-card-list"
                role="list"
                aria-label="IQPROMPT MCP HTTP endpoints"
              >
                {routes.map((route, index) => (
                  <article
                    className={`route-card${
                      index === 0 ? " route-card-primary" : ""
                    }`}
                    key={`${route.method}-${route.path}`}
                    role="listitem"
                  >
                    <div className="route-card-meta">
                      <strong>{route.method}</strong>
                      <code>{route.path}</code>
                    </div>
                    <p>{route.purpose}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="benefits"
          className="section-band benefits-section"
          aria-labelledby="benefits-title"
        >
          <div className="content-wrap benefits-wrap">
            <div className="benefits-heading">
              <div>
                <p className="numbered-kicker">
                  <span>04</span>
                  <span aria-hidden="true" />
                  Benefits
                </p>
                <h2 id="benefits-title">
                  A better prompt is a better next step.
                </h2>
              </div>
              <p>
                IQPROMPT MCP makes prompt quality an operating capability, not
                another place people need to remember to visit.
              </p>
            </div>

            <div className="outcome-grid">
              {outcomes.map((outcome) => (
                <article key={outcome.audience} className="outcome-card">
                  <span>{outcome.audience}</span>
                  <p>{outcome.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="final-cta" aria-labelledby="cta-title">
          <div className="content-wrap cta-wrap">
            <div className="cta-copy">
              <p className="section-kicker">Ready to connect</p>
              <h2 id="cta-title">
                Bring IQPROMPT into the conversations where the work gets done.
              </h2>
              <div className="cta-actions">
                <a
                  className="button button-primary"
                  href="https://iqprompt.ai/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Get API key
                </a>
                <a className="button button-secondary" href="#tools">
                  Review tools
                </a>
              </div>
            </div>

            <article
              className="cta-endpoint-card"
              aria-label="Final MCP endpoint reminder"
            >
              <div className="endpoint-card-heading">
                <span>MCP Streamable HTTP endpoint</span>
              </div>
              <div className="cta-endpoint-body">
                <code>{mcpEndpoint}</code>
                <button
                  className="copy-button"
                  type="button"
                  onClick={() => copyValue(mcpEndpoint, "final")}
                  aria-label="Copy final MCP endpoint reminder"
                >
                  {copiedTarget === "final" ? "Copied" : "Copy"}
                </button>
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
