import { useMemo } from 'react';

// Dimension definitions for the 256-dim vector
const DIMENSION_LABELS = [
  'Discipline', 'Exploration', 'Resilience', 'Creativity',
  'Endurance', 'Strategy', 'Empathy', 'Focus',
  'Ambition', 'Adaptability', 'Leadership', 'Patience',
  'Curiosity', 'Composure', 'Precision', 'Courage',
];

// Quadrant projection mapping
const QUADRANT_MAP: Record<string, { x: number; y: number }> = {
  Discipline: { x: -0.3, y: 0.8 },
  Exploration: { x: 0.7, y: 0.4 },
  Resilience: { x: -0.5, y: 0.6 },
  Creativity: { x: 0.6, y: -0.5 },
  Endurance: { x: -0.7, y: 0.3 },
  Strategy: { x: 0.2, y: 0.7 },
  Empathy: { x: 0.5, y: -0.7 },
  Focus: { x: -0.4, y: 0.5 },
  Ambition: { x: -0.6, y: 0.4 },
  Adaptability: { x: 0.4, y: 0.2 },
  Leadership: { x: -0.2, y: 0.6 },
  Patience: { x: 0.1, y: -0.3 },
  Curiosity: { x: 0.8, y: -0.2 },
  Composure: { x: -0.1, y: -0.6 },
  Precision: { x: -0.5, y: 0.2 },
  Courage: { x: 0.3, y: 0.5 },
};

interface Props {
  username: string;
  activeModules: string[];
  signature: number[];
  onNavigate: (id: string) => void;
}

export const MyIdentityPage = ({ username, activeModules, signature, onNavigate }: Props) => {
  const topDimensions = useMemo(() => {
    return DIMENSION_LABELS
      .map((label, i) => ({ label, value: signature[i] ?? Math.floor(Math.random() * 256) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [signature]);

  const corePercent = 40;
  const topicPercent = activeModules.length * 10;
  const soulPercent = Math.max(0, 100 - corePercent - topicPercent);

  return (
    <div className="animate-fade-in space-y-6 max-w-lg mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-1">Identity State</h2>
        <p className="text-muted-foreground text-sm">Your minted sovereign state</p>
      </div>

      {/* Identity Card */}
      <div className="glass-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">@{username || 'unnamed'}</p>
            <p className="text-xs text-green-400">● Active</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Layers</p>
            <p className="text-sm font-medium">{activeModules.length} active</p>
          </div>
        </div>
      </div>

      {/* Top N Dimensions */}
      <div className="glass-card space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Top Signals</h3>
        <div className="space-y-2">
          {topDimensions.map(dim => (
            <div key={dim.label} className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-foreground/60">{dim.label}</span>
                <span className="text-muted-foreground">{dim.value}</span>
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

      {/* Quadrant Visualization */}
      <div className="glass-card space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Identity Quadrant</h3>
        <div className="relative w-full aspect-square max-w-[280px] mx-auto">
          {/* Axes */}
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-foreground/10" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-foreground/10" />
          </div>
          {/* Labels */}
          <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground/50">Introvert</span>
          <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground/50">Extrovert</span>
          <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground/50">Rational</span>
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground/50">Emotional</span>

          {/* Dots */}
          {topDimensions.map(dim => {
            const pos = QUADRANT_MAP[dim.label] || { x: 0, y: 0 };
            const size = 6 + (dim.value / 255) * 18;
            const cx = 50 + pos.x * 40;
            const cy = 50 - pos.y * 40;
            return (
              <div
                key={dim.label}
                className="absolute rounded-full group"
                style={{
                  width: size,
                  height: size,
                  left: `${cx}%`,
                  top: `${cy}%`,
                  transform: 'translate(-50%, -50%)',
                  background: `rgba(40, 180, 160, ${0.3 + (dim.value / 255) * 0.5})`,
                  boxShadow: `0 0 ${size}px rgba(40, 180, 160, 0.3)`,
                }}
              >
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] text-foreground/50 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  {dim.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Composition */}
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
