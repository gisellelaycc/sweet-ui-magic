import { useMemo, useState, useEffect } from "react";
import { computeDensity } from "@/lib/twin-encoder";
import { StepLayout, StepContent, StepFooter } from '../StepLayout';
import { Dialog, DialogPortal, DialogOverlay, DialogContent } from "@/components/ui/dialog";
import { useI18n } from '@/lib/i18n';

const SLICES = [
  { label: "Physical", range: [0, 63], color: "255, 60, 100" },
  { label: "Digital", range: [64, 127], color: "60, 180, 255" },
  { label: "Social", range: [128, 191], color: "255, 200, 40" },
  { label: "Spiritual", range: [192, 255], color: "10, 255, 255" },
];

interface Props {
  signature: number[];
  username: string;
  tags: string[];
  activeModules: string[];
  onNext: () => void;
  onBack: () => void;
}

export const ReviewStep = ({ signature, username, activeModules, onNext, onBack }: Props) => {
  const { t } = useI18n();
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
      <StepContent>
        <div className="w-full">
          {/* Title */}
          <div className="mb-6">
            <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] tracking-tight mb-2">
              {t('review.title')}
            </h2>
            <p className="text-muted-foreground text-base md:text-lg">
              {t('review.subtitle')}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-center">
            {/* Left: Matrix — 60% */}
            <div className="lg:w-[60%] min-w-0">
              <div className="relative">
                <div className="absolute inset-0 pointer-events-none" style={{
                  background: "radial-gradient(ellipse at center, rgba(10,255,255,0.08) 0%, transparent 70%)",
                }} />
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 relative z-10">
                  {t('review.projection')}
                </h3>
                <div className="overflow-x-auto relative z-10">
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
                              let sliceIdx: number;
                              let localRow: number;
                              let localCol: number;
                              if (isTopHalf && isLeftHalf) { sliceIdx = 0; localRow = row; localCol = col; }
                              else if (isTopHalf && !isLeftHalf) { sliceIdx = 1; localRow = row; localCol = col - 8; }
                              else if (!isTopHalf && isLeftHalf) { sliceIdx = 2; localRow = row - 8; localCol = col; }
                              else { sliceIdx = 3; localRow = row - 8; localCol = col - 8; }
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
                                    width: "1.25rem", height: "1.25rem", aspectRatio: "1",
                                    background: val > 0 ? `rgba(${slice.color}, ${cellOpacity * 0.5})` : "rgba(255, 255, 255, 0.015)",
                                    boxShadow: isTop && val > 0
                                      ? `0 0 8px rgba(${slice.color}, ${cellOpacity * 0.6})`
                                      : val > 120 ? `0 0 6px rgba(${slice.color}, ${cellOpacity * 0.3})` : "none",
                                    transform: isHovered ? "scale(1.15)" : "scale(1)",
                                  }}
                                  onMouseEnter={() => setHoveredCell(idx)}
                                  onMouseLeave={() => setHoveredCell(null)}
                                >
                                  <span className="text-[5px] font-mono" style={{ color: `rgba(255,255,255, ${0.15 + intensity * 0.55})` }}>
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
                <p className="text-xs text-muted-foreground/50 mt-3">@{username}</p>
              </div>
            </div>

            {/* Right: 3 data sections — 40%, no glass cards, vertically centered */}
            <div className="lg:w-[40%] space-y-6">
              {/* Soul Quadrant */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t('review.quadrant')}</h3>
                {quadrant.missing ? (
                  <p className="text-sm text-muted-foreground/50">{t('review.incompleteAxis')}</p>
                ) : (
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-foreground">{quadrant.label}</div>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <p>X (Outcome ↔ Experience): {quadrant.X}</p>
                      <p>Y (Control ↔ Release): {quadrant.Y}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />

              {/* Identity Density */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t('review.density')}</h3>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-foreground">{identityDensity}%</span>
                  <span className="text-xs text-muted-foreground mb-1">{t('review.densityOf')}</span>
                </div>
                <div className="h-[3px] bg-transparent rounded-full overflow-visible">
                  <div className="h-full rounded-full transition-all duration-700" style={{
                    width: `${identityDensity}%`,
                    background: "rgba(10, 255, 255, 0.5)",
                    boxShadow: "0 0 6px rgba(10, 255, 255, 0.5), 0 0 14px rgba(10, 255, 255, 0.25)",
                  }} />
                </div>
              </div>

              <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />

              {/* Layer Mix */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t('review.layerMix')}</h3>
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
                    <div className="h-[3px] bg-transparent rounded-full overflow-visible">
                      <div className="h-full rounded-full transition-all duration-700" style={{
                        width: `${layer.value}%`,
                        background: `rgba(${layer.color}, 0.6)`,
                        boxShadow: `0 0 5px rgba(${layer.color}, 0.6), 0 0 12px rgba(${layer.color}, 0.3)`,
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA centered */}
          <div className="flex gap-2 max-w-[420px] mx-auto mt-8">
            <button onClick={onBack} className="btn-twin btn-twin-ghost flex-1 py-2.5 text-sm">
              {t('review.refine')}
            </button>
            <button onClick={() => { setShowWallet(true); setWalletPhase('connect'); }} className="btn-twin btn-twin-primary btn-glow flex-1 py-2.5 text-sm">
              {t('review.commitState')}
            </button>
          </div>
        </div>
      </StepContent>

      <Dialog open={showWallet} onOpenChange={() => {}}>
        <DialogPortal>
          <DialogOverlay
            className="bg-transparent"
            style={{
              background: 'rgba(0, 0, 0, 0.55)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          />
          <div
            className="fixed left-[50%] top-[50%] z-50 w-full max-w-sm translate-x-[-50%] translate-y-[-50%] overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
            style={{
              background: 'rgba(20, 22, 26, 0.65)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
            }}
          >
            <WalletAnimation phase={walletPhase} setPhase={setWalletPhase} onComplete={onNext} />
          </div>
        </DialogPortal>
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
  const { t } = useI18n();
  useEffect(() => {
    if (phase === 'connect') {
      const timer = setTimeout(() => setPhase('signing'), 1800);
      return () => clearTimeout(timer);
    }
    if (phase === 'signing') {
      const timer = setTimeout(() => setPhase('confirmed'), 2500);
      return () => clearTimeout(timer);
    }
    if (phase === 'confirmed') {
      const timer = setTimeout(() => onComplete(), 1500);
      return () => clearTimeout(timer);
    }
  }, [phase, setPhase, onComplete]);

  return (
    <div className="flex flex-col items-center text-center px-6 py-8 space-y-6">
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-white">
          {phase === 'connect' && t('review.committing')}
          {phase === 'signing' && t('review.awaiting')}
          {phase === 'confirmed' && t('review.committed')}
        </h3>
        <p className="text-xs text-white/40 leading-relaxed">
          {phase === 'connect' && t('review.preparing')}
          {phase === 'signing' && t('review.confirmSig')}
          {phase === 'confirmed' && t('review.sealed')}
        </p>
      </div>

      {/* Icon + Loading Ring */}
      <div className="relative w-14 h-14 mx-auto">
        <div
          className={`absolute inset-0 rounded-full border ${phase === 'confirmed' ? 'border-white/20' : 'border-white/10 animate-spin'}`}
          style={{ animationDuration: '3s', borderTopColor: phase !== 'confirmed' ? 'rgba(255,255,255,0.5)' : undefined }}
        />
        <div className="absolute inset-2 rounded-full flex items-center justify-center">
          {phase === 'confirmed' ? (
            <svg className="w-7 h-7 text-white animate-scale-in" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          )}
        </div>
      </div>

      {/* Info rows — no card wrapper */}
      {phase !== 'connect' && (
        <div className="animate-fade-in space-y-2.5 w-full text-left">
          <div className="flex justify-between text-[11px]">
            <span className="text-white/30">{t('review.network')}</span>
            <span className="text-white/60">Twin3 Sovereign Layer</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-white/30">{t('review.action')}</span>
            <span className="text-white/60 font-mono">commitIdentityState()</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-white/30">{t('review.gas')}</span>
            <span className="text-white/60">0.00 (Gasless)</span>
          </div>
        </div>
      )}

      {/* Thin progress line */}
      <div className="h-[1px] w-full bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all ease-linear"
          style={{
            width: phase === 'connect' ? '33%' : phase === 'signing' ? '66%' : '100%',
            transitionDuration: phase === 'connect' ? '1.8s' : phase === 'signing' ? '2.5s' : '0.5s',
            background: 'linear-gradient(90deg, rgba(10,255,255,0.4), rgba(10,255,255,0.8))',
            boxShadow: '0 0 6px rgba(10,255,255,0.4)',
          }}
        />
      </div>
    </div>
  );
}
