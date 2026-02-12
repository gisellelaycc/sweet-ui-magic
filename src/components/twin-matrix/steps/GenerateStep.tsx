import { useEffect, useState } from 'react';

interface Props {
  onComplete: (signature: number[]) => void;
}

const PHASES = [
  { label: 'Signal Normalization', desc: 'Integrating and standardizing your identity signals.' },
  { label: 'Dimension Projection', desc: 'Mapping signals into 256-dimension identity space.' },
  { label: 'Weight Aggregation', desc: 'Computing intensity and layer proportions.' },
  { label: 'Matrix Encoding', desc: 'Encoding into 0–255 vector format.' },
  { label: 'Twin Matrix Commit', desc: 'Writing your Twin Matrix identity structure.' },
];

export const GenerateStep = ({ onComplete }: Props) => {
  const [activePhase, setActivePhase] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalDuration = 6000; // 6s total
    const phaseInterval = totalDuration / PHASES.length;

    const phaseTimer = setInterval(() => {
      setActivePhase(p => {
        const next = p + 1;
        if (next >= PHASES.length) {
          clearInterval(phaseTimer);
        }
        return Math.min(next, PHASES.length - 1);
      });
    }, phaseInterval);

    const progressTimer = setInterval(() => {
      setProgress(p => {
        const next = Math.min(p + 1.2, 100);
        if (next >= 100) {
          clearInterval(progressTimer);
          // Generate 256-dim signature
          const sig = Array.from({ length: 256 }, () => Math.floor(Math.random() * 256));
          setTimeout(() => onComplete(sig), 600);
        }
        return next;
      });
    }, 60);

    return () => {
      clearInterval(phaseTimer);
      clearInterval(progressTimer);
    };
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-fade-in px-4">
      {/* Phase Nodes */}
      <div className="w-full max-w-xs space-y-4 mb-10">
        {PHASES.map((phase, i) => {
          const isActive = i === activePhase;
          const isDone = i < activePhase || progress >= 100;
          return (
            <div
              key={i}
              className={`flex items-start gap-3 transition-all duration-500 ${
                isDone ? 'opacity-50' : isActive ? 'opacity-100' : 'opacity-20'
              }`}
            >
              <div className="flex flex-col items-center mt-1">
                <div
                  className={`w-3 h-3 rounded-full border transition-all duration-500 ${
                    isDone
                      ? 'bg-green-400/60 border-green-400/40'
                      : isActive
                      ? 'bg-foreground/60 border-foreground/40 animate-glow-pulse'
                      : 'bg-foreground/10 border-foreground/10'
                  }`}
                />
                {i < PHASES.length - 1 && (
                  <div className={`w-px h-6 transition-colors duration-500 ${isDone ? 'bg-green-400/30' : 'bg-foreground/10'}`} />
                )}
              </div>
              <div>
                <p className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-foreground/60'}`}>
                  {phase.label}
                </p>
                {isActive && (
                  <p className="text-xs text-muted-foreground mt-0.5 animate-fade-in">{phase.desc}</p>
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
