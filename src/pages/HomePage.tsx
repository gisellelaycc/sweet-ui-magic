import { useNavigate } from 'react-router-dom';
import { useTwinMatrix } from '@/contexts/TwinMatrixContext';
import { ParticleBackground } from '@/components/twin-matrix/ParticleBackground';
import { TopNav } from '@/components/twin-matrix/TopNav';
import { EntryPage } from '@/components/twin-matrix/pages/EntryPage';

const HomePage = () => {
  const navigate = useNavigate();
  const { isConnected, openConnectModal, disconnect, walletAddress } = useTwinMatrix();

  return (
    <div className="h-screen w-full overflow-y-auto" style={{ background: 'hsl(228 14% 4%)', color: 'hsl(225 14% 93%)' }}>
      <div className="min-h-screen flex flex-col relative" style={{ zIndex: 10 }}>
        <ParticleBackground color="cyan" />

        <TopNav
          activePage={null}
          onNavigate={(id) => {
            if (id === 'identity') navigate('/matrix');
            else if (id === 'agent') navigate('/agent');
            else if (id === 'missions') navigate('/tasks');
            else navigate('/');
          }}
          hasIdentity={false}
          isWalletConnected={isConnected}
          walletAddress={walletAddress}
          onConnectWallet={() => openConnectModal?.()}
          onDisconnectWallet={() => disconnect()}
        />

        <main className="flex-1 min-h-0 px-4 py-4 flex flex-col relative z-10">
          <EntryPage
            onHumanEntry={() => {
              if (!isConnected) {
                openConnectModal?.();
              } else {
                navigate('/matrix');
              }
            }}
            onAgentEntry={() => navigate('/agent')}
            locked={!isConnected}
            onRequestConnect={() => openConnectModal?.()}
          />
        </main>
      </div>
    </div>
  );
};

export default HomePage;
