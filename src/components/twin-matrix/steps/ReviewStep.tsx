import { useMemo, useState } from 'react';

// Slice definitions for visual segmentation
const SLICES = [
  { label: 'Physical', range: [0, 63], color: 'rgba(200, 60, 60' },
  { label: 'Digital', range: [64, 127], color: 'rgba(60, 130, 200' },
  { label: 'Social', range: [128, 191], color: 'rgba(200, 180, 40' },
  { label: 'Spiritual', range: [192, 255], color: 'rgba(40, 180, 160' },
];

function getSliceForDim(idx: number): typeof SLICES[number] {
  return SLICES.find(s => idx >= s.range[0] && idx <= s.range[1]) || SLICES[0];
}

interface Props {
  signature: number[];
  username: string;
  tags: string[];
  activeModules: string[];
  onNext: () => void;
}

export const ReviewStep = ({ signature, username, activeModules, onNext }: Props) => {
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);

  // Identity Density = non_zero_dims / 256
  const identityDensity = useMemo(() => {
    const nonZero = signature.filter(v => v > 0).length;
    return Math.round((nonZero / 256) * 100);
  }, [signature]);

  // Soul Quadrant (dims 206-209)
  const quadrant = useMemo(() => {
    const x206 = signature[206] ?? 0;
    const x207 = signature[207] ?? 0;
    const x208 = signature[208] ?? 0;
    const x209 = signature[209] ?? 0;
    const X = (x206 - x207) / 255; // Outcome ↔ Experience
    const Y = (x208 - x209) / 255; // Control ↔ Release
    const missing = x206 === 0 && x207 === 0 && x208 === 0 && x209 === 0;
    if (missing) return { X: 0, Y: 0, label: '—', missing: true };
    let label = 'ON_AXIS';
    if (X > 0.05 && Y > 0.05) label = 'Q1';
    else if (X < -0.05 && Y > 0.05) label = 'Q2';
    else if (X < -0.05 && Y < -0.05) label = 'Q3';
    else if (X > 0.05 && Y < -0.05) label = 'Q4';
    return { X: Math.round(X * 100) / 100, Y: Math.round(Y * 100) / 100, label, missing: false };
  }, [signature]);

  // Layer Mix from actual vector slice sums
  const layerMix = useMemo(() => {
    const sumSlice = (start: number, end: number) =>
      signature.slice(start, end + 1).reduce((a, b) => a + b, 0);
    const p = sumSlice(0, 63);
    const d = sumSlice(64, 127);
    const s = sumSlice(128, 191);
    const sp = sumSlice(192, 255);
    const total = p + d + s + sp || 1;
    return {
      physical: Math.round((p / total) * 100),
      digital: Math.round((d / total) * 100),
      social: Math.round((s / total) * 100),
      spiritual: Math.round((sp / total) * 100),
    };
  }, [signature]);

  // Top dimensions for grid highlight
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

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left: Computed Identity Signals */}
        <div className="lg:w-1/2 space-y-5 shrink-0">
          {/* Soul Quadrant */}
          <div className="glass-card space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Quadrant Position</h3>
            {quadrant.missing ? (
              <p className="text-sm text-muted-foreground/50">Incomplete Axis</p>
            ) : (
              <div className="space-y-2">
                <div className="text-2xl font-bold text-foreground">{quadrant.label}</div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <p>X (Outcome ↔ Experience): {quadrant.X}</p>
                  <p>Y (Control ↔ Release): {quadrant.Y}</p>
                </div>
              </div>
            )}
          </div>

          {/* Identity Density */}
          <div className="glass-card space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Identity Density</h3>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-foreground">{identityDensity}%</span>
              <span className="text-xs text-muted-foreground mb-1">of 256 dimensions active</span>
            </div>
            <div className="h-2 bg-foreground/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${identityDensity}%`,
                  background: 'linear-gradient(90deg, rgba(40,180,160,0.3), rgba(40,180,160,0.7))',
                }}
              />
            </div>
          </div>

          {/* Layer Mix */}
          <div className="glass-card space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Layer Mix</h3>
            {[
              { label: 'Physical', value: layerMix.physical, color: 'rgba(200, 60, 60, 0.7)' },
              { label: 'Digital', value: layerMix.digital, color: 'rgba(60, 130, 200, 0.7)' },
              { label: 'Social', value: layerMix.social, color: 'rgba(200, 180, 40, 0.7)' },
              { label: 'Spiritual', value: layerMix.spiritual, color: 'rgba(40, 180, 160, 0.7)' },
            ].map(layer => (
              <div key={layer.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-foreground/70">{layer.label}</span>
                  <span className="text-muted-foreground">{layer.value}%</span>
                </div>
                <div className="h-1.5 bg-foreground/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${layer.value}%`, background: layer.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Twin Matrix Projection */}
        <div className="lg:w-1/2 flex flex-col items-center justify-center relative">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(40,180,160,0.12) 0%, rgba(40,180,160,0.04) 40%, transparent 70%)',
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none animate-[field-breathe_5s_ease-in-out_infinite]"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(40,180,160,0.08) 0%, transparent 60%)',
            }}
          />

          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 relative z-10">🧬 Twin Matrix Projection (256D)</h3>
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
                      const slice = getSliceForDim(idx);
                      // Highlight spiritual (206-209), social (155-156), digital (85-86)
                      const isHighlighted = [206, 207, 208, 209, 155, 156, 85, 86].includes(idx);
                      return (
                        <div
                          key={col}
                          className="w-5 h-5 rounded-sm flex items-center justify-center cursor-default relative transition-transform duration-150"
                          style={{
                            background: val > 0
                              ? `${slice.color}, ${0.04 + intensity * 0.5})`
                              : 'rgba(255, 255, 255, 0.015)',
                            boxShadow: isHighlighted && val > 0
                              ? `0 0 12px ${slice.color}, ${0.6}), 0 0 4px ${slice.color}, 0.3)`
                              : isTop
                              ? `0 0 10px ${slice.color}, ${0.5 + intensity * 0.4})`
                              : val > 180
                              ? `0 0 6px ${slice.color}, ${intensity * 0.35})`
                              : 'none',
                            transform: isHovered ? 'scale(1.15)' : 'scale(1)',
                          }}
                          onMouseEnter={() => setHoveredCell(idx)}
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          <span className="text-[6px] font-mono" style={{ color: `rgba(255,255,255, ${0.2 + intensity * 0.5})` }}>
                            {val.toString(16).toUpperCase().padStart(2, '0')}
                          </span>
                          {isHovered && (
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground/90 text-background text-[8px] px-1.5 py-0.5 rounded whitespace-nowrap z-10">
                              D{idx}: {val} ({slice.label})
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
