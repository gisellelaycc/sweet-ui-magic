import { useMemo, useState } from 'react';

// Dimension label mapping (by slice)
const DIMENSION_MAP: Record<number, { layer: string; name: string }> = {
  206: { layer: 'Spiritual', name: 'Outcome' },
  207: { layer: 'Spiritual', name: 'Experience' },
  208: { layer: 'Spiritual', name: 'Control' },
  209: { layer: 'Spiritual', name: 'Release' },
  155: { layer: 'Social', name: 'Solo' },
  156: { layer: 'Social', name: 'Group' },
  85: { layer: 'Digital', name: 'Passive' },
  86: { layer: 'Digital', name: 'Active' },
};

const SLICES = [
  { label: 'Physical', range: [0, 63] as const, color: 'rgba(200, 60, 60' },
  { label: 'Digital', range: [64, 127] as const, color: 'rgba(60, 130, 200' },
  { label: 'Social', range: [128, 191] as const, color: 'rgba(200, 180, 40' },
  { label: 'Spiritual', range: [192, 255] as const, color: 'rgba(40, 180, 160' },
];

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

  // Dominant Dimensions: top-N non-zero dims
  const dominantDimensions = useMemo(() => {
    return signature
      .map((val, idx) => {
        const mapped = DIMENSION_MAP[idx];
        const slice = SLICES.find(s => idx >= s.range[0] && idx <= s.range[1]);
        return {
          idx,
          value: val / 255,
          layer: mapped?.layer || slice?.label || 'Unknown',
          name: mapped?.name || `D${idx}`,
        };
      })
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [signature]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-fade-in px-4">
      <div className="text-6xl mb-6">✨</div>
      <h2 className="text-3xl font-bold mb-2">State Committed</h2>
      <p className="text-muted-foreground mb-8 max-w-sm">
        Your identity vector has been locked and committed.
      </p>

      <div className="glass-card max-w-lg w-full text-left space-y-5">
        {/* Identity Hash */}
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Identity Hash</p>
          <p className="text-xs font-mono text-foreground/70 break-all">{identityHash}</p>
        </div>

        {/* Dominant Dimensions */}
        <div className="space-y-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Dominant Dimensions</p>
          <div className="space-y-1">
            {dominantDimensions.map(d => (
              <div key={d.idx} className="flex items-center justify-between text-[11px]">
                <span className="text-foreground/70">{d.layer}: {d.name}</span>
                <span className="text-muted-foreground font-mono">({d.value.toFixed(2)})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Vector Fingerprint — full 256D with slice segmentation */}
        <div className="space-y-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Vector Fingerprint</p>
          <p className="text-[9px] text-muted-foreground/50">256D Snapshot at Mint Time</p>
          <div className="space-y-1.5">
            {SLICES.map(slice => (
              <div key={slice.label}>
                <p className="text-[8px] text-muted-foreground/40 uppercase tracking-wider mb-0.5">{slice.label}</p>
                <div className="flex flex-wrap gap-px">
                  {signature.slice(slice.range[0], slice.range[1] + 1).map((v, i) => (
                    <div
                      key={i}
                      className="w-2.5 h-2.5 rounded-[1px]"
                      style={{
                        background: v > 0
                          ? `${slice.color}, ${v / 255})`
                          : 'rgba(255, 255, 255, 0.02)',
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SBT ID */}
        <div className="flex justify-between items-center text-sm border-t border-foreground/5 pt-3">
          <span className="text-muted-foreground text-xs">Minted SBT ID</span>
          <span className="text-foreground font-mono text-xs">{sbtId}</span>
        </div>

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
