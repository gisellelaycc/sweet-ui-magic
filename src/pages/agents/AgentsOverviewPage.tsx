import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/twin-matrix/PageLayout';

const FEATURES = [
  { icon: '🔍', title: 'Discover Humans', desc: 'Search verified human profiles by skill, experience, and availability. Filter by sport, domain, or custom criteria.' },
  { icon: '🤝', title: 'Negotiate & Transact', desc: 'Programmatically request quotes, negotiate terms, and execute payments — all through a unified protocol.' },
  { icon: '🛡️', title: 'Trust Primitives', desc: 'Every human is verified. Every task is versioned. Every transaction is recorded on-chain.' },
];

const TRUST_ITEMS = [
  { label: 'Human Verification', desc: 'Proof-of-humanity via twin3.ai before any listing.' },
  { label: 'Versioned Identity', desc: 'Twin Matrix state is immutable per version — agents always read consistent data.' },
  { label: 'On-chain Records', desc: 'All transactions, authorizations, and state changes recorded on BSC.' },
];

const AgentsOverviewPage = () => {
  const navigate = useNavigate();

  const cardStyle: React.CSSProperties = {
    border: '1px solid var(--glass-border)',
    borderRadius: '16px',
    padding: '1.75rem',
    background: 'var(--glass-bg)',
  };

  return (
    <PageLayout activePage="agents">
      <div className="max-w-5xl mx-auto w-full space-y-12 py-6">
        {/* Hero */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground font-heading">For Agents & Systems</p>
          <h1 className="text-3xl md:text-5xl font-heading font-bold leading-tight">
            Access Real Human Experience.<br />Programmatically.
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto">
            Connect your buyer agents to a marketplace of verified humans. Search, negotiate, and pay for expertise — no UI required.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button onClick={() => navigate('/agents/connect')} className="btn-twin btn-twin-primary py-3 px-6 text-sm">
              Get Started
            </button>
            <button onClick={() => navigate('/agents/api')} className="btn-twin btn-twin-ghost py-3 px-6 text-sm">
              View API Docs
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} style={cardStyle} className="space-y-3">
              <span className="text-2xl">{f.icon}</span>
              <h3 className="text-lg font-heading font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Trust */}
        <div className="space-y-4">
          <h2 className="text-xl font-heading font-bold text-center">Trust Architecture</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {TRUST_ITEMS.map((item) => (
              <div key={item.label} style={cardStyle} className="space-y-2">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4 py-6" style={{ ...cardStyle, background: 'hsl(var(--foreground) / 0.03)' }}>
          <h2 className="text-xl font-heading font-bold">Ready to integrate?</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Choose your integration path: Skill protocol, REST API, or SDK. Get started in minutes.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => navigate('/agents/connect')} className="btn-twin btn-twin-primary py-3 px-6 text-sm">
              Connect Agent
            </button>
            <button onClick={() => navigate('/agents/examples')} className="btn-twin btn-twin-ghost py-3 px-6 text-sm">
              View Examples
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default AgentsOverviewPage;
