import { useEffect, useState, useMemo } from 'react';

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

// Generate a deterministic-looking but random 256 grid
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
      setGridValues(generateGridState(activePhase, progress));
    }, 200);
    return () => clearInterval(interval);
  }, [activePhase, progress, finalSignature]);

  const isDone = progress >= 100;

  // Row labels in hex
  const rowLabels = useMemo(() => 
    Array.from({ length: 16 }, (_, i) => (i * 16).toString(16).toUpperCase().padStart(4, '0')), 
  []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-fade-in px-4">
      {/* Phase indicator */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-0.5">{PHASES[activePhase]?.label}</h2>
        <p className="text-xs text-muted-foreground">{PHASES[activePhase]?.desc}</p>
      </div>

      {/* 16x16 Grid */}
      <div className="glass-card p-4 mb-6 overflow-hidden">
        <div className="flex flex-col gap-px">
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
                  return (
                    <div
                      key={col}
                      className="w-5 h-5 rounded-sm flex items-center justify-center transition-all duration-300 relative group"
                      style={{
                        background: val > 0
                          ? `rgba(40, 180, 160, ${0.08 + intensity * 0.45})`
                          : 'rgba(255, 255, 255, 0.03)',
                        boxShadow: val > 200 ? `0 0 6px rgba(40, 180, 160, ${intensity * 0.4})` : 'none',
                      }}
                    >
                      {showNumber && (
                        <span className="text-[6px] font-mono text-foreground/60">
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
      </div>

      {/* Phase Nodes */}
      <div className="flex gap-2 mb-4">
        {PHASES.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-500 ${
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
