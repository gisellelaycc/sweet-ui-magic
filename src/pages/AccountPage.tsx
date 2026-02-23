import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTwinMatrix } from '@/contexts/TwinMatrixContext';
import { PageLayout } from '@/components/twin-matrix/PageLayout';
import { AuthStep } from '@/components/twin-matrix/steps/AuthStep';
import { AgentPermissionEditPage } from '@/components/twin-matrix/pages/AgentPermissionEditPage';
import { toast } from 'sonner';

type AccountTab = 'wallet' | 'authorizations' | 'settings';

const AccountPage = () => {
  const navigate = useNavigate();
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

  const [tab, setTab] = useState<AccountTab>('wallet');
  const [authView, setAuthView] = useState<'list' | 'form' | 'edit'>('list');
  const [editingAgent, setEditingAgent] = useState<string | null>(null);

  const cardStyle: React.CSSProperties = {
    border: '1px solid var(--glass-border)',
    borderRadius: '16px',
    padding: '1.75rem',
    background: 'var(--glass-bg)',
  };

  const tabBtn = (id: AccountTab, label: string) => (
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

  if (!isConnected) {
    return (
      <PageLayout activePage="account">
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md text-center space-y-6" style={cardStyle}>
            <p className="text-muted-foreground">Connect your wallet to manage your account.</p>
            <button onClick={() => openConnectModal?.()} className="btn-twin btn-twin-primary py-4 px-8 w-full">
              Connect Wallet
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout activePage="account">
      <div className="max-w-4xl mx-auto w-full space-y-6 py-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">Account</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your wallet, authorizations, and preferences.</p>
        </div>

        <div className="flex gap-6 border-b border-foreground/10">
          {tabBtn('wallet', 'Wallet')}
          {tabBtn('authorizations', 'Authorizations')}
          {tabBtn('settings', 'Settings')}
        </div>

        {tab === 'wallet' && (
          <div className="space-y-4 animate-fade-in">
            <div style={cardStyle} className="space-y-4">
              <p className="text-sm uppercase tracking-widest text-muted-foreground/60 font-heading">Connected Wallet</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-mono font-medium">{walletAddress}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isWrongNetwork ? '⚠️ Wrong network — switch to BSC Testnet' : '✓ BSC Testnet'}
                  </p>
                </div>
                <button onClick={() => disconnect()} className="btn-twin btn-twin-ghost py-2 px-4 text-sm">
                  Disconnect
                </button>
              </div>
              {isWrongNetwork && (
                <button onClick={switchToBscTestnet} disabled={isSwitchingNetwork} className="btn-twin btn-twin-primary py-2 px-4 text-sm">
                  {isSwitchingNetwork ? 'Switching…' : 'Switch to BSC Testnet'}
                </button>
              )}
            </div>

            <div style={cardStyle} className="space-y-3">
              <p className="text-sm uppercase tracking-widest text-muted-foreground/60 font-heading">Identity Status</p>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${hasMintedSbt ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
                <p className="text-sm">{hasMintedSbt ? 'Twin Matrix SBT minted' : 'No identity minted yet'}</p>
              </div>
              {!hasMintedSbt && (
                <button onClick={() => navigate('/verify')} className="btn-twin btn-twin-primary py-2 px-4 text-sm mt-2">
                  Create Identity
                </button>
              )}
              {tokenId !== null && (
                <p className="text-xs text-muted-foreground font-mono">Token ID: {tokenId.toString()}</p>
              )}
            </div>

            <div style={cardStyle} className="space-y-3">
              <p className="text-sm uppercase tracking-widest text-muted-foreground/60 font-heading">Notifications</p>
              <div className="flex items-center justify-between">
                <p className="text-sm">Email notifications</p>
                <div className="w-10 h-5 rounded-full bg-muted-foreground/20 relative cursor-pointer">
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-muted-foreground transition-transform" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm">Telegram alerts</p>
                <div className="w-10 h-5 rounded-full bg-muted-foreground/20 relative cursor-pointer">
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-muted-foreground transition-transform" />
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'authorizations' && (
          <div className="animate-fade-in">
            {authView === 'form' ? (
              <AuthStep
                data={state.agentSetup}
                onUpdate={(d) => setState((s) => ({ ...s, agentSetup: d }))}
                onNext={() => {}}
                onDashboard={() => {
                  void refreshOnchainState();
                  setAuthView('list');
                }}
                ownerAddress={address}
                tokenId={tokenId}
              />
            ) : authView === 'edit' && editingAgent && tokenId !== null ? (
              (() => {
                const agent = boundAgents.find((a) => a.address.toLowerCase() === editingAgent.toLowerCase());
                if (!agent) return <p className="text-muted-foreground">Agent not found.</p>;
                return (
                  <AgentPermissionEditPage
                    tokenId={tokenId}
                    agent={agent}
                    isWrongNetwork={isWrongNetwork}
                    isSwitchingNetwork={isSwitchingNetwork}
                    onSwitchNetwork={switchToBscTestnet}
                    onBack={() => { setAuthView('list'); setEditingAgent(null); }}
                    onUpdated={() => { void refreshOnchainState(); setAuthView('list'); setEditingAgent(null); }}
                  />
                );
              })()
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{boundAgents.length} authorized agent(s)</p>
                  <button
                    onClick={() => {
                      if (!hasMintedSbt) { toast.error('Mint your identity first'); return; }
                      setAuthView('form');
                    }}
                    className="btn-twin btn-twin-primary py-2 px-4 text-sm"
                  >
                    + Authorize Agent
                  </button>
                </div>

                {boundAgents.length === 0 ? (
                  <div style={cardStyle} className="text-center py-8">
                    <p className="text-muted-foreground">No agents authorized yet.</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Authorize buyer agents to access your Twin Matrix data.</p>
                  </div>
                ) : (
                  boundAgents.map((agent) => (
                    <div key={agent.address} style={cardStyle} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{agent.name}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">{agent.address}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Scope: {agent.scopeGranted.length} quadrant(s) · {agent.active ? '✓ Active' : '○ Inactive'}
                        </p>
                      </div>
                      <button
                        onClick={() => { setEditingAgent(agent.address); setAuthView('edit'); }}
                        className="btn-twin btn-twin-ghost py-1.5 px-3 text-xs"
                      >
                        Edit
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'settings' && (
          <div className="space-y-4 animate-fade-in">
            <div style={cardStyle} className="space-y-3">
              <p className="text-sm uppercase tracking-widest text-muted-foreground/60 font-heading">Security</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Two-factor authentication</p>
                  <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                </div>
                <button className="btn-twin btn-twin-ghost py-1.5 px-3 text-xs" disabled>Coming Soon</button>
              </div>
            </div>
            <div style={cardStyle} className="space-y-3">
              <p className="text-sm uppercase tracking-widest text-muted-foreground/60 font-heading">Data</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Export my data</p>
                  <p className="text-xs text-muted-foreground">Download all your Twin Matrix data</p>
                </div>
                <button className="btn-twin btn-twin-ghost py-1.5 px-3 text-xs" disabled>Coming Soon</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default AccountPage;
