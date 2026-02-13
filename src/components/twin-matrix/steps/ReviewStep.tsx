import { useMemo, useState } from "react";

// Updated color strategy per spec
const SLICES = [
  { label: "Physical", range: [0, 63], color: "120, 50, 50" }, // low-saturation dark gray-red
  { label: "Digital", range: [64, 127], color: "80, 140, 210" }, // cool blue
  { label: "Social", range: [128, 191], color: "160, 170, 80" }, // muted yellow-green
  { label: "Spiritual", range: [192, 255], color: "40, 200, 180" }, // brightest teal/cyan
];

function getSliceForDim(idx: number): (typeof SLICES)[number] {
  return SLICES.find((s) => idx >= s.range[0] && idx <= s.range[1]) || SLICES[0];
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

  const identityDensity = useMemo(() => {
    const nonZero = signature.filter((v) => v > 0).length;
    return Math.round((nonZero / 256) * 100);
  }, [signature]);

  const quadrant = useMemo(() => {
    const x206 = signature[206] ?? 0;
    const x207 = signature[207] ?? 0;
    const x208 = signature[208] ?? 0;
    const x209 = signature[209] ?? 0;
    const X = (x206 - x207) / 255;
    const Y = (x208 - x209) / 255;
    const missing = x206 === 0 && x207 === 0 && x208 === 0 && x209 === 0;
    if (missing) return { X: 0, Y: 0, label: "—", missing: true };
    let label = "ON_AXIS";
    if (X > 0.05 && Y > 0.05) label = "Q1";
    else if (X < -0.05 && Y > 0.05) label = "Q2";
    else if (X < -0.05 && Y < -0.05) label = "Q3";
    else if (X > 0.05 && Y < -0.05) label = "Q4";
    return { X: Math.round(X * 100) / 100, Y: Math.round(Y * 100) / 100, label, missing: false };
  }, [signature]);

  const layerMix = useMemo(() => {
    const sumSlice = (start: number, end: number) => signature.slice(start, end + 1).reduce((a, b) => a + b, 0);
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

  const topIndices = useMemo(() => {
    const sorted = signature.map((val, idx) => ({ val, idx })).sort((a, b) => b.val - a.val);
    return new Set(sorted.slice(0, 12).map((d) => d.idx));
  }, [signature]);

  return (
    <div className="animate-fade-in space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-1">Identity State</h2>
        <p className="text-muted-foreground text-sm">Your minted state at a glance</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        {/* Left: Computed Identity Signals */}
        <div className="lg:w-1/2 space-y-5">
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
            <div className="h-1.5 bg-foreground/[0.04] rounded-full overflow-visible">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${identityDensity}%`,
                  background: "rgba(40, 200, 180, 0.3)",
                  boxShadow: "0 0 12px rgba(40, 200, 180, 0.35), 0 0 24px rgba(40, 200, 180, 0.12)",
                }}
              />
            </div>
          </div>

          {/* Layer Mix */}
          <div className="glass-card space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Layer Mix</h3>
            {[
              { label: "Physical", value: layerMix.physical, color: "120, 50, 50" },
              { label: "Digital", value: layerMix.digital, color: "80, 140, 210" },
              { label: "Social", value: layerMix.social, color: "160, 170, 80" },
              { label: "Spiritual", value: layerMix.spiritual, color: "40, 200, 180" },
            ].map((layer) => (
              <div key={layer.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-foreground/70">{layer.label}</span>
                  <span className="text-muted-foreground">{layer.value}%</span>
                </div>
                <div className="h-1.5 bg-foreground/[0.04] rounded-full overflow-visible">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${layer.value}%`,
                      background: `rgba(${layer.color}, 0.35)`,
                      boxShadow: `0 0 10px rgba(${layer.color}, 0.3), 0 0 20px rgba(${layer.color}, 0.1)`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Twin Matrix Projection — 16×16 square with 4 quadrants */}
        <div className="lg:w-1/2 flex flex-col items-center justify-center relative">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(40,200,180,0.10) 0%, rgba(40,200,180,0.03) 40%, transparent 70%)",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none animate-[field-breathe_5s_ease-in-out_infinite]"
            style={{
              background: "radial-gradient(ellipse at center, rgba(40,200,180,0.06) 0%, transparent 60%)",
            }}
          />

          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 relative z-10">
            Twin Matrix Projection (256D)
          </h3>
          <div className="overflow-x-auto relative z-10">
            {/* 16×16 grid: quadrants TL=Physical, TR=Digital, BL=Social, BR=Spiritual */}
            <div className="flex flex-col min-w-fit">
              {Array.from({ length: 16 }, (_, row) => {
                const isTopHalf = row < 8;
                return (
                  <div key={row} className={`flex items-center gap-1 ${row === 8 ? "mt-2" : "mb-px"}`}>
                    <span className="text-[7px] text-muted-foreground/25 font-mono w-7 text-right shrink-0">
                      {(row * 16).toString(16).toUpperCase().padStart(4, "0")}
                    </span>
                    <div className="flex gap-px">
                      {Array.from({ length: 16 }, (_, col) => {
                        const isLeftHalf = col < 8;
                        // Map quadrant to slice: TL=Physical, TR=Digital, BL=Social, BR=Spiritual
                        let sliceIdx: number;
                        let localRow: number;
                        let localCol: number;
                        if (isTopHalf && isLeftHalf) {
                          sliceIdx = 0; localRow = row; localCol = col;
                        } else if (isTopHalf && !isLeftHalf) {
                          sliceIdx = 1; localRow = row; localCol = col - 8;
                        } else if (!isTopHalf && isLeftHalf) {
                          sliceIdx = 2; localRow = row - 8; localCol = col;
                        } else {
                          sliceIdx = 3; localRow = row - 8; localCol = col - 8;
                        }
                        const slice = SLICES[sliceIdx];
                        const idx = slice.range[0] + localRow * 8 + localCol;
                        const val = signature[idx] ?? 0;
                        const intensity = val / 255;
                        const isTop = topIndices.has(idx);
                        const isHovered = hoveredCell === idx;
                        const cellOpacity = val > 0 ? 0.25 + 0.75 * intensity : 0.03;
                        return (
                          <div
                            key={col}
                            className={`rounded-sm flex items-center justify-center cursor-default relative transition-transform duration-150 ${col === 8 ? "ml-1" : ""}`}
                            style={{
                              width: "1.25rem",
                              height: "1.25rem",
                              aspectRatio: "1",
                              background:
                                val > 0
                                  ? `rgba(${slice.color}, ${cellOpacity * 0.5})`
                                  : "rgba(255, 255, 255, 0.015)",
                              boxShadow:
                                isTop && val > 0
                                  ? `0 0 8px rgba(${slice.color}, ${cellOpacity * 0.6}), 0 0 16px rgba(${slice.color}, ${cellOpacity * 0.25})`
                                  : val > 120
                                    ? `0 0 6px rgba(${slice.color}, ${cellOpacity * 0.3})`
                                    : "none",
                              transform: isHovered ? "scale(1.15)" : "scale(1)",
                            }}
                            onMouseEnter={() => setHoveredCell(idx)}
                            onMouseLeave={() => setHoveredCell(null)}
                          >
                            <span
                              className="text-[6px] font-mono"
                              style={{ color: `rgba(255,255,255, ${0.15 + intensity * 0.55})` }}
                            >
                              {val.toString(16).toUpperCase().padStart(2, "0")}
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
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-center text-muted-foreground/50">@{username}</p>

      <button onClick={onNext} className="btn-twin btn-twin-primary btn-glow w-full py-3">
        Open Agent Studio →
      </button>
    </div>
  );
};
