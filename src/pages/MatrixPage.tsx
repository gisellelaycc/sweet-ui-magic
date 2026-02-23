import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTwinMatrix } from '@/contexts/TwinMatrixContext';
import { useI18n } from '@/lib/i18n';
import { PageLayout } from '@/components/twin-matrix/PageLayout';
import { OnchainIdentityStatePage } from '@/components/twin-matrix/pages/OnchainIdentityStatePage';
import { SignalRecordsPage } from '@/components/twin-matrix/pages/SignalRecordsPage';

type MatrixTab = 'matrix' | 'agents' | 'listing' | 'opportunities';

const MatrixPage = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const {
    isConnected,
    openConnectModal,
    isContractConfigured,
    isCheckingToken,
    contractError,
    tokenId,
    hasMintedSbt,
    latestVersion,
    versions,
    boundAgents,
    refreshOnchainState,
    setState,
    setNeedsMatrixUpdate,
    walletAddress,
  } = useTwinMatrix();

  const [tab, setTab] = useState<MatrixTab>('matrix');

  const cardStyle: React.CSSProperties = {
    border: '1px solid var(--glass-border)',
    borderRadius: '16px',
    padding: '1.75rem',
    background: 'var(--glass-bg)',
  };

  const tabBtn = (id: MatrixTab, label: string) => (
    <button
      key={id}
      onClick={() => setTab(id)}
      className={`text-sm uppercase tracking-widest font-medium transition-colors px-1 pb-2 ${
        tab === id ? 'text-foreground border-b-2 border-foreground' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {label}
    </button>
  );

  // Not connected — prompt to connect
  if (!isConnected) {
    return (
      <PageLayout activePage="identity">
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md text-center space-y-6" style={cardStyle}>
            <h2 className="text-xl font-heading font-bold">Connect Wallet</h2>
            <p className="text-muted-foreground text-sm">Connect your wallet to view your Twin Matrix identity.</p>
            <button onClick={() => openConnectModal?.()} className="btn-twin btn-twin-primary py-4 px-8 w-full">
              Connect Wallet
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Connected but no SBT — redirect to mint
  if (!isCheckingToken && !contractError && !hasMintedSbt) {
    return (
      <PageLayout activePage="identity">
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md text-center space-y-6" style={cardStyle}>
            <h2 className="text-xl font-heading font-bold">No Identity Found</h2>
            <p className="text-muted-foreground text-sm">You haven't created your Twin Matrix yet. Start by verifying your humanity.</p>
            <button onClick={() => navigate('/verify')} className="btn-twin btn-twin-primary py-4 px-8 w-full">
              Create Identity
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout activePage="identity">
      <div className="max-w-6xl mx-auto w-full space-y-6 py-4">
        {!isContractConfigured && (
          <div className="mb-3 transition-all duration-300" style={{ border: '1px solid rgba(250, 204, 21, 0.3)', borderRadius: '16px', padding: '1.25rem 1.75rem', background: 'rgba(250, 204, 21, 0.06)' }}>
            <p className="text-sm text-yellow-200 text-center">⚠️ Contract address not configured — on-chain features are disabled in this preview.</p>
          </div>
        )}

        {isCheckingToken && (
          <div className="text-center mt-12" style={cardStyle}>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground font-heading mb-2">TwinMatrixSBT</p>
            <p className="text-base">{t('wizard.checkingIdentity')}</p>
          </div>
        )}

        {!isCheckingToken && contractError && (
          <div className="mt-8" style={{ border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '16px', padding: '1.75rem', background: 'rgba(244, 63, 94, 0.06)' }}>
            <p className="text-base text-destructive">{t('wizard.failedFetchContract')}</p>
            <p className="text-sm text-muted-foreground mt-1 break-all">{contractError}</p>
            <button onClick={() => void refreshOnchainState()} className="mt-4 py-3 px-6 rounded-xl text-sm font-semibold bg-foreground text-background hover:bg-foreground/90 transition-colors">
              {t('wizard.retry')}
            </button>
          </div>
        )}

        {!isCheckingToken && !contractError && hasMintedSbt && (
          <>
            {/* Tab bar */}
            <div className="flex gap-6 border-b border-foreground/10">
              {tabBtn('matrix', 'Twin Matrix')}
              {tabBtn('agents', 'Agents')}
              {tabBtn('listing', 'Listing')}
              {tabBtn('opportunities', 'Opportunities')}
            </div>

            {tab === 'matrix' && (
              <div className="animate-fade-in">
              <OnchainIdentityStatePage
                  tokenId={tokenId}
                  walletAddress={walletAddress}
                  latestVersion={latestVersion}
                  versions={versions}
                  boundAgents={boundAgents}
                  onReconfigure={() => {
                    setNeedsMatrixUpdate(true);
                    setState((s) => ({ ...s, step: 2, activeModules: s.activeModules.filter((m) => m === 'sport') }));
                    navigate('/mint');
                  }}
                  onSetupAgent={() => navigate('/account?tab=authorizations&action=new')}
                  onRefresh={() => void refreshOnchainState()}
                  isRefreshing={isCheckingToken}
                />
              </div>
            )}

            {tab === 'agents' && (
              <div className="animate-fade-in space-y-6">
                <div>
                  <h2 className="text-xl font-heading font-bold">Bound Agents</h2>
                  <p className="text-sm text-muted-foreground mt-1">Agents authorized to act on your behalf.</p>
                </div>

                {boundAgents.length === 0 ? (
                  <div style={cardStyle} className="text-center py-12 space-y-4">
                    <p className="text-sm font-mono text-muted-foreground/50 mb-2">AG</p>
                    <p className="text-sm text-muted-foreground">No agents bound yet. Activate an agent to start earning.</p>
                    <button
                      onClick={() => navigate('/account?tab=authorizations&action=new')}
                      className="btn-twin btn-twin-primary py-3 px-6 text-sm"
                    >
                      Activate Agent
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {boundAgents.map((agent) => (
                      <div key={agent.address} style={cardStyle} className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">{agent.name}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${agent.active ? 'bg-[hsla(164,24%,74%,0.15)] text-[hsl(164,24%,74%)]' : 'bg-foreground/10 text-muted-foreground'}`}>
                              {agent.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-sm font-mono text-muted-foreground mt-1 truncate">{agent.address}</p>
                        </div>
                        <button
                          onClick={() => navigate(`/account?tab=authorizations&edit=${agent.address}`)}
                          className="shrink-0 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Manage →
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'listing' && (
              <div className="animate-fade-in space-y-6">
                <div>
                  <h2 className="text-xl font-heading font-bold">Marketplace Presence</h2>
                  <p className="text-sm text-muted-foreground mt-1">Control how buyer agents discover and interact with your profile.</p>
                </div>

                <div style={cardStyle} className="space-y-4">
                  <p className="text-sm uppercase tracking-widest text-muted-foreground/60 font-heading">Visibility</p>
                  {[
                    { id: 'public', label: 'Public', desc: 'Fully discoverable by all buyer agents. Maximum exposure.' },
                    { id: 'semi', label: 'Semi-Public', desc: 'Visible to verified agents only. Requires authorization to view full matrix.' },
                    { id: 'private', label: 'Private', desc: 'Hidden from search. Only accessible via direct invitation.' },
                  ].map((opt) => (
                    <label key={opt.id} className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-foreground/5 transition-colors">
                      <input type="radio" name="visibility" defaultChecked={opt.id === 'public'} className="mt-1" />
                      <div>
                        <p className="text-sm font-medium">{opt.label}</p>
                        <p className="text-xs text-muted-foreground">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                <div style={cardStyle} className="space-y-4">
                  <p className="text-sm uppercase tracking-widest text-muted-foreground/60 font-heading">Agent Profile Card</p>
                  <p className="text-xs text-muted-foreground">This is how buyer agents see your listing.</p>
                  <div className="rounded-xl border border-foreground/10 p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center text-sm font-bold">
                        {walletAddress?.slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{walletAddress}</p>
                        <p className="text-xs text-muted-foreground">Verified Human · v{latestVersion}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {['sport', 'running', 'marathon', 'fitness'].map(tag => (
                        <span key={tag} className="text-xs font-mono px-2 py-0.5 rounded-md bg-foreground/5">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <button className="btn-twin btn-twin-primary py-3 px-6 text-sm">
                  Publish Changes
                </button>
              </div>
            )}

            {tab === 'opportunities' && (
              <div className="animate-fade-in">
                <SignalRecordsPage hasMintedSbt={hasMintedSbt} />
              </div>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
};

export default MatrixPage;
