import { useMemo, useState } from 'react';

const DIMENSION_LABELS = [
  'Discipline', 'Exploration', 'Resilience', 'Creativity',
  'Endurance', 'Strategy', 'Empathy', 'Focus',
  'Ambition', 'Adaptability', 'Leadership', 'Patience',
  'Curiosity', 'Composure', 'Precision', 'Courage',
];

interface Props {
  username: string;
  activeModules: string[];
  signature: number[];
  onNavigate: (id: string) => void;
}

export const MyIdentityPage = ({ username, activeModules, signature, onNavigate }: Props) => {
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);

  const topDimensions = useMemo(() => {
    return DIMENSION_LABELS
      .map((label, i) => ({ label, value: signature[i] ?? Math.floor(Math.random() * 256) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [signature]);

  const topDimensionIndices = useMemo(() => {
    const sorted = signature
      .map((val, idx) => ({ val, idx }))
      .sort((a, b) => b.val - a.val);
    return new Set(sorted.slice(0, 12).map(d => d.idx));
  }, [signature]);

  const corePercent = 40;
  const topicPercent = activeModules.length * 10;
  const soulPercent = Math.max(0, 100 - corePercent - topicPercent);

  const rowLabels = useMemo(() =>
    Array.from({ length: 16 }, (_, i) => (i * 16).toString(16).toUpperCase().padStart(4, '0')),
  []);

  // Simulate layer contribution for hover tooltip
  const getLayerContribution = (idx: number) => {
    const val = signature[idx] ?? 0;
    const core = Math.round(20 + (val % 30));
    const skill = Math.round(15 + ((val * 3) % 40));
    const soul = Math.max(0, 100 - core - skill);
    return { core, skill, soul };
  };

  const getQuadrant = (idx: number) => {
    const row = Math.floor(idx / 16);
    const col = idx % 16;
    const xLabel = col < 8 ? 'Introvert' : 'Extrovert';
    const yLabel = row < 8 ? 'Rational' : 'Emotional';
    return `${yLabel} / ${xLabel}`;
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-1">Identity State</h2>
        <p className="text-muted-foreground text-sm">Your minted sovereign state</p>
      </div>

      {/* Identity Card */}
      <div className="glass-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">@{username || 'unnamed'}</p>
            <p className="text-xs" style={{ color: '#F24455' }}>● Active</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Layers</p>
            <p className="text-sm font-medium">{activeModules.length} active</p>
          </div>
        </div>
      </div>

      {/* ─── Upper: Signal Strength ─── */}
      <div className="glass-card space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Signal Strength</h3>
        <div className="space-y-2">
          {topDimensions.map(dim => (
            <div key={dim.label} className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-foreground/60">{dim.label}</span>
                <span className="text-muted-foreground">{Math.round((dim.value / 255) * 100)}%</span>
              </div>
              <div className="h-1.5 bg-foreground/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(dim.value / 255) * 100}%`,
                    background: 'linear-gradient(90deg, rgba(40,180,160,0.3), rgba(40,180,160,0.7))',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Layer Composition ─── */}
      <div className="glass-card space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Layer Composition</h3>
        <div className="flex gap-1 h-2.5 rounded-full overflow-hidden">
          <div className="bg-foreground/60 rounded-l-full" style={{ width: `${corePercent}%` }} />
          <div className="bg-foreground/35" style={{ width: `${topicPercent}%` }} />
          <div className="bg-foreground/15 rounded-r-full" style={{ width: `${soulPercent}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Core {corePercent}%</span>
          <span>Topic {topicPercent}%</span>
          <span>Soul {soulPercent}%</span>
        </div>
      </div>

      {/* ─── Lower: Twin Matrix 16×16 Grid ─── */}
      <div className="glass-card space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">🧬 Twin Matrix Grid (256D)</h3>
        <div className="overflow-x-auto">
          <div className="flex flex-col gap-px min-w-fit">
            {Array.from({ length: 16 }, (_, row) => (
              <div key={row} className="flex items-center gap-1">
                <span className="text-[7px] text-muted-foreground/40 font-mono w-7 text-right shrink-0">
                  {rowLabels[row]}
                </span>
                <div className="flex gap-px">
                  {Array.from({ length: 16 }, (_, col) => {
                    const idx = row * 16 + col;
                    const val = signature[idx] ?? 0;
                    const intensity = val / 255;
                    const isTop = topDimensionIndices.has(idx);
                    const isHovered = hoveredCell === idx;
                    const layers = getLayerContribution(idx);
                    return (
                      <div
                        key={col}
                        className="w-4 h-4 rounded-sm flex items-center justify-center cursor-default relative"
                        style={{
                          background: val > 0
                            ? `rgba(40, 180, 160, ${0.06 + intensity * 0.4})`
                            : 'rgba(255, 255, 255, 0.02)',
                          boxShadow: isTop
                            ? `0 0 8px rgba(40, 180, 160, ${0.4 + intensity * 0.4}), inset 0 0 4px rgba(40, 180, 160, 0.2)`
                            : val > 200
                            ? `0 0 4px rgba(40, 180, 160, ${intensity * 0.3})`
                            : 'none',
                        }}
                        onMouseEnter={() => setHoveredCell(idx)}
                        onMouseLeave={() => setHoveredCell(null)}
                      >
                        <span className="text-[5px] font-mono text-foreground/40">
                          {val.toString(16).toUpperCase().padStart(2, '0')}
                        </span>
                        {isHovered && (
                          <div className="absolute -top-[72px] left-1/2 -translate-x-1/2 bg-foreground/95 text-background text-[8px] px-2.5 py-1.5 rounded-lg whitespace-nowrap z-20 space-y-0.5 shadow-lg">
                            <div className="font-semibold">Dimension {idx}</div>
                            <div>Strength: {(intensity).toFixed(2)}</div>
                            <div>Hex: {val.toString(16).toUpperCase().padStart(2, '0')}</div>
                            <div>{getQuadrant(idx)}</div>
                            <div className="text-[7px] opacity-70 pt-0.5 border-t border-background/20">
                              Core {layers.core}% · Skill {layers.skill}% · Soul {layers.soul}%
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <button onClick={() => onNavigate('update')} className="btn-twin btn-twin-ghost flex-1 py-2.5 text-sm">
          Update State
        </button>
        <button onClick={() => onNavigate('agent')} className="btn-twin btn-twin-primary flex-1 py-2.5 text-sm">
          Agent Studio
        </button>
      </div>
    </div>
  );
};
