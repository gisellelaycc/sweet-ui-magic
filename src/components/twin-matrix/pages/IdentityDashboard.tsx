import { useMemo, useState } from 'react';
import { useI18n } from '@/lib/i18n';

const SLICES = [
  { labelKey: 'common.physical', label: 'Physical', range: [0, 63] as const, color: '255, 60, 100' },
  { labelKey: 'common.digital', label: 'Digital', range: [64, 127] as const, color: '60, 180, 255' },
  { labelKey: 'common.social', label: 'Social', range: [128, 191] as const, color: '255, 200, 40' },
  { labelKey: 'common.spiritual', label: 'Spiritual', range: [192, 255] as const, color: '100, 200, 50' },
];

interface Props {
  signature: number[];
  activeModules: string[];
  onNavigate: (id: string) => void;
}

function truncateAddress(addr: string) {
  return addr.length > 10 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
}

export const IdentityDashboard = ({ signature, activeModules, onNavigate }: Props) => {
  const { t } = useI18n();
  const [showBanner, setShowBanner] = useState(true);
  const walletAddress = '0x17cE…8cb4';

  const layerMix = useMemo(() => {
    return SLICES.map(slice => {
      const sliceData = signature.slice(slice.range[0], slice.range[1] + 1);
      const total = sliceData.reduce((sum, v) => sum + v, 0);
      const max = sliceData.length * 255;
      return { label: slice.label, labelKey: slice.labelKey, percent: max > 0 ? Math.round((total / max) * 100) : 0, color: slice.color };
    });
  }, [signature]);

  const aiSummary = useMemo(() => {
    const dominant = [...layerMix].sort((a, b) => b.percent - a.percent)[0];
    const topSignals = activeModules.length > 0 ? activeModules.join(', ') : 'Sport';
    return `Dominant layer: ${dominant.label} (${dominant.percent}%). Top signals: Freq 3 4, Dur 30 60, Steps 3k 7k.`;
  }, [layerMix, activeModules]);

  const versions = [
    { version: 'v4', block: '91926297', digest: '0x3ea0aa60…187daf98', current: true },
    { version: 'v3', block: '91219062', digest: '0xdd8e2e37…c597f0eb', current: false },
    { version: 'v2', block: '90966460', digest: '0x5978342d…cabfac8a', current: false },
    { version: 'v1', block: '90966439', digest: '0x9dde5093…196c920R', current: false },
  ];

  return (
    <div className="animate-fade-in h-full overflow-y-auto scrollbar-hide">
      <div className="max-w-5xl mx-auto px-6 py-6 space-y-8">

        {/* Notification Banner */}
        {showBanner && (
          <div className="flex items-center justify-between gap-4 px-6 py-4 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-base text-foreground/80">
              Matrix update complete. You can switch to Agent tab and click + New Agent.
            </p>
            <div className="flex items-center gap-3 shrink-0">
              <button onClick={() => setShowBanner(false)}
                className="text-base text-muted-foreground hover:text-foreground transition-colors">
                Dismiss
              </button>
              <button onClick={() => onNavigate('agents')}
                className="btn-twin btn-twin-primary px-5 py-2 text-sm rounded-xl">
                Go to Agent Tab
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight mb-2">
              Identity State
            </h2>
            <p className="text-base text-muted-foreground">On-chain state from TwinMatrixSBT</p>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <button onClick={() => onNavigate('refine')}
              className="text-base text-muted-foreground hover:text-foreground transition-colors py-2.5 px-5 border border-foreground/10 rounded-xl hover:bg-foreground/5">
              Reconfigure Preferences
            </button>
            <button
              className="text-base text-muted-foreground hover:text-foreground transition-colors py-2.5 px-5 border border-foreground/10 rounded-xl hover:bg-foreground/5">
              Refresh
            </button>
          </div>
        </div>

        {/* Stats line */}
        <div className="flex items-center gap-6 text-base text-muted-foreground">
          <span>Token ID <span className="text-foreground font-medium">7</span></span>
          <span className="text-foreground/20">·</span>
          <span>Latest Version <span className="text-foreground font-medium">v4</span></span>
          <span className="text-foreground/20">·</span>
          <span>Wallet <span className="text-foreground font-medium font-mono">{walletAddress}</span></span>
        </div>

        {/* State Insight */}
        <section className="space-y-5">
          <h3 className="text-base text-muted-foreground uppercase tracking-widest">State Insight</h3>
          <div className="space-y-4">
            {layerMix.map(l => (
              <div key={l.labelKey} className="flex items-center gap-4">
                <span className="text-base text-foreground/70 w-24 shrink-0">{t(l.labelKey)}</span>
                <div className="flex-1 h-2 bg-foreground/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${l.percent}%`, background: `rgba(${l.color}, 0.7)` }} />
                </div>
                <span className="text-base text-muted-foreground w-12 text-right shrink-0">{l.percent}%</span>
              </div>
            ))}
          </div>
        </section>

        {/* AI Summary */}
        <section className="space-y-3">
          <h3 className="text-base text-muted-foreground uppercase tracking-widest">AI Summary</h3>
          <p className="text-base text-foreground/70 italic leading-relaxed">{aiSummary}</p>
        </section>

        {/* Twin Matrix + Version History */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Matrix Projection */}
          <div className="lg:w-[55%] min-w-0 space-y-4">
            <h3 className="text-base text-muted-foreground uppercase tracking-widest">Twin Matrix Projection (256D)</h3>
            <div className="flex flex-col gap-[3px]" style={{ fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace" }}>
              {Array.from({ length: 16 }, (_, row) => {
                const isTopHalf = row < 8;
                return (
                  <div key={row} className={`flex items-center gap-[3px] ${row === 8 ? "mt-[3px]" : ""}`}>
                    <span className="text-[8px] text-muted-foreground/25 font-mono w-7 text-right shrink-0">
                      {(row * 16).toString(16).toUpperCase().padStart(4, "0")}
                    </span>
                    {Array.from({ length: 16 }, (_, col) => {
                      const isLeftHalf = col < 8;
                      let sliceIdx: number, localRow: number, localCol: number;
                      if (isTopHalf && isLeftHalf) { sliceIdx = 0; localRow = row; localCol = col; }
                      else if (isTopHalf && !isLeftHalf) { sliceIdx = 1; localRow = row; localCol = col - 8; }
                      else if (!isTopHalf && isLeftHalf) { sliceIdx = 2; localRow = row - 8; localCol = col; }
                      else { sliceIdx = 3; localRow = row - 8; localCol = col - 8; }
                      const slice = SLICES[sliceIdx];
                      const idx = slice.range[0] + localRow * 8 + localCol;
                      const v = signature[idx] ?? 0;
                      const intensity = v / 255;
                      const color = slice.color;
                      const borderColor = v > 0
                        ? `rgba(${color}, ${0.6 + 0.4 * intensity})`
                        : 'hsl(var(--foreground) / 0.2)';
                      const textColor = v > 0
                        ? `rgba(${color}, ${0.7 + 0.3 * intensity})`
                        : 'hsl(var(--foreground) / 0.35)';
                      return (
                        <div key={col} className={`rounded-full aspect-square flex items-center justify-center ${col === 8 ? "ml-[3px]" : ""}`}
                          style={{
                            width: 'clamp(1rem, 2.2vw, 1.4rem)', height: 'clamp(1rem, 2.2vw, 1.4rem)',
                            border: `1px solid ${borderColor}`,
                            background: v > 0 ? `rgba(${color}, ${0.1 + intensity * 0.15})` : 'transparent',
                            boxShadow: v > 80 ? `0 0 3px rgba(${color}, ${intensity * 0.15})` : 'none',
                          }}
                        >
                          <span className="text-[6px] font-mono" style={{ color: textColor }}>
                            {v > 0 ? v.toString(16).toUpperCase().padStart(2, '0') : ''}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Version History */}
          <div className="lg:w-[45%] shrink-0 space-y-4">
            <h3 className="text-base text-muted-foreground uppercase tracking-widest">Version History</h3>
            <div className="glass-card !p-0 divide-y divide-foreground/5">
              {versions.map(v => (
                <div key={v.version} className="px-6 py-5">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-lg font-bold ${v.current ? 'text-foreground' : 'text-foreground/60'}`}>{v.version}</span>
                    <span className="text-sm text-muted-foreground font-mono">Block {v.block}</span>
                  </div>
                  <p className="text-sm text-muted-foreground/60 font-mono">digest: {v.digest}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
