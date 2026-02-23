import { Lock } from 'lucide-react';

const COMPLETED_TASKS = [
  {
    id: '1',
    title: 'Adidas Training Lab 7-day Training Feedback for Ultraboost',
    agentLabel: 'Handling Agent',
    agentName: '5',
    agentAddress: '0xB6f2...9750',
    scopes: ['physical', 'digital'],
    createdAt: '2/18/2026, 11:38:19 PM',
    completedAt: '2/18/2026, 11:38:39 PM',
    txHash: '0xf3a80e65...8a79a501',
    reward: '0.8 USDT',
  },
  {
    id: '2',
    title: 'HOKA Performance Field Test: Trail Cushion Feedback (2 weeks)',
    agentLabel: 'Handling Agent',
    agentName: 'mysportagent',
    agentAddress: '0xc934...762a',
    scopes: ['social', 'spiritual'],
    createdAt: '2/18/2026, 10:59:58 PM',
    completedAt: '2/18/2026, 11:00:31 PM',
    txHash: '0xe2a01d11...4812019b',
    reward: '0.9 USDT',
  },
];

const cardStyle: React.CSSProperties = {
  border: '1px solid var(--glass-border)',
  borderRadius: '16px',
  padding: '1.75rem',
  background: 'var(--glass-bg)',
};

export const MissionsPage = () => {
  const ongoingCount = 0;
  const completedCount = COMPLETED_TASKS.length;
  const expiredCount = 0;
  const totalInflow = COMPLETED_TASKS.reduce((sum, t) => sum + parseFloat(t.reward), 0).toFixed(1);

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <span className="text-muted-foreground">Ongoing Tasks <span className="font-semibold text-foreground">{ongoingCount}</span></span>
        <span className="text-muted-foreground/30">·</span>
        <span className="text-muted-foreground">Completed <span className="font-semibold text-foreground">{completedCount}</span></span>
        <span className="text-muted-foreground/30">·</span>
        <span className="text-muted-foreground">Expired / Declined <span className="font-semibold text-foreground">{expiredCount}</span></span>
        <span className="text-muted-foreground/30">·</span>
        <span className="text-muted-foreground">Inflow <span className="font-semibold text-foreground">{totalInflow} USDT</span></span>
      </div>

      {/* Ongoing Tasks */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest">Ongoing Tasks</h3>
          <p className="text-sm text-muted-foreground mt-1">Accepted tasks in progress, with usage-based quota tracking.</p>
        </div>
        <p className="text-sm text-muted-foreground/50 py-2">None</p>
      </div>

      {/* Completed Records */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest">Completed Records</h3>
          <p className="text-sm text-muted-foreground mt-1">Finished tasks with usage result and earned reward.</p>
        </div>

        {COMPLETED_TASKS.map((task) => (
          <div key={task.id} style={cardStyle} className="space-y-1">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium">{task.title}</p>
                <p className="text-xs text-muted-foreground">
                  {task.agentLabel} {task.agentName} · <span className="font-mono">{task.agentAddress}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Scope used: {task.scopes.map((s, i) => (
                    <span key={s}><code className="font-mono font-semibold text-foreground/70">{s}</code>{i < task.scopes.length - 1 ? ', ' : ''}</span>
                  ))}
                </p>
              </div>
              <div className="shrink-0 text-right space-y-1">
                <p className="text-sm font-semibold">{task.reward}</p>
                <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-[hsla(164,60%,40%,0.15)] text-[hsl(164,60%,50%)]">Completed</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
              <span>Created At: {task.createdAt}</span>
              <span>Completed At: {task.completedAt}</span>
              <span>USDT Transfer Tx: <span className="font-mono font-semibold text-foreground/70">{task.txHash}</span></span>
            </div>
          </div>
        ))}
      </div>

      {/* Expired / Declined */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest">Expired / Declined</h3>
          <p className="text-sm text-muted-foreground mt-1">Ended tasks that need renewal or action in Telegram.</p>
        </div>
        <p className="text-sm text-muted-foreground/50 py-2">None</p>
      </div>
    </div>
  );
};
