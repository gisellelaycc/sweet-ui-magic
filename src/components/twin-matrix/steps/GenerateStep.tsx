import { useEffect, useState, useMemo, useRef } from 'react';

interface Props {
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

export const GenerateStep = ({ onComplete }: Props) => {
  const [activePhase, setActivePhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const [gridValues, setGridValues] = useState<number[]>(new Array(256).fill(0));
  const [finalSignature, setFinalSignature] = useState<number[] | null>(null);
  // Track which cells just changed for pulse animation
  const prevGridRef = useRef<number[]>(new Array(256).fill(0));
  const [changedCells, setChangedCells] = useState<Set<number>>(new Set());

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
          const sig = Array.from({ length: 256 }, () => Math.floor(Math.random() * 256));
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
      {/* Current phase title */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-0.5">{PHASES[activePhase]?.label}</h2>
        <p className="text-xs text-muted-foreground">{PHASES[activePhase]?.desc}</p>
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
                      className="w-5 h-5 rounded-sm flex items-center justify-center relative"
                      style={{
                        background: val > 0
                          ? `rgba(40, 180, 160, ${0.04 + intensity * 0.5})`
                          : 'rgba(255, 255, 255, 0.015)',
                        boxShadow: justChanged
                          ? `0 0 12px rgba(40, 180, 160, 0.7), 0 0 4px rgba(40, 180, 160, 0.4)`
                          : val > 200
                          ? `0 0 8px rgba(40, 180, 160, ${intensity * 0.4})`
                          : val > 120
                          ? `0 0 3px rgba(40, 180, 160, ${intensity * 0.15})`
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

      {/* Phase checklist */}
      <div className="w-72 text-left space-y-1.5 mb-5">
        {PHASES.map((phase, i) => {
          const isCompleted = i < activePhase || isDone;
          const isActive = i === activePhase && !isDone;
          return (
            <div
              key={i}
              className="flex items-center gap-2.5 transition-all duration-300"
              style={{ opacity: isCompleted ? 0.45 : isActive ? 1 : 0.2 }}
            >
              <div
                className={`w-2 h-2 rounded-full shrink-0 transition-all duration-500 ${
                  isCompleted
                    ? 'bg-[rgba(40,180,160,0.6)]'
                    : isActive
                    ? 'bg-foreground/60 animate-glow-pulse'
                    : 'bg-foreground/10'
                }`}
              />
              <div className="min-w-0">
                <p className={`text-[11px] font-medium leading-tight ${isActive ? 'text-foreground' : 'text-foreground/60'}`}>
                  {phase.label}
                </p>
                {isActive && (
                  <p className="text-[9px] text-muted-foreground leading-tight mt-0.5">{phase.desc}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress */}
      <div className="w-64 h-1.5 bg-foreground/5 rounded-full overflow-hidden">
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
