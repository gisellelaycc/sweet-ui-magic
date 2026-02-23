import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/twin-matrix/PageLayout';
import { toast } from 'sonner';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
  status: 'active' | 'revoked';
}

const MOCK_KEYS: ApiKey[] = [
  { id: '1', name: 'Production', key: 'tm_live_k8f2j9a3m5n7p1q4', created: '2026-01-15', lastUsed: '2026-02-23', status: 'active' },
  { id: '2', name: 'Staging', key: 'tm_test_a1b2c3d4e5f6g7h8', created: '2026-02-01', lastUsed: '2026-02-20', status: 'active' },
];

const MOCK_USAGE = [
  { date: '2026-02-23', searches: 847, matches: 234, messages: 56, transactions: 12 },
  { date: '2026-02-22', searches: 1203, matches: 389, messages: 78, transactions: 19 },
  { date: '2026-02-21', searches: 956, matches: 278, messages: 45, transactions: 8 },
  { date: '2026-02-20', searches: 1100, matches: 312, messages: 67, transactions: 15 },
  { date: '2026-02-19', searches: 743, matches: 198, messages: 34, transactions: 6 },
];

const AgentsConsolePage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'keys' | 'usage' | 'org'>('keys');
  const [keys, setKeys] = useState<ApiKey[]>(MOCK_KEYS);
  const [newKeyName, setNewKeyName] = useState('');

  const cardStyle: React.CSSProperties = {
    border: '1px solid var(--glass-border)',
    borderRadius: '16px',
    padding: '1.75rem',
    background: 'var(--glass-bg)',
  };

  const tabBtn = (id: typeof tab, label: string) => (
    <button
      onClick={() => setTab(id)}
      className={`text-sm uppercase tracking-widest font-medium transition-colors px-1 pb-2 ${
        tab === id ? 'text-foreground border-b-2 border-foreground' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {label}
    </button>
  );

  const handleCreateKey = () => {
    if (!newKeyName.trim()) { toast.error('Enter a key name'); return; }
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `tm_live_${Math.random().toString(36).slice(2, 18)}`,
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
      status: 'active',
    };
    setKeys([newKey, ...keys]);
    setNewKeyName('');
    toast.success(`API key "${newKeyName}" created`);
  };

  const handleRevoke = (id: string) => {
    setKeys(keys.map(k => k.id === id ? { ...k, status: 'revoked' as const } : k));
    toast.success('Key revoked');
  };

  return (
    <PageLayout activePage="agents">
      <div className="max-w-4xl mx-auto w-full space-y-6 py-6">
        <div>
          <button onClick={() => navigate('/agents')} className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            ← Back to Overview
          </button>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">Console</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage API keys, monitor usage, and configure your organization.</p>
        </div>

        <div className="flex gap-6 border-b border-foreground/10">
          {tabBtn('keys', 'API Keys')}
          {tabBtn('usage', 'Usage')}
          {tabBtn('org', 'Organization')}
        </div>

        {tab === 'keys' && (
          <div className="space-y-4 animate-fade-in">
            {/* Create new key */}
            <div style={cardStyle} className="flex items-end gap-3">
              <div className="flex-1 space-y-1">
                <label className="text-xs text-muted-foreground">New API Key</label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Key name (e.g. Production)"
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-transparent border border-foreground/10 focus:border-foreground/30 outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateKey()}
                />
              </div>
              <button onClick={handleCreateKey} className="btn-twin btn-twin-primary py-2.5 px-4 text-sm shrink-0">
                Create Key
              </button>
            </div>

            {/* Key list */}
            {keys.map((k) => (
              <div key={k.id} style={cardStyle} className="flex items-center justify-between">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{k.name}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${k.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-400'}`}>
                      {k.status}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground truncate">{k.key}…</p>
                  <p className="text-xs text-muted-foreground/50">Created {k.created} · Last used {k.lastUsed}</p>
                </div>
                {k.status === 'active' && (
                  <button onClick={() => handleRevoke(k.id)} className="btn-twin btn-twin-ghost py-1.5 px-3 text-xs text-destructive shrink-0">
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'usage' && (
          <div className="space-y-4 animate-fade-in">
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Total Searches', value: MOCK_USAGE.reduce((s, d) => s + d.searches, 0).toLocaleString() },
                { label: 'Total Matches', value: MOCK_USAGE.reduce((s, d) => s + d.matches, 0).toLocaleString() },
                { label: 'Messages Sent', value: MOCK_USAGE.reduce((s, d) => s + d.messages, 0).toLocaleString() },
                { label: 'Transactions', value: MOCK_USAGE.reduce((s, d) => s + d.transactions, 0).toLocaleString() },
              ].map((stat) => (
                <div key={stat.label} style={cardStyle} className="text-center">
                  <p className="text-xl font-heading font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Daily breakdown */}
            <div style={cardStyle}>
              <p className="text-sm font-medium mb-3">Daily Breakdown</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-foreground/10 text-muted-foreground">
                      <th className="text-left py-2 font-medium">Date</th>
                      <th className="text-right py-2 font-medium">Searches</th>
                      <th className="text-right py-2 font-medium">Matches</th>
                      <th className="text-right py-2 font-medium">Messages</th>
                      <th className="text-right py-2 font-medium">Txns</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_USAGE.map((d) => (
                      <tr key={d.date} className="border-b border-foreground/5 text-muted-foreground">
                        <td className="py-2 font-mono text-xs">{d.date}</td>
                        <td className="py-2 text-right">{d.searches.toLocaleString()}</td>
                        <td className="py-2 text-right">{d.matches.toLocaleString()}</td>
                        <td className="py-2 text-right">{d.messages}</td>
                        <td className="py-2 text-right">{d.transactions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Billing */}
            <div style={cardStyle} className="space-y-2">
              <p className="text-sm font-medium">Current Period Estimate</p>
              <p className="text-2xl font-heading font-bold">$47.50</p>
              <p className="text-xs text-muted-foreground">Feb 1 – Feb 28, 2026 · Pro plan</p>
            </div>
          </div>
        )}

        {tab === 'org' && (
          <div className="space-y-4 animate-fade-in">
            <div style={cardStyle} className="space-y-4">
              <p className="text-sm uppercase tracking-widest text-muted-foreground/60 font-heading">Organization</p>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Organization Name</label>
                  <input
                    type="text"
                    defaultValue="Acme Research Lab"
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-transparent border border-foreground/10 focus:border-foreground/30 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Contact Email</label>
                  <input
                    type="email"
                    defaultValue="agent-ops@acme.com"
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-transparent border border-foreground/10 focus:border-foreground/30 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Webhook URL</label>
                  <input
                    type="url"
                    defaultValue="https://api.acme.com/webhooks/twin3"
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-transparent border border-foreground/10 focus:border-foreground/30 outline-none"
                  />
                </div>
              </div>
              <button onClick={() => toast.success('Settings saved')} className="btn-twin btn-twin-primary py-2.5 px-6 text-sm">
                Save Changes
              </button>
            </div>

            <div style={cardStyle} className="space-y-3">
              <p className="text-sm uppercase tracking-widest text-muted-foreground/60 font-heading">Team Members</p>
              <div className="space-y-2">
                {[
                  { name: 'Alice Chen', role: 'Admin', email: 'alice@acme.com' },
                  { name: 'Bob Park', role: 'Developer', email: 'bob@acme.com' },
                ].map((m) => (
                  <div key={m.email} className="flex items-center justify-between py-2 border-b border-foreground/5 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.email}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{m.role}</span>
                  </div>
                ))}
              </div>
              <button className="btn-twin btn-twin-ghost py-2 px-4 text-xs">+ Invite Member</button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default AgentsConsolePage;
