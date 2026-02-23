import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTwinMatrix } from '@/contexts/TwinMatrixContext';
import { useI18n } from '@/lib/i18n';
import { ParticleBackground } from '@/components/twin-matrix/ParticleBackground';
import { TopNav } from '@/components/twin-matrix/TopNav';
import { SiteFooter } from '@/components/twin-matrix/SiteFooter';
import { AuthStep } from '@/components/twin-matrix/steps/AuthStep';
import { AgentStudioPage } from '@/components/twin-matrix/pages/AgentStudioPage';
import { AgentPermissionEditPage } from '@/components/twin-matrix/pages/AgentPermissionEditPage';

type AuthView = 'records' | 'form' | 'editPermission';

const cardStyle: React.CSSProperties = {
  border: '1px solid var(--glass-border)',
  borderRadius: '16px',
  padding: '1.75rem',
  background: 'var(--glass-bg)',
};

const AgentPage = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const {
    isConnected,
    address,
    openConnectModal,
    disconnect,
    walletAddress,
    hasMintedSbt,
    tokenId,
    boundAgents,
    refreshOnchainState,
    state,
    setState,
    isWrongNetwork,
    isSwitchingNetwork,
    switchToBscTestnet,
  } = useTwinMatrix();

  const [authView, setAuthView] = useState<AuthView>('records');
  const [editingAgentAddress, setEditingAgentAddress] = useState<string | null>(null);

  const navHandler = (id: string | null) => {
    if (id === null) navigate('/');
    else if (id === 'identity') navigate('/matrix');
    else if (id === 'agent') navigate('/agent');
    else if (id === 'missions') navigate('/tasks');
  };

  return (
    <div className="h-screen w-full overflow-y-auto bg-background text-foreground">
      <div className="min-h-screen flex flex-col relative" style={{ zIndex: 10 }}>
        <ParticleBackground color="cyan" />

        <TopNav
          activePage="agent"
          onNavigate={navHandler}
          hasIdentity={hasMintedSbt}
          isWalletConnected={isConnected}
          walletAddress={walletAddress}
          onConnectWallet={() => openConnectModal?.()}
          onDisconnectWallet={() => disconnect()}
        />

        <main className="flex-1 min-h-0 px-4 py-4 flex flex-col relative z-10">
          {!isConnected ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center text-center max-w-md" style={cardStyle}>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6">
                  {t('wallet.connect')} to view Agent capabilities
                </p>
                <button
                  onClick={() => openConnectModal?.()}
                  className="w-full py-4 rounded-xl text-base font-semibold bg-foreground text-background hover:bg-foreground/90 transition-colors"
                >
                  {t('wallet.connect')}
                </button>
              </div>
            </div>
          ) : authView === 'form' ? (
            <AuthStep
              data={state.agentSetup}
              onUpdate={(d) => setState((s) => ({ ...s, agentSetup: d }))}
              onNext={() => {}}
              onDashboard={() => {
                void refreshOnchainState();
                setAuthView('records');
              }}
              ownerAddress={address}
              tokenId={tokenId}
            />
          ) : authView === 'editPermission' && editingAgentAddress && tokenId !== null ? (
            (() => {
              const editingAgent = boundAgents.find((item) => item.address.toLowerCase() === editingAgentAddress.toLowerCase());
              if (!editingAgent) {
                return (
                  <div className="max-w-3xl mx-auto w-full mt-8">
                    <div style={cardStyle}>
                      <p className="text-base text-muted-foreground">{t('agent.selectedNotFound')}</p>
                    </div>
                  </div>
                );
              }
              return (
                <AgentPermissionEditPage
                  tokenId={tokenId}
                  agent={editingAgent}
                  isWrongNetwork={isWrongNetwork}
                  isSwitchingNetwork={isSwitchingNetwork}
                  onSwitchNetwork={switchToBscTestnet}
                  onBack={() => {
                    setAuthView('records');
                    setEditingAgentAddress(null);
                  }}
                  onUpdated={() => {
                    void refreshOnchainState();
                    setAuthView('records');
                    setEditingAgentAddress(null);
                  }}
                />
              );
            })()
          ) : (
            <AgentStudioPage
              boundAgents={boundAgents}
              onCreateAgent={() => {
                if (!hasMintedSbt || tokenId === null) {
                  toast.error(t('wizard.needMintBeforeAgent'));
                  return;
                }
                setAuthView('form');
              }}
              onEditAgent={(agentAddress?: string) => {
                if (!hasMintedSbt || tokenId === null) {
                  toast.error(t('wizard.needMintBeforeAgent'));
                  return;
                }
                const targetAddress = agentAddress ?? boundAgents[0]?.address;
                if (!targetAddress) {
                  toast.error('No bound agent found to edit.');
                  return;
                }
                setEditingAgentAddress(targetAddress);
                setAuthView('editPermission');
              }}
            />
          )}
        </main>
      </div>
      <SiteFooter />
    </div>
  );
};

export default AgentPage;
