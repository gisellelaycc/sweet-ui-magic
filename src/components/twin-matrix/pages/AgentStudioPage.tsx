import { useMemo, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import type { OnchainBoundAgent } from '@/lib/contracts/twin-matrix-sbt';

const statusColor: Record<string, string> = {
  active: 'rgba(10, 255, 255, 0.8)',
  draft: 'rgba(255, 255, 255, 0.3)',
};

const ThinDivider = () => (
  <div className="w-full h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />
);

interface Props {
  boundAgents: OnchainBoundAgent[];
  onCreateAgent: () => void;
  onEditAgent: () => void;
}

export const AgentStudioPage = ({ boundAgents, onCreateAgent, onEditAgent }: Props) => {
  const { t } = useI18n();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const studioAgents = useMemo(() => (
    boundAgents.map((agent, index) => ({
      id: agent.address,
      name: agent.name,
      tokenId: agent.tokenId,
      scopeGranted: agent.scopeGranted,
      status: agent.active ? 'active' : 'draft' as const,
      connectedChannels: ['Telegram'],
      taskTypes: ['Signal Matching', 'Brand Offers'],
      createdAt: `2026-02-${String(10 + (index % 10)).padStart(2, '0')}`,
      tasksCompleted: 3 + (index % 9),
      earnings: `${15 + index * 8} USDT`,
    }))
  ), [boundAgents]);

  const activeCount = studioAgents.filter(a => a.status === 'active').length;
  const draftCount = studioAgents.filter(a => a.status === 'draft').length;
  const totalEarnings = `${studioAgents.reduce((sum, agent) => sum + Number(agent.earnings.split(' ')[0]), 0)} USDT`;

  return (
    <div className="animate-fade-in h-full overflow-y-auto scrollbar-hide">
      <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">{t('agentStudio.title')}</h2>
          <p className="text-muted-foreground text-sm">{t('agentStudio.subtitle')}</p>
        </div>

        <ThinDivider />

        <div className="flex items-center gap-6 text-xs text-muted-foreground/70">
          <span>
            <span style={{ color: 'rgba(10, 255, 255, 0.8)' }}>{t('agentStudio.active')}</span>{' '}
            <span className="text-foreground/80">{activeCount}</span>
          </span>
          <span>·</span>
          <span>
            {t('agentStudio.drafts')}{' '}
            <span className="text-foreground/80">{draftCount}</span>
          </span>
          <span>·</span>
          <span>
            {t('agentStudio.totalEarnings')}{' '}
            <span className="text-foreground/80">{totalEarnings}</span>
          </span>
        </div>

        <ThinDivider />

        <div className="flex items-center gap-3">
          <button onClick={onCreateAgent}
            className="text-xs px-4 py-2 border border-foreground/10 rounded-lg text-foreground/80 hover:bg-foreground/5 hover:text-foreground transition-colors">
            {t('agentStudio.newAgent')}
          </button>
          <button onClick={onEditAgent}
            className="text-xs px-4 py-2 border border-foreground/10 rounded-lg text-muted-foreground hover:bg-foreground/5 hover:text-foreground transition-colors">
            {t('agentStudio.editAgent')}
          </button>
        </div>

        <ThinDivider />

        <div className="space-y-0">
          {studioAgents.length === 0 && (
            <p className="text-sm text-muted-foreground">No bound agents found on-chain yet.</p>
          )}
          {studioAgents.map((agent, idx) => (
            <div key={agent.id}>
              <div
                className={`py-5 space-y-3 cursor-pointer transition-colors ${selectedAgent === agent.id ? 'bg-foreground/[0.02]' : ''}`}
                onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{
                        background: agent.status === 'active' ? '#0AFFFF' : 'rgba(255,255,255,0.2)',
                        boxShadow: agent.status === 'active' ? '0 0 6px rgba(10,255,255,0.4)' : 'none',
                      }} />
                    <div>
                      <p className="font-semibold text-sm">{agent.name}</p>
                      <p className="text-[10px] text-muted-foreground/50">
                        {t('agentStudio.verifiedAgent')}
                        {' · '}
                        tokenId: {agent.tokenId !== null ? agent.tokenId.toString() : '-'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium" style={{ color: statusColor[agent.status] }}>
                    {agent.status === 'active' ? t('records.active') : 'Draft'}
                  </span>
                </div>

                <div className="flex items-center gap-6 text-xs text-muted-foreground/60">
                  <span>
                    Scope Granted{' '}
                    <span className="text-foreground/70">
                      {agent.scopeGranted.length > 0 ? agent.scopeGranted.join(', ') : 'None'}
                    </span>
                  </span>
                  <span>{t('agentStudio.tasks')} <span className="text-foreground/70">{agent.tasksCompleted}</span></span>
                  <span>{t('agentStudio.earned')} <span className="text-foreground/70">{agent.earnings}</span></span>
                  <span>{t('agentStudio.created')} <span className="text-foreground/70">{agent.createdAt}</span></span>
                </div>

                {selectedAgent === agent.id && (
                  <div className="pt-2 space-y-3 animate-fade-in">
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{t('agentStudio.taskTypes')}</p>
                      <div className="flex gap-2">
                        {agent.taskTypes.map(tt => (
                          <span key={tt} className="text-[10px] font-mono px-2.5 py-1 rounded-full"
                            style={{ background: 'rgba(10,255,255,0.08)', color: 'rgba(10,255,255,0.7)' }}>
                            {tt}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{t('agentStudio.channels')}</p>
                      <div className="flex gap-2">
                        {agent.connectedChannels.length > 0 ? (
                          agent.connectedChannels.map(c => (
                            <span key={c} className="text-xs text-foreground/60">{c}</span>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground/40">{t('agentStudio.noChannels')}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3 pt-1">
                      <button onClick={(e) => { e.stopPropagation(); onEditAgent(); }}
                        className="text-[11px] text-foreground/70 hover:text-foreground transition-colors">
                        {t('agentStudio.configure')}
                      </button>
                      {agent.status === 'active' && (
                        <button onClick={(e) => e.stopPropagation()}
                          className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                          {t('agentStudio.pause')}
                        </button>
                      )}
                      {agent.status === 'draft' && (
                        <button onClick={(e) => { e.stopPropagation(); onEditAgent(); }}
                          className="text-[11px] text-foreground/70 hover:text-foreground transition-colors">
                          {t('agentStudio.continueSetup')}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {idx < studioAgents.length - 1 && <ThinDivider />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
