interface Props {
  username: string;
  tags: string[];
  activeModules: string[];
  signature: string[];
  onNavigate: (id: string) => void;
}

export const MyIdentityPage = ({ username, tags, activeModules, signature, onNavigate }: Props) => {
  const axes = [
    { label: 'Discipline', value: parseInt(signature[0] || '80', 16) / 2.55 },
    { label: 'Exploration', value: parseInt(signature[1] || '60', 16) / 2.55 },
    { label: 'Resilience', value: parseInt(signature[2] || '70', 16) / 2.55 },
    { label: 'Creativity', value: parseInt(signature[3] || '50', 16) / 2.55 },
  ];

  const corePercent = 40;
  const topicPercent = activeModules.length * 10;
  const soulPercent = Math.max(0, 100 - corePercent - topicPercent);

  return (
    <div className="animate-fade-in space-y-6 max-w-lg mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-1">My Identity</h2>
        <p className="text-muted-foreground text-sm">Your minted identity status</p>
      </div>

      {/* Identity Card */}
      <div className="glass-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">@{username || 'unnamed'}</p>
            <p className="text-xs text-green-400">● Active</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Modules</p>
            <p className="text-sm font-medium">{activeModules.length} active</p>
          </div>
        </div>

        {/* Primary Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map(t => (
              <span key={t} className="chip text-xs !py-1 !px-3 !bg-foreground/8 !text-foreground/70">#{t}</span>
            ))}
          </div>
        )}

        {/* Intensity Bars */}
        <div className="space-y-2">
          {axes.map(axis => (
            <div key={axis.label} className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-foreground/60">{axis.label}</span>
                <span className="text-muted-foreground">{Math.round(axis.value)}%</span>
              </div>
              <div className="h-1.5 bg-foreground/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${axis.value}%`, background: `linear-gradient(90deg, hsl(var(--foreground) / 0.3), hsl(var(--foreground) / 0.6))` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Module Composition */}
      <div className="glass-card space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Composition</h3>
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
          Update Identity
        </button>
        <button onClick={() => onNavigate('auth')} className="btn-twin btn-twin-primary flex-1 py-2.5 text-sm">
          Issue Authorization
        </button>
      </div>
    </div>
  );
};
