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
  isRefreshing: boolean;
}

const LAYERS = [
  { key: 'physical', label: 'Physical', range: [0, 63] as const, color: '255, 60, 100' },
  { key: 'digital', label: 'Digital', range: [64, 127] as const, color: '60, 180, 255' },
  { key: 'social', label: 'Social', range: [128, 191] as const, color: '255, 200, 40' },
  { key: 'spiritual', label: 'Spiritual', range: [192, 255] as const, color: '10, 255, 255' },
];

const DIM_LABEL_MAP = new Map(SPEC_REGISTRY.map((item) => [item.dim_id, item.label]));

const ThinDivider = () => (
  <div className="w-full h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />
);

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

  const layerMix = useMemo(() => {
    const matrix = activeVersion?.matrix ?? [];
    const sums = LAYERS.map((layer) => {
      const [start, end] = layer.range;
      return matrix.slice(start, end + 1).reduce((acc, cur) => acc + cur, 0);
    });
    const total = sums.reduce((acc, cur) => acc + cur, 0) || 1;

    return LAYERS.map((layer, i) => ({
      ...layer,
      percent: Math.round((sums[i] / total) * 100),
    }));
  }, [activeVersion]);

  const topIndices = useMemo(() => {
    const matrix = activeVersion?.matrix ?? [];
    const sorted = matrix.map((val, idx) => ({ val, idx })).sort((a, b) => b.val - a.val);
    return new Set(sorted.slice(0, 12).map((item) => item.idx));
  }, [activeVersion]);

  const aiSummary = useMemo(() => {
    if (!activeVersion) return t('onchain.noMatrixYet');

    const dominantLayer = [...layerMix].sort((a, b) => b.percent - a.percent)[0];
    const dominantLayerLabel = t(`common.${dominantLayer.key}`);
    const activeDims = activeVersion.matrix
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
  }, [activeVersion, layerMix, t]);

  return (
    <div className="animate-fade-in h-full overflow-y-auto scrollbar-hide">
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold mb-1">{t('myIdentity.title')}</h2>
            <p className="text-muted-foreground text-sm">{t('onchain.subtitle')}</p>
          </div>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="text-xs px-4 py-2 border border-foreground/10 rounded-lg text-foreground/80 hover:bg-foreground/5 hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRefreshing ? t('onchain.refreshing') : t('onchain.refresh')}
          </button>
        </div>

        <ThinDivider />

        <div className="flex items-center gap-6 text-xs text-muted-foreground/70 flex-wrap">
          <span>{t('onchain.tokenId')} <span className="text-foreground/80 font-mono">{tokenId.toString()}</span></span>
          <span>·</span>
          <span>{t('onchain.latestVersion')} <span className="text-foreground/80 font-mono">v{latestVersion}</span></span>
          <span>·</span>
          <span>{t('onchain.wallet')} <span className="text-foreground/80 font-mono">{walletAddress ?? '-'}</span></span>
        </div>

        <ThinDivider />

        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">{t('dashboard.stateInsight')}</h3>
          <div className="space-y-2.5">
            {layerMix.map((layer) => (
              <div key={layer.key} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-foreground/70">{t(`common.${layer.key}`)}</span>
                  <span className="text-muted-foreground">{layer.percent}%</span>
                </div>
                <div className="h-[3px] bg-transparent rounded-full overflow-visible">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${layer.percent}%`,
                      background: `rgba(${layer.color}, 0.6)`,
                      boxShadow: `0 0 5px rgba(${layer.color}, 0.6), 0 0 12px rgba(${layer.color}, 0.3)`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <ThinDivider />

        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">{t('dashboard.aiSummary')}</h3>
          <p className="text-sm text-foreground/80 italic leading-relaxed">{aiSummary}</p>
        </div>

        <ThinDivider />

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,560px)_minmax(0,1fr)] gap-6 xl:gap-10 items-start">
          <div className="w-fit max-w-[560px]">
            <div className="mb-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t('review.projection')}</h3>
            </div>
            {activeVersion ? (
              <div className="relative max-w-[560px]">
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at center, rgba(10,255,255,0.08) 0%, transparent 70%)' }}
                />
                <div className="overflow-x-auto relative z-10 pr-1">
                  <div className="flex flex-col min-w-fit">
                    {Array.from({ length: 16 }, (_, row) => {
                      const isTopHalf = row < 8;
                      return (
                        <div key={row} className={`flex items-center gap-1 ${row === 8 ? 'mt-2' : 'mb-px'}`}>
                          <span className="text-[7px] text-muted-foreground/25 font-mono w-7 text-right shrink-0">
                            {(row * 16).toString(16).toUpperCase().padStart(4, '0')}
                          </span>
                          <div className="flex gap-px">
                            {Array.from({ length: 16 }, (_, col) => {
                              const isLeftHalf = col < 8;
                              let sliceIdx: number;
                              let localRow: number;
                              let localCol: number;
                              if (isTopHalf && isLeftHalf) {
                                sliceIdx = 0;
                                localRow = row;
                                localCol = col;
                              } else if (isTopHalf && !isLeftHalf) {
                                sliceIdx = 1;
                                localRow = row;
                                localCol = col - 8;
                              } else if (!isTopHalf && isLeftHalf) {
                                sliceIdx = 2;
                                localRow = row - 8;
                                localCol = col;
                              } else {
                                sliceIdx = 3;
                                localRow = row - 8;
                                localCol = col - 8;
                              }

                              const slice = LAYERS[sliceIdx];
                              const idx = slice.range[0] + localRow * 8 + localCol;
                              const value = activeVersion.matrix[idx] ?? 0;
                              const intensity = value / 255;
                              const isTop = topIndices.has(idx);
                              const isHovered = hoveredCell === idx;
                              const cellOpacity = value > 0 ? 0.25 + 0.75 * intensity : 0.03;

                              return (
                                <div
                                  key={col}
                                  className={`rounded-sm flex items-center justify-center cursor-default relative transition-transform duration-150 ${col === 8 ? 'ml-1' : ''}`}
                                  style={{
                                    width: '1.25rem',
                                    height: '1.25rem',
                                    aspectRatio: '1',
                                    background: value > 0 ? `rgba(${slice.color}, ${cellOpacity * 0.5})` : 'rgba(255, 255, 255, 0.015)',
                                    boxShadow: isTop && value > 0
                                      ? `0 0 8px rgba(${slice.color}, ${cellOpacity * 0.6})`
                                      : value > 120
                                        ? `0 0 6px rgba(${slice.color}, ${cellOpacity * 0.3})`
                                        : 'none',
                                    transform: isHovered ? 'scale(1.15)' : 'scale(1)',
                                  }}
                                  onMouseEnter={() => setHoveredCell(idx)}
                                  onMouseLeave={() => setHoveredCell(null)}
                                  title={`D${idx}: ${value}`}
                                >
                                  <span className="text-[5px] font-mono" style={{ color: `rgba(255,255,255, ${0.15 + intensity * 0.55})` }}>
                                    {value.toString(16).toUpperCase().padStart(2, '0')}
                                  </span>
                                  {isHovered && (
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground/90 text-background text-[8px] px-1.5 py-0.5 rounded whitespace-nowrap z-10">
                                      D{idx}: {value} ({t(`common.${slice.key}`)})
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t('onchain.noMatrix')}</p>
            )}
          </div>

          <div className="space-y-0 min-w-0 xl:pl-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">{t('dashboard.versionHistory')}</h3>
            <div className="border border-foreground/10 rounded-xl px-3 py-3">
              {versions.map((item, idx) => (
                <div key={item.version}>
                  <button
                    onClick={() => setSelectedVersion(item.version)}
                    className={`w-full text-left px-3 py-3 rounded-xl transition-colors ${activeVersion?.version === item.version ? 'bg-foreground/[0.06]' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-mono">v{item.version}</span>
                      <span className="text-xs text-muted-foreground">{t('onchain.block')} {item.blockNumber}</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono mt-1">{t('onchain.digest')}: {shortDigest(item.digest)}</p>
                  </button>
                  {idx < versions.length - 1 && <ThinDivider />}
                </div>
              ))}
            </div>
          </div>
        </div>

        <ThinDivider />

        <div className="space-y-0">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">{t('dashboard.boundAgents')}</h3>
          {boundAgents.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('agentStudio.noBoundAgents')}</p>
          ) : (
            boundAgents.map((agent, idx) => (
              <div key={agent.address}>
                <div className="py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{agent.name}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${agent.active ? 'bg-emerald-500/15 text-emerald-300' : 'bg-foreground/10 text-muted-foreground'}`}>
                      {agent.active ? t('onchain.active') : t('onchain.inactive')}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground mt-1 break-all">{agent.address}</p>
                  <p className="text-[10px] font-mono text-muted-foreground mt-1">
                    {t('onchain.erc8004TokenId')}: {agent.tokenId !== null ? agent.tokenId.toString() : '-'}
                  </p>
                  <p className="text-[10px] font-mono text-muted-foreground mt-1">
                    {t('onchain.scopeGranted')}: {permissionMaskToGrantedQuadrants(agent.permissionMask).join(', ') || t('onchain.none')}
                  </p>
                </div>
                {idx < boundAgents.length - 1 && <ThinDivider />}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
