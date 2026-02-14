import { useMemo, useState, useEffect, useCallback } from "react";
import { computeDensity } from "@/lib/twin-encoder";
import { StepLayout, StepHeader, StepContent, StepFooter } from '../StepLayout';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import lobsterIcon from "@/assets/lobster-icon.png";

// Updated color strategy per spec
const SLICES = [
  { label: "Physical", range: [0, 63], color: "255, 60, 100" },
  { label: "Digital", range: [64, 127], color: "60, 180, 255" },
  { label: "Social", range: [128, 191], color: "255, 200, 40" },
  { label: "Spiritual", range: [192, 255], color: "10, 255, 255" },
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
  onBack: () => void;
}

export const ReviewStep = ({ signature, username, activeModules, onNext, onBack }: Props) => {
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);
  const [showWallet, setShowWallet] = useState(false);
  const [walletPhase, setWalletPhase] = useState<'connect' | 'signing' | 'confirmed'>('connect');

  const identityDensity = useMemo(() => computeDensity(signature), [signature]);

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
    <StepLayout>
      <StepHeader>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-1">Identity Preview</h2>
          <p className="text-muted-foreground text-sm">Not yet sealed. Review before recording.</p>
        </div>
      </StepHeader>

      <StepContent>
        <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">

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
            <div className="h-1.5 bg-transparent rounded-full overflow-visible">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${identityDensity}%`,
                  background: "rgba(10, 255, 255, 0.5)",
                  boxShadow: "0 0 8px rgba(10, 255, 255, 0.6), 0 0 20px rgba(10, 255, 255, 0.3), 0 0 40px rgba(10, 255, 255, 0.1)",
                }}
              />
            </div>
          </div>

          {/* Layer Mix */}
          <div className="glass-card space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Layer Mix</h3>
            {[
              { label: "Physical", value: layerMix.physical, color: "255, 60, 100" },
              { label: "Digital", value: layerMix.digital, color: "60, 180, 255" },
              { label: "Social", value: layerMix.social, color: "255, 200, 40" },
              { label: "Spiritual", value: layerMix.spiritual, color: "10, 255, 255" },
            ].map((layer) => (
              <div key={layer.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-foreground/70">{layer.label}</span>
                  <span className="text-muted-foreground">{layer.value}%</span>
                </div>
                <div className="h-1.5 bg-transparent rounded-full overflow-visible">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${layer.value}%`,
                      background: `rgba(${layer.color}, 0.6)`,
                      boxShadow: `0 0 6px rgba(${layer.color}, 0.7), 0 0 16px rgba(${layer.color}, 0.35), 0 0 32px rgba(${layer.color}, 0.12)`,
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
                "radial-gradient(ellipse at center, rgba(10,255,255,0.08) 0%, rgba(10,255,255,0.02) 40%, transparent 70%)",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none animate-[field-breathe_5s_ease-in-out_infinite]"
            style={{
              background: "radial-gradient(ellipse at center, rgba(10,255,255,0.05) 0%, transparent 60%)",
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
        </div>
      </StepContent>

      <StepFooter>
        <div className="flex gap-2">
          <button onClick={onBack} className="btn-twin btn-twin-ghost flex-1 py-2.5 text-sm">
            Refine
          </button>
          <button onClick={() => { setShowWallet(true); setWalletPhase('connect'); }} className="btn-twin btn-twin-primary btn-glow flex-1 py-2.5 text-sm">
            Commit State
          </button>
        </div>
      </StepFooter>

      <Dialog open={showWallet} onOpenChange={() => {}}>
        <DialogContent className="max-w-sm border-foreground/10 bg-[#1a1a2e] p-0 overflow-hidden [&>button]:hidden" onPointerDownOutside={e => e.preventDefault()}>
          <WalletAnimation phase={walletPhase} setPhase={setWalletPhase} onComplete={onNext} />
        </DialogContent>
      </Dialog>
    </StepLayout>
  );
};

/* ─── Wallet Signature Animation Component ─── */
function WalletAnimation({
  phase,
  setPhase,
  onComplete,
}: {
  phase: 'connect' | 'signing' | 'confirmed';
  setPhase: (p: 'connect' | 'signing' | 'confirmed') => void;
  onComplete: () => void;
}) {
  useEffect(() => {
    if (phase === 'connect') {
      const t = setTimeout(() => setPhase('signing'), 1800);
      return () => clearTimeout(t);
    }
    if (phase === 'signing') {
      const t = setTimeout(() => setPhase('confirmed'), 2500);
      return () => clearTimeout(t);
    }
    if (phase === 'confirmed') {
      const t = setTimeout(() => onComplete(), 1500);
      return () => clearTimeout(t);
    }
  }, [phase, setPhase, onComplete]);

  return (
    <div className="flex flex-col items-center text-center">
      {/* Header bar */}
      <div className="w-full flex items-center justify-between px-4 py-3 border-b border-foreground/10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full overflow-hidden">
            <img src={lobsterIcon} alt="wallet" className="w-full h-full object-cover" />
          </div>
          <span className="text-xs font-medium text-foreground/80">Twin3 Wallet</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${phase === 'confirmed' ? 'bg-green-400' : 'bg-cyan-400 animate-pulse'}`} />
          <span className="text-[10px] text-foreground/50">
            {phase === 'connect' ? 'Connecting…' : phase === 'signing' ? 'Awaiting…' : 'Connected'}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-8 space-y-6">
        {/* Icon area */}
        <div className="relative w-16 h-16 mx-auto">
          {/* Outer ring */}
          <div
            className={`absolute inset-0 rounded-full border-2 ${
              phase === 'confirmed'
                ? 'border-green-400/60'
                : 'border-cyan-400/30 animate-spin'
            }`}
            style={{
              animationDuration: '3s',
              borderTopColor: phase !== 'confirmed' ? 'rgba(10, 255, 255, 0.8)' : undefined,
            }}
          />
          {/* Inner glow */}
          <div
            className="absolute inset-2 rounded-full flex items-center justify-center"
            style={{
              background: phase === 'confirmed'
                ? 'radial-gradient(circle, rgba(74, 222, 128, 0.2) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(10, 255, 255, 0.15) 0%, transparent 70%)',
            }}
          >
            {phase === 'confirmed' ? (
              <svg className="w-8 h-8 text-green-400 animate-scale-in" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg className="w-7 h-7 text-cyan-400/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            )}
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-foreground">
            {phase === 'connect' && 'Committing your identity…'}
            {phase === 'signing' && 'Awaiting wallet signature'}
            {phase === 'confirmed' && 'Identity Committed'}
          </h3>
          <p className="text-xs text-foreground/40 leading-relaxed">
            {phase === 'connect' && 'Preparing state for on-chain commitment.'}
            {phase === 'signing' && 'Please confirm the signature request.'}
            {phase === 'confirmed' && 'Your identity state has been sealed.'}
          </p>
        </div>

        {/* Fake transaction details */}
        {phase !== 'connect' && (
          <div className="animate-fade-in space-y-2 bg-foreground/5 rounded-lg p-3 text-left">
            <div className="flex justify-between text-[10px]">
              <span className="text-foreground/30">Network</span>
              <span className="text-foreground/60">Twin3 Sovereign Layer</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-foreground/30">Action</span>
              <span className="text-foreground/60">commitIdentityState()</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-foreground/30">Gas</span>
              <span className="text-foreground/60">0.00 (Gasless)</span>
            </div>
          </div>
        )}

        {/* Progress bar */}
        <div className="h-[2px] w-full bg-foreground/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all ease-linear"
            style={{
              width: phase === 'connect' ? '33%' : phase === 'signing' ? '66%' : '100%',
              transitionDuration: phase === 'connect' ? '1.8s' : phase === 'signing' ? '2.5s' : '0.5s',
              background: phase === 'confirmed'
                ? 'rgba(74, 222, 128, 0.7)'
                : 'rgba(10, 255, 255, 0.6)',
              boxShadow: phase === 'confirmed'
                ? '0 0 10px rgba(74, 222, 128, 0.5)'
                : '0 0 10px rgba(10, 255, 255, 0.4)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
