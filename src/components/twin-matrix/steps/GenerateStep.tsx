import { useEffect, useState, useMemo, useRef } from 'react';
import type { WizardState } from '@/types/twin-matrix';
import { encodeIdentityVector } from '@/lib/twin-encoder';

interface Props {
  wizardState: WizardState;
  onComplete: (signature: number[]) => void;
}

const PHASES = [
  { label: 'Signal Normalization', desc: 'Integrating and standardizing your identity signals.' },
  { label: 'Dimension Projection', desc: 'Projecting signals into a 256-dimensional identity space.' },
  { label: 'Weight Aggregation', desc: 'Calculating dimension intensity and layer distribution.' },
  { label: 'Matrix Encoding', desc: 'Encoding into 0–255 vector format.' },
  { label: 'Vector Finalization', desc: 'Generating structured identity fingerprint.' },
  { label: 'Twin Matrix Commit', desc: 'Writing your identity into Twin Matrix.' },
];

function generateGridState(phase: number, progress: number): number[] {
  const grid = new Array(256).fill(0);
  const filled = Math.floor((progress / 100) * 256);
  for (let i = 0; i < filled; i++) {
    grid[i] = Math.floor(Math.random() * 256);
  }
  return grid;
}

export const GenerateStep = ({ wizardState, onComplete }: Props) => {
  const [activePhase, setActivePhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const [gridValues, setGridValues] = useState<number[]>(new Array(256).fill(0));
  const [finalSignature, setFinalSignature] = useState<number[] | null>(null);
  const prevGridRef = useRef<number[]>(new Array(256).fill(0));
  const [changedCells, setChangedCells] = useState<Set<number>>(new Set());
  // For fade transition between phases
  const [displayPhase, setDisplayPhase] = useState(0);
  const [phaseVisible, setPhaseVisible] = useState(true);

  useEffect(() => {
    const totalDuration = 6000;
    const phaseInterval = totalDuration / PHASES.length;

    const phaseTimer = setInterval(() => {
      setActivePhase(p => {
        const next = p + 1;
        if (next >= PHASES.length) clearInterval(phaseTimer);
        return Math.min(next, PHASES.length - 1);
      });
    }, phaseInterval);

    const progressTimer = setInterval(() => {
      setProgress(p => {
        const next = Math.min(p + 1.2, 100);
        if (next >= 100) {
          clearInterval(progressTimer);
          // Use deterministic encoder instead of random
          const result = encodeIdentityVector(wizardState);
          const sig = result.signature ?? Array.from({ length: 256 }, () => 0);
          setFinalSignature(sig);
          setGridValues(sig);
          // Mark all cells as changed for final flash
          setChangedCells(new Set(Array.from({ length: 256 }, (_, i) => i)));
          setTimeout(() => onComplete(sig), 3000);
        }
        return next;
      });
    }, 60);

    return () => {
      clearInterval(phaseTimer);
      clearInterval(progressTimer);
    };
  }, [onComplete]);

  // Fade out → swap text → fade in when phase changes
  useEffect(() => {
    if (activePhase === displayPhase) return;
    setPhaseVisible(false); // fade out
    const t = setTimeout(() => {
      setDisplayPhase(activePhase); // swap text
      setPhaseVisible(true); // fade in
    }, 400);
    return () => clearTimeout(t);
  }, [activePhase, displayPhase]);

  // Update grid visualization per phase
  useEffect(() => {
    if (finalSignature) return;
    const interval = setInterval(() => {
      const newGrid = generateGridState(activePhase, progress);
      const changed = new Set<number>();
      for (let i = 0; i < 256; i++) {
        if (newGrid[i] !== prevGridRef.current[i] && newGrid[i] > 0) {
          changed.add(i);
        }
      }
      prevGridRef.current = newGrid;
      setChangedCells(changed);
      setGridValues(newGrid);
    }, 200);
    return () => clearInterval(interval);
  }, [activePhase, progress, finalSignature]);

  // Clear changed cells after animation
  useEffect(() => {
    if (changedCells.size === 0) return;
    const t = setTimeout(() => setChangedCells(new Set()), 400);
    return () => clearTimeout(t);
  }, [changedCells]);

  const isDone = progress >= 100;

  const rowLabels = useMemo(() =>
    Array.from({ length: 16 }, (_, i) => (i * 16).toString(16).toUpperCase().padStart(4, '0')),
  []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-fade-in px-4">
      {/* Phase label - centered above grid with fade animation */}
      <div
        className="mb-5 h-12 flex flex-col items-center justify-center"
        style={{
          opacity: phaseVisible ? 1 : 0,
          transform: phaseVisible ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.4s ease, transform 0.4s ease',
        }}
      >
        <h2 className="text-base font-semibold tracking-tight">{PHASES[displayPhase]?.label}</h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">{PHASES[displayPhase]?.desc}</p>
      </div>

      {/* 16x16 Grid - Energy Field */}
      <div className="relative mb-6 p-4">
        {/* Radial glow background */}
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
        <div className="flex flex-col gap-px relative z-10">
          {Array.from({ length: 16 }, (_, row) => (
            <div key={row} className="flex items-center gap-1">
              <span className="text-[8px] text-muted-foreground/40 font-mono w-8 text-right shrink-0">
                {rowLabels[row]}
              </span>
              <div className="flex gap-px">
                {Array.from({ length: 16 }, (_, col) => {
                  const idx = row * 16 + col;
                  const val = gridValues[idx];
                  const intensity = val / 255;
                  const showNumber = activePhase >= 3 && val > 0;
                  const justChanged = changedCells.has(idx);
                  return (
                    <div
                      key={col}
                      className="rounded-sm flex items-center justify-center relative"
                      style={{
                        width: 20,
                        height: 20,
                        aspectRatio: '1',
                        background: val > 0
                          ? `rgba(40, 200, 180, ${(0.25 + 0.75 * intensity) * 0.4})`
                          : 'rgba(255, 255, 255, 0.015)',
                        boxShadow: justChanged
                          ? `0 0 10px rgba(40, 200, 180, 0.5), 0 0 20px rgba(40, 200, 180, 0.2)`
                          : val > 150
                          ? `0 0 6px rgba(40, 200, 180, ${intensity * 0.3})`
                          : 'none',
                        transform: justChanged ? 'scale(1.2)' : 'scale(1)',
                        transition: 'all 0.35s ease-out',
                      }}
                    >
                      {showNumber && (
                        <span
                          className="text-[6px] font-mono"
                          style={{
                            color: `rgba(255,255,255, ${0.2 + intensity * 0.5})`,
                            opacity: justChanged ? 1 : 0.8,
                            transition: 'opacity 0.3s',
                          }}
                        >
                          {val.toString(16).toUpperCase().padStart(2, '0')}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {/* Bottom fade-out */}
        <div className="w-full h-6 mt-1 pointer-events-none relative z-10" style={{ background: 'linear-gradient(to bottom, transparent, hsl(var(--background)))' }} />
      </div>

      {/* Phase dots */}
      <div className="flex gap-2 mb-4">
        {PHASES.map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
              i < activePhase || isDone
                ? 'bg-[rgba(40,180,160,0.6)]'
                : i === activePhase
                ? 'bg-foreground/60 animate-glow-pulse'
                : 'bg-foreground/10'
            }`}
          />
        ))}
      </div>

      {/* Progress */}
      <div className="w-64 h-1.5 bg-transparent rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-200"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, rgba(40,180,160,0.5), rgba(40,180,160,0.8))',
          }}
        />
      </div>
      <p className="text-xs text-muted-foreground/50 mt-2">{Math.round(progress)}%</p>
    </div>
  );
};
