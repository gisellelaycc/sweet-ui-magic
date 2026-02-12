import { useMemo, useState } from 'react';

interface Props {
  signature: number[];
  username: string;
  tags: string[];
  activeModules: string[];
  onNext: () => void;
}

export const ReviewStep = ({ signature, username, tags, activeModules, onNext }: Props) => {
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);

  const axes = [
    { label: 'Discipline', value: (signature[0] ?? 128) / 2.55 },
    { label: 'Exploration', value: (signature[1] ?? 128) / 2.55 },
    { label: 'Resilience', value: (signature[2] ?? 128) / 2.55 },
    { label: 'Creativity', value: (signature[3] ?? 128) / 2.55 },
  ];

  const corePercent = 40;
  const topicPercent = activeModules.length * 10;
  const soulPercent = 100 - corePercent - topicPercent;

  const topIndices = useMemo(() => {
    const sorted = signature.map((val, idx) => ({ val, idx })).sort((a, b) => b.val - a.val);
    return new Set(sorted.slice(0, 12).map(d => d.idx));
  }, [signature]);

  const rowLabels = useMemo(() =>
    Array.from({ length: 16 }, (_, i) => (i * 16).toString(16).toUpperCase().padStart(4, '0')),
  []);

  return (
    <div className="animate-fade-in space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-1">Identity State</h2>
        <p className="text-muted-foreground text-sm">Your minted state at a glance</p>
      </div>

      {/* Two-column layout: left summary, right matrix */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Signal Strength + Layer Composition */}
        <div className="lg:w-[38%] space-y-5 shrink-0">
          {tags.length > 0 && (
            <div className="glass-card space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Primary Signals</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map(t => (
                  <span key={t} className="chip text-sm !bg-foreground/10 !text-foreground/80">#{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Signal Strength */}
          <div className="glass-card space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Signal Strength</h3>
            {axes.map(axis => (
              <div key={axis.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-foreground/70">{axis.label}</span>
                  <span className="text-muted-foreground">{Math.round(axis.value)}%</span>
                </div>
                <div className="h-2 bg-foreground/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${axis.value}%`,
                      background: 'linear-gradient(90deg, rgba(40,180,160,0.3), rgba(40,180,160,0.7))',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Layer Composition */}
          <div className="glass-card space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Layer Composition</h3>
            <div className="flex gap-1 h-3 rounded-full overflow-hidden">
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
        </div>

        {/* Right: Twin Matrix Grid as energy field */}
        <div className="lg:w-[62%] flex flex-col items-center justify-center relative">
          {/* Radial glow background */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(40,180,160,0.12) 0%, rgba(40,180,160,0.04) 40%, transparent 70%)',
            }}
          />
          {/* Breathing glow layer */}
          <div
            className="absolute inset-0 pointer-events-none animate-[field-breathe_5s_ease-in-out_infinite]"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(40,180,160,0.08) 0%, transparent 60%)',
            }}
          />

          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 relative z-10">🧬 Twin Matrix Grid (256D)</h3>
          <div className="overflow-x-auto relative z-10">
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
                      const isTop = topIndices.has(idx);
                      const isHovered = hoveredCell === idx;
                      return (
                        <div
                          key={col}
                          className="w-4 h-4 rounded-sm flex items-center justify-center cursor-default relative transition-transform duration-150"
                          style={{
                            background: val > 0
                              ? `rgba(40, 180, 160, ${0.04 + intensity * 0.5})`
                              : 'rgba(255, 255, 255, 0.015)',
                            boxShadow: isTop
                              ? `0 0 10px rgba(40, 180, 160, ${0.5 + intensity * 0.4}), 0 0 20px rgba(40, 180, 160, ${intensity * 0.2}), inset 0 0 4px rgba(40, 180, 160, 0.2)`
                              : val > 180
                              ? `0 0 6px rgba(40, 180, 160, ${intensity * 0.35})`
                              : val > 80
                              ? `0 0 3px rgba(40, 180, 160, ${intensity * 0.15})`
                              : 'none',
                            transform: isHovered ? 'scale(1.15)' : 'scale(1)',
                          }}
                          onMouseEnter={() => setHoveredCell(idx)}
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          <span className="text-[5px] font-mono" style={{ color: `rgba(255,255,255, ${0.2 + intensity * 0.5})` }}>
                            {val.toString(16).toUpperCase().padStart(2, '0')}
                          </span>
                          {isHovered && (
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground/90 text-background text-[8px] px-1.5 py-0.5 rounded whitespace-nowrap z-10">
                              D{idx}: {val} ({val.toString(16).toUpperCase().padStart(2, '0')})
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
          {/* Bottom fade-out */}
          <div className="w-full h-8 mt-1 pointer-events-none" style={{ background: 'linear-gradient(to bottom, transparent, hsl(var(--background)))' }} />
        </div>
      </div>

      <p className="text-xs text-center text-muted-foreground/50">@{username}</p>

      <button onClick={onNext} className="btn-twin btn-twin-primary btn-glow w-full py-3">
        Open Agent Studio →
      </button>
    </div>
  );
};
