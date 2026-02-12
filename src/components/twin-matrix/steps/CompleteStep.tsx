import { useMemo } from 'react';

interface Props {
  username: string;
  scope: string;
  duration: string;
}

function generateWalletAddress(): string {
  const chars = '0123456789abcdef';
  let addr = '0x';
  for (let i = 0; i < 40; i++) {
    addr += chars[Math.floor(Math.random() * chars.length)];
  }
  return addr;
}

export const CompleteStep = ({ username, scope, duration }: Props) => {
  const walletAddress = useMemo(() => generateWalletAddress(), []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-fade-in px-4">
      <div className="text-6xl mb-6">✨</div>
      <h2 className="text-3xl font-bold mb-2">State Committed</h2>
      <p className="text-muted-foreground mb-8 max-w-sm">
        Your identity state has been minted and bound to your wallet.
      </p>

      <div className="glass-card max-w-sm w-full text-center space-y-4">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">State Summary</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between px-2">
            <span className="text-muted-foreground">Identity</span>
            <span className="text-foreground font-medium">@{username}</span>
          </div>
          <div className="flex justify-between px-2">
            <span className="text-muted-foreground">Access Scope</span>
            <span className="text-foreground font-medium">{scope}</span>
          </div>
          <div className="flex justify-between px-2">
            <span className="text-muted-foreground">Validity Period</span>
            <span className="text-foreground font-medium">{duration}</span>
          </div>
        </div>
        <div className="pt-3 border-t border-foreground/10 space-y-2">
          <p className="text-xs text-green-400">✓ Bound to sovereign wallet</p>
          <p className="text-[10px] text-muted-foreground font-mono break-all">{walletAddress}</p>
        </div>
      </div>

      <button
        onClick={() => window.location.reload()}
        className="btn-twin btn-twin-ghost mt-8 px-8 py-3"
      >
        Start Over
      </button>
    </div>
  );
};
