import { useState } from 'react';

const DEMO_AGENTS = [
  {
    id: 'agent-001',
    name: 'OpenClaw Agent #01',
    agentId: 'openclaw-0x3a',
    status: 'active' as const,
    connectedChannels: ['Telegram'],
    taskTypes: ['Signal Matching', 'Brand Offers'],
    createdAt: '2026-02-10',
    tasksCompleted: 14,
    earnings: '120 USDT',
  },
  {
    id: 'agent-002',
    name: 'Telegram Bot Alpha',
    agentId: 'tg-bot-0xf1',
    status: 'active' as const,
    connectedChannels: ['Telegram'],
    taskTypes: ['Auto-respond', 'Data Sync'],
    createdAt: '2026-02-12',
    tasksCompleted: 7,
    earnings: '45 USDT',
  },
  {
    id: 'agent-003',
    name: 'Research Bot',
    agentId: 'research-0x82',
    status: 'draft' as const,
    connectedChannels: [],
    taskTypes: ['Survey', 'Feedback'],
    createdAt: '2026-02-14',
    tasksCompleted: 0,
    earnings: '0 USDT',
  },
];

const statusColor: Record<string, string> = {
  active: 'rgba(10, 255, 255, 0.8)',
  draft: 'rgba(255, 255, 255, 0.3)',
};

const ThinDivider = () => (
  <div className="w-full h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />
);

interface Props {
  onCreateAgent: () => void;
  onEditAgent: () => void;
}

export const AgentStudioPage = ({ onCreateAgent, onEditAgent }: Props) => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const activeCount = DEMO_AGENTS.filter(a => a.status === 'active').length;
  const draftCount = DEMO_AGENTS.filter(a => a.status === 'draft').length;
  const totalEarnings = '165 USDT';

  return (
    <div className="animate-fade-in h-full overflow-y-auto scrollbar-hide">
      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold mb-1">Agent Studio</h2>
          <p className="text-muted-foreground text-sm">Create, manage, and monitor your agents.</p>
        </div>

        <ThinDivider />

        {/* Stats */}
        <div className="flex items-center gap-6 text-xs text-muted-foreground/70">
          <span>
            <span style={{ color: 'rgba(10, 255, 255, 0.8)' }}>Active:</span>{' '}
            <span className="text-foreground/80">{activeCount}</span>
          </span>
          <span>·</span>
          <span>
            Drafts:{' '}
            <span className="text-foreground/80">{draftCount}</span>
          </span>
          <span>·</span>
          <span>
            Total Earnings:{' '}
            <span className="text-foreground/80">{totalEarnings}</span>
          </span>
        </div>

        <ThinDivider />

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onCreateAgent}
            className="text-xs px-4 py-2 border border-foreground/10 rounded-lg text-foreground/80 hover:bg-foreground/5 hover:text-foreground transition-colors"
          >
            + New Agent
          </button>
          <button
            onClick={onEditAgent}
            className="text-xs px-4 py-2 border border-foreground/10 rounded-lg text-muted-foreground hover:bg-foreground/5 hover:text-foreground transition-colors"
          >
            Edit Agent
          </button>
        </div>

        <ThinDivider />

        {/* Agent List */}
        <div className="space-y-0">
          {DEMO_AGENTS.map((agent, idx) => (
            <div key={agent.id}>
              <div
                className={`py-5 space-y-3 cursor-pointer transition-colors ${
                  selectedAgent === agent.id ? 'bg-foreground/[0.02]' : ''
                }`}
                onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
              >
                {/* Top row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{
                        background: agent.status === 'active' ? '#0AFFFF' : 'rgba(255,255,255,0.2)',
                        boxShadow: agent.status === 'active' ? '0 0 6px rgba(10,255,255,0.4)' : 'none',
                      }}
                    />
                    <div>
                      <p className="font-semibold text-sm">{agent.name}</p>
                      <p className="text-[10px] text-muted-foreground/50">Verified Agent · {agent.agentId}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium" style={{ color: statusColor[agent.status] }}>
                    {agent.status === 'active' ? 'Active' : 'Draft'}
                  </span>
                </div>

                {/* Details row */}
                <div className="flex items-center gap-6 text-xs text-muted-foreground/60">
                  <span>Tasks: <span className="text-foreground/70">{agent.tasksCompleted}</span></span>
                  <span>Earned: <span className="text-foreground/70">{agent.earnings}</span></span>
                  <span>Created: <span className="text-foreground/70">{agent.createdAt}</span></span>
                </div>

                {/* Expanded details */}
                {selectedAgent === agent.id && (
                  <div className="pt-2 space-y-3 animate-fade-in">
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Task Types</p>
                      <div className="flex gap-2">
                        {agent.taskTypes.map(t => (
                          <span
                            key={t}
                            className="text-[10px] font-mono px-2.5 py-1 rounded-full"
                            style={{ background: 'rgba(10,255,255,0.08)', color: 'rgba(10,255,255,0.7)' }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Channels</p>
                      <div className="flex gap-2">
                        {agent.connectedChannels.length > 0 ? (
                          agent.connectedChannels.map(c => (
                            <span key={c} className="text-xs text-foreground/60">{c}</span>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground/40">No channels connected</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); onEditAgent(); }}
                        className="text-[11px] text-foreground/70 hover:text-foreground transition-colors"
                      >
                        Configure
                      </button>
                      {agent.status === 'active' && (
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                        >
                          Pause
                        </button>
                      )}
                      {agent.status === 'draft' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onEditAgent(); }}
                          className="text-[11px] text-foreground/70 hover:text-foreground transition-colors"
                        >
                          Continue Setup
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {idx < DEMO_AGENTS.length - 1 && <ThinDivider />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
