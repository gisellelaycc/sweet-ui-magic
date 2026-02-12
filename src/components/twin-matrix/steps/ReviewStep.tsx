interface Props {
  signature: number[];
  username: string;
  tags: string[];
  activeModules: string[];
  onNext: () => void;
}

export const ReviewStep = ({ signature, username, tags, activeModules, onNext }: Props) => {
  const axes = [
    { label: 'Discipline', value: (signature[0] ?? 128) / 2.55 },
    { label: 'Exploration', value: (signature[1] ?? 128) / 2.55 },
    { label: 'Resilience', value: (signature[2] ?? 128) / 2.55 },
    { label: 'Creativity', value: (signature[3] ?? 128) / 2.55 },
  ];

  const corePercent = 40;
  const topicPercent = activeModules.length * 10;
  const soulPercent = 100 - corePercent - topicPercent;

  return (
    <div className="animate-fade-in space-y-6 max-w-lg mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-1">Identity State</h2>
        <p className="text-muted-foreground text-sm">Your minted state at a glance</p>
      </div>

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

      <p className="text-xs text-center text-muted-foreground/50">@{username}</p>

      <button onClick={onNext} className="btn-twin btn-twin-primary btn-glow w-full py-3">
        Open Agent Studio →
      </button>
    </div>
  );
};
