import { useMemo, useState } from 'react';
import { permissionMaskToGrantedQuadrants, type OnchainBoundAgent, type OnchainVersion } from '@/lib/contracts/twin-matrix-sbt';
import { SPEC_REGISTRY } from '@/lib/twin-encoder/spec-registry';
import { useI18n } from '@/lib/i18n';

interface Props {
  tokenId: bigint;
  walletAddress?: string;
  latestVersion: number;
  versions: OnchainVersion[];
  boundAgents: OnchainBoundAgent[];
  onRefresh: () => void;
  onReconfigure: () => void;
  isRefreshing: boolean;
}

const LAYERS = [
  { key: 'physical', label: 'Physical', range: [0, 63] as const, color: '255, 60, 100' },
  { key: 'digital', label: 'Digital', range: [64, 127] as const, color: '60, 180, 255' },
  { key: 'social', label: 'Social', range: [128, 191] as const, color: '255, 200, 40' },
  { key: 'spiritual', label: 'Spiritual', range: [192, 255] as const, color: '10, 255, 255' },
];

const DIM_LABEL_MAP = new Map(SPEC_REGISTRY.map((item) => [item.dim_id, item.label]));

const cardStyle: React.CSSProperties = {
  border: '1px solid rgba(255, 255, 255, 0.10)',
  borderRadius: '12px',
  padding: '1.5rem',
  background: 'rgba(255, 255, 255, 0.02)',
};

function shortDigest(digest: string): string {
  return `${digest.slice(0, 10)}…${digest.slice(-8)}`;
}

function humanizeLabel(label: string): string {
  return label
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export const OnchainIdentityStatePage = ({
  tokenId,
  walletAddress,
  latestVersion,
  versions,
  boundAgents,
  onRefresh,
  onReconfigure,
  isRefreshing,
}: Props) => {
  const { t } = useI18n();
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);

  const activeVersion = useMemo(() => {
    if (versions.length === 0) return null;
    if (selectedVersion === null) return versions[0];
    return versions.find((item) => item.version === selectedVersion) ?? versions[0];
  }, [versions, selectedVersion]);

  const matrix = activeVersion?.matrix ?? [];

  const filledCount = useMemo(() => matrix.filter((v) => v > 0).length, [matrix]);

  const layerMix = useMemo(() => {
    const sums = LAYERS.map((layer) => {
      const [start, end] = layer.range;
      return matrix.slice(start, end + 1).reduce((acc, cur) => acc + cur, 0);
    });
    const total = sums.reduce((acc, cur) => acc + cur, 0) || 1;

    return LAYERS.map((layer, i) => ({
      ...layer,
      percent: Math.round((sums[i] / total) * 100),
    }));
  }, [matrix]);

  const topIndices = useMemo(() => {
    const sorted = matrix.map((val, idx) => ({ val, idx })).sort((a, b) => b.val - a.val);
    return new Set(sorted.slice(0, 12).map((item) => item.idx));
  }, [matrix]);

  const aiSummary = useMemo(() => {
    if (!activeVersion) return t('onchain.noMatrixYet');

    const dominantLayer = [...layerMix].sort((a, b) => b.percent - a.percent)[0];
    const dominantLayerLabel = t(`common.${dominantLayer.key}`);
    const activeDims = matrix
      .map((value, index) => ({ value, index }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
      .map((item) => humanizeLabel(DIM_LABEL_MAP.get(item.index) ?? `D${item.index}`));

    if (activeDims.length === 0) {
      return t('onchain.aiSparse').replace('{layer}', dominantLayerLabel);
    }

    return t('onchain.aiDominant')
      .replace('{layer}', dominantLayerLabel)
      .replace('{percent}', String(dominantLayer.percent))
      .replace('{signals}', activeDims.join(', '));
  }, [activeVersion, layerMix, matrix, t]);

  /* ── Stats row data ── */
  const stats = [
    { value: `${filledCount}/256`, label: 'TWIN MATRIX' },
    { value: String(latestVersion), label: 'VERSION' },
    { value: String(boundAgents.length), label: 'BOUND AGENTS' },
    { value: String(versions.length), label: 'HISTORY' },
    {
      value: `${filledCount > 0 ? Math.round((filledCount / 256) * 100) : 0}%`,
      label: 'COMPLETION',
      highlight: true,
    },
  ];

  return (
    <div className="animate-fade-in h-full overflow-y-auto scrollbar-hide">
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12 py-6 space-y-6">

        {/* ── Page Title ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              className="font-heading font-extrabold uppercase leading-tight tracking-tight text-foreground"
              style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)' }}
            >
              ME
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mt-1 max-w-xl leading-relaxed">
              The true you in different dimensions, staying transparent yet mysterious.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onReconfigure}
              className="py-2 px-4 rounded-lg text-xs font-medium border border-foreground/10 text-muted-foreground hover:bg-foreground/5 hover:text-foreground transition-colors"
            >
              {t('onchain.reconfigure')}
            </button>
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="py-2 px-4 rounded-lg text-xs font-medium border border-foreground/10 text-muted-foreground hover:bg-foreground/5 hover:text-foreground transition-colors disabled:opacity-50"
            >
              {isRefreshing ? t('onchain.refreshing') : t('onchain.refresh')}
            </button>
          </div>
        </div>

        {/* ── Subtitle ── */}
        <p className="text-sm text-muted-foreground/60 leading-relaxed max-w-2xl">
          Attribute values and rankings are hidden in the black number for the airdrop index. Update more attributes to get more airdrops.
        </p>

        {/* ── Stats Bar ── */}
        <div className="grid grid-cols-5 gap-0 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255, 255, 255, 0.10)' }}>
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center py-4 px-2"
              style={{
                borderRight: i < stats.length - 1 ? '1px solid rgba(255, 255, 255, 0.10)' : 'none',
                background: 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <span
                className="text-xl md:text-2xl font-heading font-bold"
                style={{ color: stat.highlight ? '#F24455' : 'hsl(var(--foreground))' }}
              >
                {stat.value}
              </span>
              <span className="text-xs uppercase tracking-wider text-muted-foreground mt-1">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* ── Main Content: Matrix + Right Panel ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,400px)] gap-5 items-start">

          {/* ── Twin Matrix Grid (no card wrapper) ── */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <p className="text-base font-heading font-semibold text-foreground">Twin Matrix (256D)</p>
              <span className="text-muted-foreground/40 text-sm cursor-help" title="256-dimension identity projection">ⓘ</span>
            </div>

            {activeVersion ? (
              <div className="overflow-x-auto">
                <table className="border-collapse w-full" style={{ fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace" }}>
                  <tbody>
                    {Array.from({ length: 16 }, (_, row) => {
                      const rowAddr = (row * 16).toString(16).toUpperCase().padStart(4, '0');
                      return (
                        <tr key={row}>
                          {/* Row hex label */}
                          <td className="pr-4 py-[5px] text-right select-none" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>
                            {rowAddr}
                          </td>
                          {/* 16 hex cells */}
                          {Array.from({ length: 16 }, (_, col) => {
                            const idx = row * 16 + col;
                            const value = matrix[idx] ?? 0;
                            const hex = value.toString(16).toUpperCase().padStart(2, '0');
                            const isTop = topIndices.has(idx);
                            const isHovered = hoveredCell === idx;

                            // Determine layer color
                            const isTopHalf = row < 8;
                            const isLeftHalf = col < 8;
                            let sliceIdx: number;
                            if (isTopHalf && isLeftHalf) sliceIdx = 0;
                            else if (isTopHalf && !isLeftHalf) sliceIdx = 1;
                            else if (!isTopHalf && isLeftHalf) sliceIdx = 2;
                            else sliceIdx = 3;
                            const slice = LAYERS[sliceIdx];

                            const intensity = value / 255;
                            const textColor = value > 0
                              ? `rgba(${slice.color}, ${0.4 + 0.6 * intensity})`
                              : 'rgba(255, 255, 255, 0.15)';

                            return (
                              <td
                                key={col}
                                className="text-center relative cursor-default"
                                style={{
                                  fontSize: '13px',
                                  padding: '5px 6px',
                                  color: textColor,
                                  textShadow: isTop && value > 0 ? `0 0 6px rgba(${slice.color}, 0.5)` : 'none',
                                  background: isHovered ? 'rgba(255,255,255,0.06)' : 'transparent',
                                  borderRadius: '3px',
                                  transition: 'background 0.15s',
                                }}
                                onMouseEnter={() => setHoveredCell(idx)}
                                onMouseLeave={() => setHoveredCell(null)}
                              >
                                {hex}
                                {isHovered && (
                                  <div
                                    className="absolute -top-7 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap rounded px-2 py-0.5"
                                    style={{
                                      fontSize: '10px',
                                      background: 'hsl(var(--foreground))',
                                      color: 'hsl(var(--background))',
                                    }}
                                  >
                                    D{idx}: {value} ({t(`common.${slice.key}`)})
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t('onchain.noMatrix')}</p>
            )}
          </div>

          {/* ── Right Panel: Update + Insights ── */}
          <div className="space-y-5">
            {/* Twin Matrix Update panel */}
            <div style={cardStyle}>
              <p className="text-base font-heading font-semibold text-foreground mb-5">Twin Matrix Update</p>

              {/* Step 01 */}
              <div className="flex items-start gap-3 mb-4">
                <span
                  className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }}
                >
                  01
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground/80 uppercase tracking-wide mb-2">
                    Refine Your Matrix
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                    Update your identity dimensions to improve your Twin Matrix projection and earn more points.
                  </p>
                  <button
                    onClick={onReconfigure}
                    className="w-full py-2.5 rounded-lg text-xs font-semibold bg-foreground text-background hover:bg-foreground/90 transition-colors"
                  >
                    Refine
                  </button>
                </div>
              </div>

              <div className="w-full h-px my-4" style={{ background: 'rgba(255,255,255,0.06)' }} />

              {/* Step 02 */}
              <div className="flex items-start gap-3">
                <span
                  className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }}
                >
                  02
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground/80 uppercase tracking-wide mb-2">
                    Confirm On-chain
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                    Commit your updated matrix to the blockchain. This seals your identity state permanently.
                  </p>
                  <button
                    disabled
                    className="w-full py-2.5 rounded-lg text-xs font-semibold border border-foreground/10 text-muted-foreground cursor-not-allowed opacity-50"
                  >
                    Coming Soon
                  </button>
                </div>
              </div>
            </div>

            {/* State Insight */}
            <div style={cardStyle}>
              <p className="text-sm uppercase tracking-[0.15em] text-muted-foreground font-heading mb-4">{t('dashboard.stateInsight')}</p>
              <div className="space-y-3">
                {layerMix.map((layer) => (
                  <div key={layer.key} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/70">{t(`common.${layer.key}`)}</span>
                      <span className="text-muted-foreground">{layer.percent}%</span>
                    </div>
                    <div className="h-[3px] rounded-full overflow-visible" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${layer.percent}%`,
                          background: `rgba(${layer.color}, 0.6)`,
                          boxShadow: `0 0 5px rgba(${layer.color}, 0.5), 0 0 12px rgba(${layer.color}, 0.25)`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Summary */}
            <div style={cardStyle}>
              <p className="text-sm uppercase tracking-[0.15em] text-muted-foreground font-heading mb-3">{t('dashboard.aiSummary')}</p>
              <p className="text-sm text-foreground/70 italic leading-relaxed">{aiSummary}</p>
            </div>
          </div>
        </div>

        {/* ── Bottom Row: Version History + Bound Agents ── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 -mt-1">
          {/* Version History */}
          <div style={cardStyle}>
            <p className="text-sm uppercase tracking-[0.15em] text-muted-foreground font-heading mb-4">{t('dashboard.versionHistory')}</p>
            {versions.length === 0 ? (
              <p className="text-xs text-muted-foreground">No versions recorded yet.</p>
            ) : (
              versions.map((item, idx) => (
                <div key={item.version}>
                  <button
                    onClick={() => setSelectedVersion(item.version)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors text-sm ${activeVersion?.version === item.version ? 'bg-foreground/[0.06]' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono font-medium text-foreground/80">v{item.version}</span>
                      <span className="text-muted-foreground">{t('onchain.block')} {item.blockNumber}</span>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono mt-0.5">{t('onchain.digest')}: {shortDigest(item.digest)}</p>
                  </button>
                  {idx < versions.length - 1 && (
                    <div className="w-full h-px my-1" style={{ background: 'rgba(255,255,255,0.04)' }} />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Bound Agents */}
          <div style={cardStyle}>
            <p className="text-sm uppercase tracking-[0.15em] text-muted-foreground font-heading mb-4">{t('dashboard.boundAgents')}</p>
            {boundAgents.length === 0 ? (
              <p className="text-xs text-muted-foreground">{t('agentStudio.noBoundAgents')}</p>
            ) : (
              boundAgents.map((agent, idx) => (
                <div key={agent.address}>
                  <div className="py-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">{agent.name}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${agent.active ? 'bg-emerald-500/15 text-emerald-300' : 'bg-foreground/10 text-muted-foreground'}`}>
                        {agent.active ? t('onchain.active') : t('onchain.inactive')}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-muted-foreground mt-1 break-all">{agent.address}</p>
                    <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                      {t('onchain.scopeGranted')}: {permissionMaskToGrantedQuadrants(agent.permissionMask).join(', ') || t('onchain.none')}
                    </p>
                  </div>
                  {idx < boundAgents.length - 1 && (
                    <div className="w-full h-px my-1" style={{ background: 'rgba(255,255,255,0.04)' }} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Meta footer ── */}
        <div className="flex items-center gap-4 text-[10px] text-muted-foreground/50 flex-wrap pb-4">
          <span>Token #{tokenId.toString()}</span>
          <span>·</span>
          <span>v{latestVersion}</span>
          <span>·</span>
          <span>{walletAddress ?? '-'}</span>
        </div>

      </div>
    </div>
  );
};
