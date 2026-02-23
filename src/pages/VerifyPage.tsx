import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTwinMatrix } from '@/contexts/TwinMatrixContext';
import { PageLayout } from '@/components/twin-matrix/PageLayout';

const VerifyPage = () => {
  const navigate = useNavigate();
  const { isConnected, openConnectModal } = useTwinMatrix();
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!isConnected) return;
  }, [isConnected]);

  const startVerification = () => {
    setVerifying(true);
    // Fake popup → auto-success after 3s
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
      setTimeout(() => navigate('/mint'), 1200);
    }, 3000);
  };

  return (
    <PageLayout activePage="identity">
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-lg w-full text-center space-y-8">
          {!isConnected ? (
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground font-heading">Step 1</p>
                <h1 className="text-3xl md:text-4xl font-heading font-bold">Connect Your Wallet</h1>
                <p className="text-muted-foreground">Connect your wallet to begin the human verification process.</p>
              </div>
              <button onClick={() => openConnectModal?.()} className="btn-twin btn-twin-primary py-4 px-8 text-base w-full max-w-xs mx-auto">
                Connect Wallet
              </button>
            </div>
          ) : verified ? (
            <div className="space-y-4 animate-fade-in">
              <div className="w-16 h-16 mx-auto rounded-full border-2 border-[hsl(var(--color-success))] flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
              <h2 className="text-2xl font-heading font-bold">Verified</h2>
              <p className="text-muted-foreground">Redirecting to Twin Matrix creation…</p>
            </div>
          ) : verifying ? (
            <div className="space-y-6 animate-fade-in">
              {/* Fake verification popup */}
              <div className="rounded-2xl p-8 space-y-6" style={{ border: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}>
                <div className="w-12 h-12 mx-auto rounded-full border-2 border-muted-foreground/30 flex items-center justify-center animate-spin" style={{ borderTopColor: 'hsl(var(--foreground))' }} />
                <div className="space-y-2">
                  <h3 className="text-lg font-heading font-semibold">twin3.ai Verification</h3>
                  <p className="text-sm text-muted-foreground">Verifying your humanity…</p>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-foreground rounded-full transition-all duration-3000" style={{ width: '100%', animation: 'verify-progress 3s linear' }} />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground font-heading">Human Verification</p>
                <h1 className="text-3xl md:text-4xl font-heading font-bold">Prove You're Human</h1>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Before listing your experience, we verify your identity through twin3.ai's proof-of-humanity protocol.
                </p>
              </div>

              <div className="rounded-2xl p-6 text-left space-y-4" style={{ border: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}>
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">🔒</span>
                  <div>
                    <p className="text-sm font-medium">Privacy-Preserving</p>
                    <p className="text-xs text-muted-foreground">No personal data stored. Only a cryptographic proof is recorded.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">⚡</span>
                  <div>
                    <p className="text-sm font-medium">Quick Process</p>
                    <p className="text-xs text-muted-foreground">Verification takes less than 30 seconds.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">🛡️</span>
                  <div>
                    <p className="text-sm font-medium">Trust Layer</p>
                    <p className="text-xs text-muted-foreground">Buyer agents can confirm you're a real person before transacting.</p>
                  </div>
                </div>
              </div>

              <button onClick={startVerification} className="btn-twin btn-twin-primary py-4 px-8 text-base w-full max-w-xs mx-auto">
                Begin Verification
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes verify-progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </PageLayout>
  );
};

export default VerifyPage;
