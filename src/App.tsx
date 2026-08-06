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
  { label: "ChatGPT", href: "https://chatgpt.com" },
  { label: "Cursor", href: "https://cursor.com" },
  { label: "Claude Desktop", href: "https://claude.ai/download" },
  { label: "Any MCP-capable client", href: "https://modelcontextprotocol.io" },
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
    method: "GET",
    path: "/connect?state=...",
    purpose: (
      <>
        OAuth page that accepts an authorization state. Missing{" "}
        <code>state</code> returns <code>HTTP 400</code>.
      </>
    ),
  },
  {
    method: "POST",
    path: "/connect",
    purpose:
      "Accepts a pasted IQPROMPT API key, validates it upstream, and continues the OAuth flow.",
  },
  {
    method: "GET",
    path: "/.well-known/oauth-authorization-server",
    purpose: "OAuth discovery endpoint when OAuth is enabled.",
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
                    <a
                      key={client.label}
                      href={client.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {client.label}
                    </a>
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
                  <span className="oauth-status">
                    <span aria-hidden="true" />
                    OAuth enabled
                  </span>
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
                <span className="oauth-status">
                  <span aria-hidden="true" />
                  OAuth enabled
                </span>
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
                <span className="oauth-status">
                  <span aria-hidden="true" />
                  OAuth enabled
                </span>
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
