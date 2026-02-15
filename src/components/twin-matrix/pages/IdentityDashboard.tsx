import { useMemo } from 'react';
import { useI18n } from '@/lib/i18n';

const SLICES = [
  { labelKey: 'common.physical', range: [0, 63] as const, color: '255, 60, 100' },
  { labelKey: 'common.digital', range: [64, 127] as const, color: '60, 180, 255' },
  { labelKey: 'common.social', range: [128, 191] as const, color: '255, 200, 40' },
  { labelKey: 'common.spiritual', range: [192, 255] as const, color: '10, 255, 255' },
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

const ThinDivider = () => (
  <div className="w-full h-px my-6" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />
);

export const IdentityDashboard = ({ username, signature, activeModules, onNavigate }: Props) => {
  const { t } = useI18n();
  const identityHash = useMemo(() => generateHash(signature), [signature]);
  const sbtId = useMemo(() => generateSBTId(), []);
  const walletAddress = useMemo(() => '0x12a4…f9A9', []);

  const layerMix = useMemo(() => {
    return SLICES.map(slice => {
      const sliceData = signature.slice(slice.range[0], slice.range[1] + 1);
      const total = sliceData.reduce((sum, v) => sum + v, 0);
      const max = sliceData.length * 255;
      return { labelKey: slice.labelKey, percent: max > 0 ? Math.round((total / max) * 100) : 0, color: slice.color };
    });
  }, [signature]);

  const aiSummary = useMemo(() => {
    const physical = layerMix.find(l => l.labelKey === 'common.physical')?.percent ?? 0;
    const social = layerMix.find(l => l.labelKey === 'common.social')?.percent ?? 0;
    const traits: string[] = [];
    if (physical > 50) traits.push('Performance-oriented');
    else traits.push('Experience-driven');
    traits.push('Structured');
    if (social < 20) traits.push('Low social broadcast');
    else traits.push('Socially engaged');
    return traits.join('. ') + '.';
  }, [layerMix]);

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
        return { idx, value: val / 255, layer: mapped?.layer || (slice ? t(slice.labelKey) : 'Unknown'), name: mapped?.name || `D${idx}` };
      })
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [signature, t]);

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
      <div className="max-w-3xl mx-auto px-6 py-6">
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">{t('dashboard.identityState')}</h2>
              <p className="text-xs text-muted-foreground">@{username || 'unnamed'} · <span style={{ color: 'rgba(10,255,255,0.7)' }}>{t('dashboard.sealed')}</span></p>
            </div>
            <p className="text-[10px] text-muted-foreground/50">{t('dashboard.lastSealed')}</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
            <div className="space-y-1 py-3 border-b border-foreground/5">
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest">{t('dashboard.identityHash')}</p>
              <p className="text-[11px] font-mono text-foreground/70 break-all leading-relaxed">{identityHash}</p>
            </div>
            <div className="space-y-1 py-3 border-b border-foreground/5">
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest">{t('dashboard.mintedSbt')}</p>
              <p className="text-sm font-mono text-foreground">{sbtId}</p>
            </div>
            <div className="space-y-1 py-3 border-b border-foreground/5">
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest">{t('dashboard.boundWallet')}</p>
              <p className="text-[11px] font-mono text-foreground/70">{walletAddress}</p>
            </div>
            <div className="space-y-1.5 py-3 border-b border-foreground/5">
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest">{t('dashboard.vectorImprint')}</p>
              <div className="flex gap-px flex-wrap">
                {signature.slice(0, 64).map((v, i) => (
                  <div key={i} className="rounded-[1px]"
                    style={{ width: 5, height: 5, background: v > 0 ? `rgba(10, 255, 255, ${0.1 + (v / 255) * 0.5})` : 'rgba(255,255,255,0.02)' }} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <ThinDivider />

        <section>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">{t('dashboard.stateInsight')}</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{t('dashboard.layerMix')}</p>
              <div className="space-y-2.5">
                {layerMix.map(l => (
                  <div key={l.labelKey} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-foreground/60">{t(l.labelKey)}</span>
                      <span className="text-muted-foreground">{l.percent}%</span>
                    </div>
                    <div className="h-1 bg-foreground/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${l.percent}%`, background: `rgba(${l.color}, 0.5)` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{t('dashboard.aiSummary')}</p>
                <p className="text-sm text-foreground/80 italic leading-relaxed">{aiSummary}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{t('dashboard.dominantDim')}</p>
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

        <ThinDivider />

        <section>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">{t('dashboard.versionHistory')}</h3>
          <div className="space-y-0">
            {versions.map((v, idx) => (
              <div key={v.version}>
                <div className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium ${v.current ? 'text-foreground' : 'text-foreground/50'}`}>State {v.version}</span>
                    <span className="text-[10px] text-muted-foreground">{v.date}</span>
                    {v.current && <span className="text-[9px] px-2 py-0.5 rounded-full bg-foreground/5 text-muted-foreground">{t('dashboard.current')}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">{t('dashboard.view')}</button>
                    {!v.current && <button className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">{t('dashboard.compare')}</button>}
                  </div>
                </div>
                {idx < versions.length - 1 && <div className="h-px" style={{ background: 'rgba(255,255,255,0.04)' }} />}
              </div>
            ))}
          </div>
        </section>

        <ThinDivider />

        <section>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">{t('dashboard.boundAgents')}</h3>
          <div className="space-y-0">
            {boundAgents.map((a, idx) => (
              <div key={a.name}>
                <div className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: '#F24455', boxShadow: '0 0 6px rgba(242,68,85,0.4)' }} />
                    <span className="text-sm text-foreground/80">{a.name}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{a.status}</span>
                </div>
                {idx < boundAgents.length - 1 && <div className="h-px" style={{ background: 'rgba(255,255,255,0.04)' }} />}
              </div>
            ))}
          </div>
        </section>

        <ThinDivider />

        <section className="pb-8">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">{t('dashboard.manageState')}</h3>
          <div className="flex gap-4 flex-wrap">
            {[
              { labelKey: 'dashboard.refineState', action: () => onNavigate('update') },
              { labelKey: 'dashboard.reseal', action: () => {} },
              { labelKey: 'dashboard.exportVector', action: () => {} },
              { labelKey: 'dashboard.shareSnapshot', action: () => {} },
            ].map(btn => (
              <button key={btn.labelKey} onClick={btn.action}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors py-2 px-4 border border-foreground/8 rounded-lg hover:bg-foreground/5">
                {t(btn.labelKey)}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
