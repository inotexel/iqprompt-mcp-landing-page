const features = [
  {
    title: 'Enhance a prompt',
    body: 'Send a rough prompt and get a clearer, more actionable version back inside your AI client.',
  },
  {
    title: 'Choose intensity',
    body: 'Foundation, advanced, or enhanced modes let users match the rewrite to the job.',
  },
  {
    title: 'Stay in context',
    body: 'Create a session and refine the same thread across multiple enhancements.',
  },
  {
    title: 'Choose format',
    body: 'Return prose or structured output depending on how the improved prompt will be used.',
  },
  {
    title: 'Per-user auth',
    body: 'Each user connects with their own IQPROMPT key, keeping usage personal and controlled.',
  },
  {
    title: 'Test the connection',
    body: 'Verify the API key and upstream service before relying on it in a workflow.',
  },
];

const steps = ['Connect', 'Ask', 'Enhance', 'Use or refine'];

const clients = [
  { label: 'ChatGPT', href: 'https://chatgpt.com' },
  { label: 'Cursor', href: 'https://cursor.com' },
  { label: 'Claude Desktop', href: 'https://claude.ai/download' },
  { label: 'Any MCP-capable client', href: 'https://modelcontextprotocol.io' },
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
          <a href="#how-it-works">How it works</a>
          <a href="#features">Features</a>
          <a href="#compatibility">Compatibility</a>
        </nav>
        <span className="text-link header-link">
          Connect MCP
        </span>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <p className="section-kicker">IQPROMPT MCP</p>
            <h1>Better prompts, inside the AI tools you already use.</h1>
            <p className="hero-subtitle">
              Connect ChatGPT, Cursor, Claude, and other AI clients to IQPROMPT so rough
              prompts become clear, actionable instructions without switching tabs.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="https://iqprompt.ai/" target="_blank" rel="noreferrer">
                Get your API key
              </a>
              <span className="text-link hero-link">
                Connect MCP
              </span>
            </div>
            <div className="client-row" aria-label="Supported clients">
              {clients.map((client) => (
                <a key={client.label} href={client.href} target="_blank" rel="noreferrer">
                  {client.label}
                </a>
              ))}
            </div>
          </div>

          <a
            className="hero-product"
            href="https://mcp.iqprompt.ai/mcp"
            target="_blank"
            rel="noreferrer"
            aria-label="Open IQPROMPT MCP endpoint"
          >
            <div className="product-toolbar">
              <span className="status-dot" />
              <span>mcp.iqprompt.ai</span>
              <strong>Connected</strong>
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
          </a>
        </section>

        <section className="fact-grid" aria-label="Product positioning">
          <article>
            <span>Without MCP</span>
            <h2>IQPROMPT is a destination.</h2>
            <p>Users leave their AI workspace, rewrite the prompt elsewhere, then paste it back.</p>
          </article>
          <article>
            <span>With MCP</span>
            <h2>IQPROMPT becomes infrastructure.</h2>
            <p>Prompt enhancement lives where the work already happens: the AI client itself.</p>
          </article>
        </section>

        <section id="how-it-works" className="section-block">
          <div className="section-heading">
            <p className="section-kicker">How it works</p>
            <h2>Connect, enhance, and keep moving.</h2>
          </div>
          <div className="steps-grid">
            {steps.map((step, index) => (
              <article key={step} className="step-card">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{step}</h3>
                <p>
                  {index === 0 && 'Add IQPROMPT MCP in ChatGPT, Cursor, Claude, or another compatible host.'}
                  {index === 1 && 'Give the assistant a rough prompt or ask it to improve one via IQPROMPT.'}
                  {index === 2 && 'The MCP forwards the request to IQPROMPT and returns a sharper prompt.'}
                  {index === 3 && 'Run with the improved prompt or iterate in the same session.'}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="features" className="section-block">
          <div className="section-heading">
            <p className="section-kicker">Core capabilities</p>
            <h2>Everything needed for in-flow prompt refinement.</h2>
          </div>
          <div className="features-grid">
            {features.map((feature) => (
              <article key={feature.title} className="feature-card">
                <div className="feature-icon" aria-hidden="true">
                  {feature.title.slice(0, 1)}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="compatibility" className="compat-section">
          <div>
            <p className="section-kicker">Compatibility</p>
            <h2>Built on the open Model Context Protocol.</h2>
            <p>
              IQPROMPT MCP is a thin proxy to the same IQPROMPT enhancement engine used by
              the product, with OAuth for ChatGPT and Bearer keys for Cursor and Claude.
            </p>
          </div>
          <div className="compat-panel">
            {clients.map((client) => (
              <a key={client.label} href={client.href} target="_blank" rel="noreferrer">
                {client.label}
              </a>
            ))}
          </div>
        </section>

        <section className="cta-section">
          <p className="section-kicker">Ready endpoint</p>
          <h2>Connect your AI workspace to IQPROMPT.</h2>
          <a className="endpoint-link" href="https://iqprompt.ai/" target="_blank" rel="noreferrer">
            <code>https://iqprompt.ai/</code>
          </a>
          <div className="hero-actions">
            <a className="button button-primary" href="https://iqprompt.ai/" target="_blank" rel="noreferrer">
              Get API key
            </a>
            <a className="button button-secondary" href="https://iqprompt.ai/" target="_blank" rel="noreferrer">
              Open IQPROMPT
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
