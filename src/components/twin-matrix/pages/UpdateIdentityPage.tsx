interface Props {
  username: string;
  activeModules: string[];
  tags: string[];
  onNavigate: (id: string) => void;
}

const ALL_MODULES = [
  { id: 'sport', icon: '🏃', label: 'Sport' },
  { id: 'music', icon: '🎵', label: 'Music' },
  { id: 'art', icon: '🎨', label: 'Art' },
  { id: 'reading', icon: '📚', label: 'Reading' },
  { id: 'food', icon: '🍳', label: 'Food' },
  { id: 'travel', icon: '✈️', label: 'Travel' },
  { id: 'finance', icon: '💰', label: 'Finance' },
  { id: 'gaming', icon: '🎮', label: 'Gaming' },
  { id: 'learning', icon: '🧠', label: 'Learning' },
];

export const UpdateIdentityPage = ({ username, activeModules, tags }: Props) => {
  return (
    <div className="animate-fade-in space-y-6 max-w-lg mx-auto">
      <div>
        <h2 className="text-2xl font-bold mb-1">Update Identity</h2>
        <p className="text-muted-foreground text-sm">Modify your identity settings and modules</p>
      </div>

      {/* Core Identity */}
      <div className="glass-card space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Core Identity</h3>
          <button className="text-xs text-muted-foreground/50 hover:text-foreground transition-colors">✏️ Edit</button>
        </div>
        <div className="text-sm text-foreground/80">
          <p>@{username || 'unnamed'}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Tap edit to modify demographic & physical profile</p>
        </div>
      </div>

      {/* Module List */}
      <div className="glass-card space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Modules</h3>
        <div className="space-y-2">
          {ALL_MODULES.map(mod => {
            const isActive = activeModules.includes(mod.id);
            return (
              <div key={mod.id} className="flex items-center justify-between py-2 px-1">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{mod.icon}</span>
                  <span className="text-sm">{mod.label}</span>
                </div>
                {isActive ? (
                  <button className="text-[11px] px-3 py-1 rounded-lg bg-foreground/10 text-foreground/70 hover:bg-foreground/15 transition-colors">
                    Edit
                  </button>
                ) : (
                  <button className="text-[11px] px-3 py-1 rounded-lg bg-foreground/5 text-muted-foreground hover:bg-foreground/10 transition-colors">
                    Activate
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Soul */}
      <div className="glass-card space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Soul</h3>
          <button className="text-xs text-muted-foreground/50 hover:text-foreground transition-colors">✏️ Edit</button>
        </div>
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {tags.map(t => (
              <span key={t} className="chip text-xs !py-1 !px-3 !bg-foreground/8 !text-foreground/70">#{t}</span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No motivation tags defined</p>
        )}
      </div>

      <button className="btn-twin btn-twin-primary w-full py-3 btn-glow">
        Re-mint Identity
      </button>
    </div>
  );
};
