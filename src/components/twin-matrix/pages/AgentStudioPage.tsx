import { useMemo, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { permissionMaskToGrantedQuadrants, type OnchainBoundAgent } from '@/lib/contracts/twin-matrix-sbt';

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
    const scaled10 = (balanceRaw * 10n + base / 2n) / base; // round to 1 decimal
    const whole = scaled10 / 10n;
    const decimal = scaled10 % 10n;
    return `${whole.toLocaleString()}.${decimal.toString()} USDT`;
  };

  const formatAddressPreview = (address: string): string => `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className="animate-fade-in h-full overflow-y-auto scrollbar-hide">
      <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">{t('agentStudio.title')}</h2>
          <p className="text-muted-foreground text-sm">{t('agentStudio.subtitle')}</p>
        </div>

        <ThinDivider />

        <div className="flex items-center gap-3">
          <button onClick={onCreateAgent}
            className="text-xs px-4 py-2 border border-foreground/10 rounded-lg text-foreground/80 hover:bg-foreground/5 hover:text-foreground transition-colors">
            {t('agentStudio.newAgent')}
          </button>
          <button
            onClick={() => {
              if (studioAgents.length === 0) return;
              setIsChoosingEditTarget(true);
            }}
            className="text-xs px-4 py-2 border border-foreground/10 rounded-lg text-muted-foreground hover:bg-foreground/5 hover:text-foreground transition-colors">
            {t('agentStudio.editAgent')}
          </button>
        </div>

        {isChoosingEditTarget && (
          <>
            <ThinDivider />
            <div className="space-y-3 animate-fade-in">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">{t('agentStudio.selectToEdit')}</p>
              <div className="space-y-2">
                {studioAgents.map((agent) => (
                  <button
                    key={`edit-target-${agent.id}`}
                    onClick={() => {
                      setIsChoosingEditTarget(false);
                      onEditAgent(agent.address);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg border border-foreground/10 hover:bg-foreground/[0.03] transition-colors"
                  >
                    <p className="text-sm text-foreground/80">{agent.name}</p>
                    <p className="text-[10px] text-muted-foreground/60 font-mono">{formatAddressPreview(agent.address)}</p>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setIsChoosingEditTarget(false)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('agentStudio.cancel')}
              </button>
            </div>
          </>
        )}

        <ThinDivider />

        <div className="space-y-0">
          {studioAgents.length === 0 && (
            <p className="text-sm text-muted-foreground">{t('agentStudio.noBoundAgents')}</p>
          )}
          {studioAgents.map((agent, idx) => (
            <div key={agent.id}>
              <div
                className={`px-5 py-5 space-y-3 cursor-pointer transition-colors ${selectedAgent === agent.id ? 'bg-foreground/[0.02]' : ''}`}
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
                        {t('onchain.tokenId')}: {agent.tokenId !== null ? agent.tokenId.toString() : '-'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium" style={{ color: statusColor[agent.status] }}>
                    {agent.status === 'active' ? t('records.active') : t('agentStudio.draft')}
                  </span>
                </div>

                <div className="flex items-center gap-6 text-xs text-muted-foreground/60">
                  <span>
                    {t('agentStudio.usdtBalance')} <span className="text-foreground/70">{formatUsdtBalance(agent.usdtBalanceWei, agent.usdtDecimals)}</span>
                  </span>
                  <span>
                    {t('agentStudio.agentWallet')} <span className="text-foreground/70 font-mono">{formatAddressPreview(agent.address)}</span>
                  </span>
                </div>

                {selectedAgent === agent.id && (
                  <div className="pt-2 space-y-3 animate-fade-in">
                    <div className="space-y-1 text-xs text-muted-foreground/60">
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
                      <button onClick={(e) => { e.stopPropagation(); onEditAgent(agent.address); }}
                        className="text-[11px] text-foreground/70 hover:text-foreground transition-colors">
                        {t('agentStudio.configure')}
                      </button>
                      {agent.status === 'draft' && (
                        <button onClick={(e) => { e.stopPropagation(); onEditAgent(agent.address); }}
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
