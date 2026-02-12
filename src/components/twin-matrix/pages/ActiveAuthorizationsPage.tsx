const DEMO_AUTHORIZATIONS = [
  {
    id: '1',
    agent: 'Nike Running Agent',
    scope: 'Sport Only',
    remaining: 12,
    total: 15,
    expiresAt: '2025-03-15',
    status: 'active' as const,
  },
  {
    id: '2',
    agent: 'Adidas Brand Hub',
    scope: 'Full Identity',
    remaining: 0,
    total: 5,
    expiresAt: '2025-02-01',
    status: 'consumed' as const,
  },
  {
    id: '3',
    agent: 'Health Analytics',
    scope: 'Core + Soul',
    remaining: 3,
    total: 10,
    expiresAt: '2024-12-31',
    status: 'expired' as const,
  },
];

const statusColors: Record<string, string> = {
  active: 'text-green-400',
  consumed: 'text-muted-foreground/50',
  expired: 'text-red-400/70',
};

const statusLabels: Record<string, string> = {
  active: '● Active',
  consumed: '○ Consumed',
  expired: '✕ Expired',
};

export const ActiveAuthorizationsPage = () => {
  return (
    <div className="animate-fade-in space-y-6 max-w-lg mx-auto">
      <div>
        <h2 className="text-2xl font-bold mb-1">Issued Tokens</h2>
        <p className="text-muted-foreground text-sm">All scoped access tokens</p>
      </div>

      <div className="space-y-3">
        {DEMO_AUTHORIZATIONS.map(auth => (
          <div key={auth.id} className="glass-card space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-sm">{auth.agent}</p>
                <p className={`text-[11px] ${statusColors[auth.status]}`}>{statusLabels[auth.status]}</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-foreground/5 text-muted-foreground">{auth.scope}</span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Remaining</span>
                <span className="text-foreground/80">{auth.remaining} / {auth.total}</span>
              </div>
              <div className="h-1 bg-foreground/5 rounded-full overflow-hidden">
                <div className="h-full bg-foreground/30 rounded-full" style={{ width: `${(auth.remaining / auth.total) * 100}%` }} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expires</span>
                <span className="text-foreground/80">{auth.expiresAt}</span>
              </div>
            </div>

            {auth.status === 'active' && (
              <div className="flex gap-2 pt-1">
                <button className="btn-twin btn-twin-ghost flex-1 py-2 text-xs">View Details</button>
                <button className="btn-twin btn-twin-ghost flex-1 py-2 text-xs text-red-400/70 hover:text-red-400">Revoke</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
