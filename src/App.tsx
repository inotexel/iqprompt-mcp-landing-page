const mcpEndpoint = 'https://mcp.iqprompt.ai/mcp';

const clients = [
  { label: 'ChatGPT', href: 'https://chatgpt.com' },
  { label: 'Cursor', href: 'https://cursor.com' },
  { label: 'Claude Desktop', href: 'https://claude.ai/download' },
  { label: 'Any MCP-capable client', href: 'https://modelcontextprotocol.io' },
];

const setupSteps = [
  ['01', 'Get an IQPROMPT API key', 'Create or sign in to your IQPROMPT account and generate a personal API key.'],
  ['02', 'Add the MCP endpoint', 'Paste the Streamable HTTP URL into your client’s MCP connector settings.'],
  ['03', 'Authorize once', 'Complete the secure OAuth flow, or supply your key where your client supports it.'],
  ['04', 'Ask your AI to enhance', 'Use IQPROMPT tools directly in your existing conversation and keep the context.'],
];

const tools = [
  {
    name: 'test_connection',
    description: 'Validates the caller API key without creating a prompt or session.',
    parameters: 'No parameters',
    result: '{ "status": "ok", "upstream": "..." }',
  },
  {
    name: 'create_session',
    description: 'Starts an empty multi-turn session and returns a reusable session ID.',
    parameters: 'end_user_email? ',
    result: '{ "session_id": "..." }',
  },
  {
    name: 'enhance_prompt',
    description: 'Improves a general prompt with optional domain, language, format, and session controls.',
    parameters: 'prompt*, mode?, category?, language?, output_format?, session_id?',
    result: 'Enhanced prompt JSON + session_id',
  },
  {
    name: 'enhance_for_coding_agent',
    description: 'Optimizes a prompt for Copilot, Cursor, Claude Code, and other coding agents.',
    parameters: 'prompt*, mode?, language?, output_format?, session_id?',
    result: 'Enhanced coding prompt JSON + session_id',
  },
];

const outcomes = [
  ['For AI users', 'Turn an incomplete thought into a useful instruction without leaving the AI workspace.'],
  ['For engineering teams', 'Standardize prompt quality across coding agents while preserving each developer’s working context.'],
  ['For client teams', 'Give every role a repeatable way to produce more specific, structured requests from day one.'],
  ['For stakeholders', 'Build prompt quality into existing AI adoption instead of asking people to learn another destination.'],
];

function App() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="https://iqprompt.ai/" target="_blank" rel="noreferrer">
          <img src="/iqprompt-logo-opt.webp" alt="IQPROMPT Infinite Intelligence" />
          <span>World's First and Only Anticipatory Technology to Go from Prompt to Perfection</span>
        </a>
        <nav className="nav-links" aria-label="Primary navigation">
          <a href="#setup">Setup</a>
          <a href="#tools">API reference</a>
          <a href="#benefits">Benefits</a>
        </nav>
        <a className="button button-secondary header-button" href="#setup">Connect MCP</a>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <p className="section-kicker">IQPROMPT MCP</p>
            <h1>Prompt expertise, wired into the AI work already happening.</h1>
            <p className="hero-subtitle">
              IQPROMPT MCP gives ChatGPT, Cursor, Claude, and other MCP clients a secure path to
              sharpen prompts, retain multi-turn context, and deliver clearer work without tab switching.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#setup">Set up the endpoint</a>
              <a className="button button-secondary" href="#tools">Read the API reference</a>
            </div>
            <div className="client-row" aria-label="Supported clients">
              {clients.map((client) => (
                <a key={client.label} href={client.href} target="_blank" rel="noreferrer">
                  {client.label}
                </a>
              ))}
            </div>
          </div>

          <div className="hero-product" aria-label="IQPROMPT MCP workflow example">
            <div className="product-toolbar">
              <span className="status-dot" />
              <span>mcp.iqprompt.ai</span>
              <strong>Streamable HTTP</strong>
            </div>
            <div className="prompt-card rough">
              <span>Rough prompt</span>
              <p>Write something about launching our AI assistant for customers.</p>
            </div>
            <div className="enhance-line">
              <span />
              <strong>enhance_prompt</strong>
              <span />
            </div>
            <div className="prompt-card enhanced">
              <span>IQPROMPT output</span>
              <p>
                Create a concise launch announcement for our customer-facing AI assistant.
                Explain the problem it solves, three key benefits, onboarding steps, and a
                confident call to action.
              </p>
            </div>
          </div>
        </section>

        <section id="setup" className="section-block setup-section">
          <div className="section-heading"><p className="section-kicker">Connect in minutes</p><h2>One endpoint. Your AI client. Your IQPROMPT key.</h2></div>
          <div className="endpoint-panel">
            <div><span className="endpoint-label">MCP Streamable HTTP endpoint</span><code>{mcpEndpoint}</code></div>
            <a className="button button-primary" href="https://iqprompt.ai/" target="_blank" rel="noreferrer">Get API key</a>
          </div>
          <div className="steps-grid">
            {setupSteps.map(([number, title, body]) => <article key={number} className="step-card"><span>{number}</span><h3>{title}</h3><p>{body}</p></article>)}
          </div>
          <div className="config-grid">
            <article className="code-panel"><div className="code-panel-title"><span>Cursor / HTTP client</span><span>JSON</span></div><pre>{`{
  "mcpServers": {
    "iqprompt": {
      "url": "${mcpEndpoint}"
    }
  }
}`}</pre></article>
            <article className="auth-panel"><p className="section-kicker">Authentication</p><h3>Connect securely, per user.</h3><p>OAuth is enabled by default. Clients that support it open the IQPROMPT connect flow where each user pastes and validates their own key.</p><p>For clients that accept headers, use <code>X-API-Key</code> or a Bearer token beginning with <code>iq_</code>. A local deployment can also use <code>IQPROMPT_API_KEY</code>.</p></article>
          </div>
        </section>

        <section id="tools" className="section-block">
          <div className="section-heading"><p className="section-kicker">MCP API reference</p><h2>Four tools, designed for prompt work that keeps moving.</h2><p>All tools return JSON strings and resolve authentication for each request.</p></div>
          <div className="tool-list">
            {tools.map((tool) => <article className="tool-row" key={tool.name}><div><code>{tool.name}</code><p>{tool.description}</p></div><div><span>Parameters</span><p><code>{tool.parameters}</code></p></div><div><span>Returns</span><p><code>{tool.result}</code></p></div></article>)}
          </div>
          <div className="reference-grid">
            <article><p className="section-kicker">Session behavior</p><h3>Continue the useful thread.</h3><p>Pass a <code>session_id</code> from <code>create_session</code>, or let IQPROMPT reuse the cached session for the same key and end user. Use <code>session_action: &quot;reset&quot;</code> to start clean.</p></article>
            <article><p className="section-kicker">Modes and output</p><h3>Match the refinement to the work.</h3><p>Choose <code>foundation</code>, <code>advanced</code>, or <code>enhanced</code>. Return natural <code>prose</code> or a <code>structured</code> response, and set a language when needed.</p></article>
          </div>
        </section>

        <section className="section-block routes-section">
          <div className="section-heading"><p className="section-kicker">Service endpoints</p><h2>Everything your deployment exposes.</h2></div>
          <div className="routes-table" role="table" aria-label="IQPROMPT MCP HTTP routes">
            <div className="route-heading" role="row"><span>Method</span><span>Path</span><span>Purpose</span></div>
            <div role="row"><strong>Streamable HTTP</strong><code>/mcp</code><span>Main MCP endpoint for tools, sessions, and protocol.</span></div>
            <div role="row"><strong>GET</strong><code>/health</code><span>Returns process status, OAuth availability, and upstream URL.</span></div>
            <div role="row"><strong>GET / POST</strong><code>/connect</code><span>OAuth page and API-key handoff for authorization.</span></div>
            <div role="row"><strong>GET</strong><code>/.well-known/oauth-authorization-server</code><span>OAuth discovery when OAuth is enabled.</span></div>
          </div>
        </section>

        <section id="benefits" className="benefits-section">
          <div className="section-heading"><p className="section-kicker">What it changes</p><h2>A better prompt is a better next step.</h2><p>IQPROMPT MCP makes prompt quality an operating capability, not another place people need to remember to visit.</p></div>
          <div className="outcome-grid">{outcomes.map(([title, body], index) => <article key={title}><span>{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
        </section>

        <section className="cta-section"><p className="section-kicker">Ready to connect</p><h2>Bring IQPROMPT into the conversations where the work gets done.</h2><a className="endpoint-link" href={mcpEndpoint} target="_blank" rel="noreferrer"><code>{mcpEndpoint}</code></a><div className="hero-actions"><a className="button button-primary" href="https://iqprompt.ai/" target="_blank" rel="noreferrer">Get API key</a><a className="button button-secondary" href="#tools">Review tools</a></div></section>
      </main>
    </div>
  );
}

export default App;
