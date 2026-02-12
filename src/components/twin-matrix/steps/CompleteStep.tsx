import { useMemo, useState } from 'react';

interface Props {
  username: string;
  signature: number[];
  agentName: string;
}

function generateWalletAddress(): string {
  const chars = '0123456789abcdef';
  let addr = '0x';
  for (let i = 0; i < 40; i++) addr += chars[Math.floor(Math.random() * chars.length)];
  return addr;
}

function generateHash(sig: number[]): string {
  const hex = sig.slice(0, 16).map(v => v.toString(16).padStart(2, '0')).join('');
  return `0x${hex}`;
}

function generateSBTId(): string {
  return `SBT-${Math.floor(Math.random() * 900000 + 100000)}`;
}

export const CompleteStep = ({ username, signature, agentName }: Props) => {
  const walletAddress = useMemo(() => generateWalletAddress(), []);
  const identityHash = useMemo(() => generateHash(signature), [signature]);
  const sbtId = useMemo(() => generateSBTId(), []);
  const [telegramConnected, setTelegramConnected] = useState(false);

  // Top signals from signature
  const topSignals = useMemo(() => {
    const labels = ['Discipline', 'Exploration', 'Resilience', 'Creativity', 'Endurance', 'Strategy', 'Empathy', 'Focus'];
    return labels
      .map((l, i) => ({ label: l, value: signature[i] ?? 0 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);
  }, [signature]);

  // Vector fingerprint (visual)
  const fingerprint = useMemo(() => signature.slice(0, 32), [signature]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-fade-in px-4">
      <div className="text-6xl mb-6">✨</div>
      <h2 className="text-3xl font-bold mb-2">State Committed</h2>
      <p className="text-muted-foreground mb-8 max-w-sm">
        Your identity state has been minted and bound to your wallet.
      </p>

      <div className="glass-card max-w-lg w-full text-left space-y-5">
        {/* Identity Hash */}
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Identity Hash</p>
          <p className="text-xs font-mono text-foreground/70 break-all">{identityHash}</p>
        </div>

        {/* Top Signals */}
        <div className="space-y-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Top Signals</p>
          <div className="flex flex-wrap gap-1.5">
            {topSignals.map(s => (
              <span key={s.label} className="text-[11px] px-2.5 py-1 rounded-lg bg-foreground/8 text-foreground/70">
                {s.label} · {s.value}
              </span>
            ))}
          </div>
        </div>

        {/* Vector Fingerprint */}
        <div className="space-y-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Vector Fingerprint</p>
          <div className="flex flex-wrap gap-px">
            {fingerprint.map((v, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-sm"
                style={{ background: `rgba(40, 180, 160, ${v / 255})` }}
              />
            ))}
          </div>
        </div>

        {/* SBT ID */}
        <div className="flex justify-between items-center text-sm border-t border-foreground/5 pt-3">
          <span className="text-muted-foreground text-xs">Minted SBT ID</span>
          <span className="text-foreground font-mono text-xs">{sbtId}</span>
        </div>

        {/* Active Agent */}
        {agentName && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground text-xs">Active Agent</span>
            <span className="text-foreground text-xs">{agentName}</span>
          </div>
        )}

        {/* Wallet */}
        <div className="pt-3 border-t border-foreground/10 space-y-1">
          <p className="text-xs text-green-400">✓ Bound to sovereign wallet</p>
          <p className="text-[10px] text-muted-foreground font-mono break-all">{walletAddress}</p>
        </div>

        {/* Telegram */}
        <div className="pt-3 border-t border-foreground/10">
          {!telegramConnected ? (
            <button
              onClick={() => setTelegramConnected(true)}
              className="btn-twin btn-twin-ghost w-full py-2 text-xs"
            >
              🔗 Connect Telegram
            </button>
          ) : (
            <p className="text-xs text-green-400 text-center">✓ Telegram Connected</p>
          )}
          <p className="text-[9px] text-muted-foreground/50 mt-1 text-center">Required for agent notifications</p>
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
