import { useMemo, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { permissionMaskToGrantedQuadrants, type OnchainBoundAgent } from '@/lib/contracts/twin-matrix-sbt';

const cardStyle: React.CSSProperties = {
  border: '1px solid var(--glass-border)',
  borderRadius: '16px',
  padding: '1.75rem',
  background: 'var(--glass-bg)',
};

const handleCardEnter = (e: React.MouseEvent<HTMLDivElement>) => {
  e.currentTarget.style.borderColor = 'hsl(var(--foreground) / 0.2)';
  e.currentTarget.style.background = 'hsl(var(--foreground) / 0.04)';
};
const handleCardLeave = (e: React.MouseEvent<HTMLDivElement>) => {
  e.currentTarget.style.borderColor = '';
  e.currentTarget.style.background = 'var(--glass-bg)';
};

const statusColor: Record<string, string> = {
  active: 'rgba(10, 255, 255, 0.8)',
  draft: 'hsl(var(--foreground) / 0.3)',
};

interface Props {
  boundAgents: OnchainBoundAgent[];
  onCreateAgent: () => void;
  onEditAgent: (agentAddress?: string) => void;
}

export const AgentStudioPage = ({ boundAgents, onCreateAgent, onEditAgent }: Props) => {
  const { t } = useI18n();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [isChoosingEditTarget, setIsChoosingEditTarget] = useState(false);

  const studioAgents = useMemo(() => (
    boundAgents.map((agent) => ({
      id: agent.address,
      name: agent.name,
      tokenId: agent.tokenId,
      address: agent.address,
      permissionExpiry: agent.permissionExpiry,
      usdtBalanceWei: agent.usdtBalanceWei,
      usdtDecimals: agent.usdtDecimals,
      scopeGranted: permissionMaskToGrantedQuadrants(agent.permissionMask),
      status: agent.active ? 'active' : 'draft' as const,
      connectedChannels: [t('agentStudio.channelTelegram')],
      taskTypes: [t('agentStudio.taskSignalMatching'), t('agentStudio.taskBrandOffers')],
    }))
  ), [boundAgents, t]);

  const formatExpiry = (expiry: bigint): string => {
    if (expiry === 0n) return t('onchain.none');
    return new Date(Number(expiry) * 1000).toLocaleString();
  };

  const formatUsdtBalance = (balanceRaw: bigint | null, decimals: number): string => {
    if (decimals < 0) return '-';
    if (decimals > 30) return '-';
    if (balanceRaw === null) return '-';
    const base = 10n ** BigInt(decimals);
    const scaled10 = (balanceRaw * 10n + base / 2n) / base;
    const whole = scaled10 / 10n;
    const decimal = scaled10 % 10n;
    return `${whole.toLocaleString()}.${decimal.toString()} USDT`;
  };

  const formatAddressPreview = (address: string): string => `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className="animate-fade-in h-full overflow-y-auto scrollbar-hide">
      <div className="max-w-3xl mx-auto px-6 md:px-12 py-8 space-y-8">
        {/* Page header */}
        <div>
          <p className="text-base uppercase tracking-[0.25em] text-muted-foreground font-heading mb-3">
            {t('agentStudio.subtitle')}
          </p>
          <h2 className="font-heading font-extrabold uppercase leading-tight tracking-tight text-foreground" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}>
            {t('agentStudio.title')}
          </h2>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button onClick={onCreateAgent}
            className="py-3 px-6 rounded-xl text-sm font-semibold bg-foreground text-background hover:bg-foreground/90 transition-colors">
            {t('agentStudio.newAgent')}
          </button>
          <button
            onClick={() => {
              if (studioAgents.length === 0) return;
              setIsChoosingEditTarget(true);
            }}
            className="py-3 px-6 rounded-xl text-sm font-semibold border border-foreground/15 text-muted-foreground hover:bg-foreground/5 hover:text-foreground transition-colors">
            {t('agentStudio.editAgent')}
          </button>
        </div>

        {/* Edit target selection */}
        {isChoosingEditTarget && (
          <div
            className="space-y-3 animate-fade-in transition-all duration-300"
            style={cardStyle}
            onMouseEnter={handleCardEnter}
            onMouseLeave={handleCardLeave}
          >
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground font-heading">{t('agentStudio.selectToEdit')}</p>
            <div className="space-y-2">
              {studioAgents.map((agent) => (
                <button
                  key={`edit-target-${agent.id}`}
                  onClick={() => {
                    setIsChoosingEditTarget(false);
                    onEditAgent(agent.address);
                  }}
                  className="w-full text-left px-4 py-3 rounded-xl border border-foreground/10 hover:bg-foreground/[0.04] hover:border-foreground/20 transition-all"
                >
                  <p className="text-base text-foreground/80">{agent.name}</p>
                  <p className="text-xs text-muted-foreground/60 font-mono mt-0.5">{formatAddressPreview(agent.address)}</p>
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsChoosingEditTarget(false)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('agentStudio.cancel')}
            </button>
          </div>
        )}

        {/* Agent list */}
        <div className="space-y-4">
          {studioAgents.length === 0 && (
            <div
              className="transition-all duration-300"
              style={cardStyle}
              onMouseEnter={handleCardEnter}
              onMouseLeave={handleCardLeave}
            >
              <p className="text-base text-muted-foreground">{t('agentStudio.noBoundAgents')}</p>
            </div>
          )}
          {studioAgents.map((agent) => (
            <div
              key={agent.id}
              className="cursor-pointer transition-all duration-300"
              style={cardStyle}
              onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
              onMouseEnter={handleCardEnter}
              onMouseLeave={handleCardLeave}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{
                      background: agent.status === 'active' ? '#0AFFFF' : 'rgba(255,255,255,0.2)',
                      boxShadow: agent.status === 'active' ? '0 0 6px rgba(10,255,255,0.4)' : 'none',
                    }} />
                  <div>
                    <p className="font-semibold text-base">{agent.name}</p>
                    <p className="text-xs text-muted-foreground/50 mt-0.5">
                      {t('agentStudio.verifiedAgent')}
                      {' · '}
                      {t('onchain.tokenId')}: {agent.tokenId !== null ? agent.tokenId.toString() : '-'}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium" style={{ color: statusColor[agent.status] }}>
                  {agent.status === 'active' ? t('records.active') : t('agentStudio.draft')}
                </span>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground/60 mt-4">
                <span>
                  {t('agentStudio.usdtBalance')} <span className="text-foreground/70">{formatUsdtBalance(agent.usdtBalanceWei, agent.usdtDecimals)}</span>
                </span>
                <span>
                  {t('agentStudio.agentWallet')} <span className="text-foreground/70 font-mono">{formatAddressPreview(agent.address)}</span>
                </span>
              </div>

              {selectedAgent === agent.id && (
                <div className="pt-4 space-y-4 animate-fade-in">
                  <div className="w-full h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />
                  
                  <div className="space-y-1.5 text-sm text-muted-foreground/60">
                    <p>
                      {t('agentStudio.agentAddress')}{' '}
                      <span className="text-foreground/70 font-mono break-all">{agent.address}</span>
                    </p>
                    <p>
                      {t('onchain.scopeGranted')}{' '}
                      <span className="text-foreground/70">
                        {agent.scopeGranted.length > 0 ? agent.scopeGranted.join(', ') : t('onchain.none')}
                      </span>
                    </p>
                    <p>
                      {t('agentStudio.expiryPermission')}{' '}
                      <span className="text-foreground/70">{formatExpiry(agent.permissionExpiry)}</span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-heading">{t('agentStudio.taskTypes')}</p>
                    <div className="flex gap-2">
                      {agent.taskTypes.map(tt => (
                        <span key={tt} className="text-xs font-mono px-3 py-1 rounded-full"
                          style={{ background: 'rgba(10,255,255,0.08)', color: 'rgba(10,255,255,0.7)' }}>
                          {tt}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-heading">{t('agentStudio.channels')}</p>
                    <div className="flex gap-2">
                      {agent.connectedChannels.length > 0 ? (
                        agent.connectedChannels.map(c => (
                          <span key={c} className="text-sm text-foreground/60">{c}</span>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground/40">{t('agentStudio.noChannels')}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={(e) => { e.stopPropagation(); onEditAgent(agent.address); }}
                      className="text-sm text-foreground/70 hover:text-foreground transition-colors">
                      {t('agentStudio.configure')}
                    </button>
                    {agent.status === 'draft' && (
                      <button onClick={(e) => { e.stopPropagation(); onEditAgent(agent.address); }}
                        className="text-sm text-foreground/70 hover:text-foreground transition-colors">
                        {t('agentStudio.continueSetup')}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
