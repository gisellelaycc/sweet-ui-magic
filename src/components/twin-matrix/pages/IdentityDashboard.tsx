import { useMemo } from 'react';

const SLICES = [
  { label: 'Physical', range: [0, 63] as const, color: '255, 60, 100' },
  { label: 'Digital', range: [64, 127] as const, color: '60, 180, 255' },
  { label: 'Social', range: [128, 191] as const, color: '255, 200, 40' },
  { label: 'Spiritual', range: [192, 255] as const, color: '10, 255, 255' },
];

interface Props {
  username: string;
  signature: number[];
  activeModules: string[];
  onNavigate: (id: string) => void;
}

function generateHash(sig: number[]): string {
  const hex = sig.slice(0, 16).map(v => v.toString(16).padStart(2, '0')).join('');
  return `0x${hex}`;
}

function generateSBTId(): string {
  return `SBT-299331`;
}

const GlowDivider = () => (
  <div className="relative w-full h-px my-5">
    <div className="absolute inset-0" style={{
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)',
    }} />
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute top-0 h-full w-[60px]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(10, 255, 255, 0.25), rgba(173, 255, 255, 0.15), transparent)',
          animation: 'divider-trace-welcome 6s linear infinite',
        }}
      />
    </div>
  </div>
);

export const IdentityDashboard = ({ username, signature, activeModules, onNavigate }: Props) => {
  const identityHash = useMemo(() => generateHash(signature), [signature]);
  const sbtId = useMemo(() => generateSBTId(), []);
  const walletAddress = useMemo(() => '0x12a4…f9A9', []);

  // Layer mix calculation
  const layerMix = useMemo(() => {
    return SLICES.map(slice => {
      const sliceData = signature.slice(slice.range[0], slice.range[1] + 1);
      const total = sliceData.reduce((sum, v) => sum + v, 0);
      const max = sliceData.length * 255;
      return { label: slice.label, percent: max > 0 ? Math.round((total / max) * 100) : 0, color: slice.color };
    });
  }, [signature]);

  // AI summary based on signature
  const aiSummary = useMemo(() => {
    const physical = layerMix.find(l => l.label === 'Physical')?.percent ?? 0;
    const social = layerMix.find(l => l.label === 'Social')?.percent ?? 0;
    const traits: string[] = [];
    if (physical > 50) traits.push('Performance-oriented');
    else traits.push('Experience-driven');
    traits.push('Structured');
    if (social < 20) traits.push('Low social broadcast');
    else traits.push('Socially engaged');
    return traits.join('. ') + '.';
  }, [layerMix]);

  // Top dimensions
  const dominantDimensions = useMemo(() => {
    const DIMENSION_MAP: Record<number, { layer: string; name: string }> = {
      206: { layer: 'Spiritual', name: 'Outcome' },
      207: { layer: 'Spiritual', name: 'Experience' },
      208: { layer: 'Spiritual', name: 'Control' },
      155: { layer: 'Social', name: 'Solo' },
      85: { layer: 'Digital', name: 'Passive' },
      86: { layer: 'Digital', name: 'Active' },
    };
    return signature
      .map((val, idx) => {
        const mapped = DIMENSION_MAP[idx];
        const slice = SLICES.find(s => idx >= s.range[0] && idx <= s.range[1]);
        return { idx, value: val / 255, layer: mapped?.layer || slice?.label || 'Unknown', name: mapped?.name || `D${idx}` };
      })
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [signature]);

  const versions = [
    { version: 'v3', date: '2026-02-14', current: true },
    { version: 'v2', date: '2026-02-10', current: false },
    { version: 'v1', date: '2026-02-02', current: false },
  ];

  const boundAgents = [
    { name: 'OpenClaw Agent #01', status: 'ACTIVE' as const },
    { name: 'Telegram Bot Alpha', status: 'ACTIVE' as const },
  ];

  return (
    <div className="animate-fade-in h-full overflow-y-auto scrollbar-hide">
      <div className="max-w-5xl mx-auto px-6 py-6 space-y-0">

        {/* ① Current State Overview */}
        <section>
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="text-2xl font-bold">Identity State</h2>
              <p className="text-xs text-muted-foreground">@{username || 'unnamed'} · <span style={{ color: 'rgba(10,255,255,0.7)' }}>● Sealed</span></p>
            </div>
            <p className="text-[10px] text-muted-foreground/50">Last sealed · 2 hours ago</p>
          </div>

          <GlowDivider />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Identity Hash */}
            <div className="glass-card !rounded-2xl !p-4 space-y-1">
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Identity Hash</p>
              <p className="text-[11px] font-mono text-foreground/70 break-all leading-relaxed">{identityHash}</p>
            </div>
            {/* SBT ID */}
            <div className="glass-card !rounded-2xl !p-4 space-y-1">
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Minted SBT ID</p>
              <p className="text-sm font-mono text-foreground">{sbtId}</p>
            </div>
            {/* Bound Wallet */}
            <div className="glass-card !rounded-2xl !p-4 space-y-1">
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Bound Wallet</p>
              <p className="text-[11px] font-mono text-foreground/70">{walletAddress}</p>
            </div>
            {/* Vector Imprint mini */}
            <div className="glass-card !rounded-2xl !p-4 space-y-1.5">
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Vector Imprint</p>
              <div className="flex gap-px flex-wrap">
                {signature.slice(0, 64).map((v, i) => (
                  <div
                    key={i}
                    className="rounded-[1px]"
                    style={{
                      width: 5, height: 5,
                      background: v > 0
                        ? `rgba(10, 255, 255, ${0.1 + (v / 255) * 0.5})`
                        : 'rgba(255,255,255,0.02)',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <GlowDivider />

        {/* ② State Summary */}
        <section>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">State Insight</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Layer Mix */}
            <div className="glass-card !rounded-2xl !p-5 space-y-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Layer Mix</p>
              <div className="space-y-2">
                {layerMix.map(l => (
                  <div key={l.label} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-foreground/60">{l.label}</span>
                      <span className="text-muted-foreground">{l.percent}%</span>
                    </div>
                    <div className="h-1.5 bg-foreground/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${l.percent}%`,
                          background: `rgba(${l.color}, 0.5)`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Summary + Dominant Dimensions */}
            <div className="space-y-4">
              <div className="glass-card !rounded-2xl !p-5 space-y-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">AI Summary</p>
                <p className="text-sm text-foreground/80 italic leading-relaxed">{aiSummary}</p>
              </div>
              <div className="glass-card !rounded-2xl !p-5 space-y-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Dominant Dimensions</p>
                <div className="space-y-1.5">
                  {dominantDimensions.map(d => (
                    <div key={d.idx} className="flex items-center justify-between">
                      <span className="text-[11px] text-foreground/60">{d.layer} · {d.name}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{d.value.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <GlowDivider />

        {/* ③ Version History */}
        <section>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Version History</h3>
          <div className="space-y-2">
            {versions.map(v => (
              <div key={v.version} className="glass-card !rounded-2xl !p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${v.current ? 'text-foreground' : 'text-foreground/50'}`}>
                    State {v.version}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{v.date}</span>
                  {v.current && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-foreground/5 text-muted-foreground">current</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-[10px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-foreground/5">
                    View
                  </button>
                  {!v.current && (
                    <button className="text-[10px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-foreground/5">
                      Compare
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <GlowDivider />

        {/* ⑤ Agent Bindings */}
        <section>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Bound Agents</h3>
          <div className="space-y-2">
            {boundAgents.map(a => (
              <div key={a.name} className="glass-card !rounded-2xl !p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: '#F24455', boxShadow: '0 0 6px rgba(242,68,85,0.4)' }} />
                  <span className="text-sm text-foreground/80">{a.name}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">{a.status}</span>
              </div>
            ))}
          </div>
        </section>

        <GlowDivider />

        {/* ④ Manage State */}
        <section className="pb-8">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Manage State</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {[
              { label: 'Refine State', action: () => onNavigate('update') },
              { label: 'Re-seal', action: () => {} },
              { label: 'Export Vector', action: () => {} },
              { label: 'Share Snapshot', action: () => {} },
            ].map(btn => (
              <button
                key={btn.label}
                onClick={btn.action}
                className="btn-twin btn-twin-ghost py-2.5 text-xs"
              >
                {btn.label}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
