import { useNavigate } from 'react-router-dom';
import { useTwinMatrix } from '@/contexts/TwinMatrixContext';
import { useI18n } from '@/lib/i18n';
import { ParticleBackground } from '@/components/twin-matrix/ParticleBackground';
import { TopNav } from '@/components/twin-matrix/TopNav';
import { SiteFooter } from '@/components/twin-matrix/SiteFooter';
import { SignalRecordsPage } from '@/components/twin-matrix/pages/SignalRecordsPage';

const cardStyle: React.CSSProperties = {
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '16px',
  padding: '1.75rem',
  background: 'rgba(255, 255, 255, 0.02)',
};

const TasksPage = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const {
    isConnected,
    openConnectModal,
    disconnect,
    walletAddress,
    hasMintedSbt,
  } = useTwinMatrix();

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
          activePage="missions"
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
                  {t('wallet.connect')} to view Tasks & Rewards
                </p>
                <button
                  onClick={() => openConnectModal?.()}
                  className="w-full py-4 rounded-xl text-base font-semibold bg-foreground text-background hover:bg-foreground/90 transition-colors"
                >
                  {t('wallet.connect')}
                </button>
              </div>
            </div>
          ) : (
            <SignalRecordsPage hasMintedSbt={hasMintedSbt} />
          )}
        </main>
      </div>
      <SiteFooter />
    </div>
  );
};

export default TasksPage;
