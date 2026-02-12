import { useState } from 'react';
import type { IdentityModule } from '@/types/twin-matrix';

const MODULES: IdentityModule[] = [
  { id: 'sport', icon: '🏃', label: 'Sport', description: 'Physical signal · competitive state', active: true },
  { id: 'music', icon: '🎵', label: 'Music', description: 'Rhythm signal · listening state', active: true },
  { id: 'art', icon: '🎨', label: 'Art', description: 'Aesthetic signal · creative state', active: true },
  { id: 'reading', icon: '📚', label: 'Reading', description: 'Knowledge signal · absorption state', active: true },
  { id: 'food', icon: '🍳', label: 'Food', description: 'Lifestyle signal · dietary state', active: true },
  { id: 'travel', icon: '✈️', label: 'Travel', description: 'Mobility signal · exploration state', active: true },
  { id: 'finance', icon: '💰', label: 'Finance', description: 'Risk signal · asset state', active: false },
  { id: 'gaming', icon: '🎮', label: 'Gaming', description: 'Strategic signal · competitive state', active: false },
  { id: 'learning', icon: '🧠', label: 'Learning', description: 'Growth signal · focus state', active: false },
];

// Demo: pretend these modules have already been minted
const MINTED_MODULES = ['music', 'reading'];

interface Props {
  activeModules: string[];
  onUpdate: (modules: string[]) => void;
  onNext: () => void;
}

export const CategoryStep = ({ activeModules, onUpdate, onNext }: Props) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [activated, setActivated] = useState<string[]>(activeModules);

  const toggleExpand = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  const toggleModule = (id: string) => {
    const next = activated.includes(id)
      ? activated.filter(m => m !== id)
      : [...activated, id];
    setActivated(next);
    onUpdate(next);
  };

  const hasActive = activated.length > 0;

  return (
    <div className="animate-fade-in space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold mb-1">Signal Modules</h2>
        <p className="text-muted-foreground text-sm">Activate the layers that compose your identity state.</p>
      </div>

      <div className="space-y-2">
        {MODULES.map(mod => {
          const isExpanded = expanded === mod.id;
          const isActivated = activated.includes(mod.id);
          const isAvailable = mod.active;
          const isMinted = MINTED_MODULES.includes(mod.id);

          return (
            <div key={mod.id} className="overflow-hidden">
              <div
                onClick={() => toggleExpand(mod.id)}
                className={`glass-card !p-4 flex items-center gap-4 transition-all duration-500 cursor-pointer ${
                  isActivated && !isMinted ? 'animate-glow-pulse' : ''
                } ${isActivated && !isMinted ? 'border-foreground/25' : ''}
                ${isMinted ? '!border-green-400/20' : ''} ${isExpanded ? '!rounded-b-none' : ''}`}
              >
                <span className="text-2xl">{mod.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{mod.label}</span>
                    {!isAvailable && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-foreground/5 text-muted-foreground">soon</span>
                    )}
                    {isMinted && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-400/10 text-green-400">minted</span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{mod.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 transition-all ${
                    isMinted ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]'
                    : isActivated ? 'bg-foreground/60 shadow-[0_0_6px_rgba(255,255,255,0.2)]'
                    : 'bg-foreground/10'
                  }`} />
                  <span className="text-muted-foreground/50 text-xs transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
                </div>
              </div>

              {isExpanded && (
                <div className="glass-card !rounded-t-none !border-t-0 !pt-0 !pb-4 px-4 animate-fade-in">
                  <div className="border-t border-foreground/5 pt-3 space-y-3">
                    {isMinted && (
                      <div className="flex items-center gap-2 text-xs text-green-400/80">
                        <span>✓</span>
                        <span>This layer has been minted into your identity state</span>
                      </div>
                    )}
                    {isAvailable ? (
                      <div className="flex gap-2">
                        {isMinted ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); }}
                            className="btn-twin btn-twin-ghost flex-1 py-2.5 text-sm"
                          >
                            ✏️ Edit Layer
                          </button>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleModule(mod.id); }}
                            className={`btn-twin flex-1 py-2.5 text-sm ${isActivated ? 'btn-twin-ghost' : 'btn-twin-primary'}`}
                          >
                            {isActivated ? 'Deactivate' : 'Activate Layer'}
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground/50 text-center py-1">This layer is not yet available.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button onClick={onNext} disabled={!hasActive} className={`btn-twin btn-twin-primary w-full py-3 disabled:opacity-30 disabled:cursor-not-allowed ${hasActive ? 'btn-glow' : ''}`}>
        Proceed to Soul
      </button>
    </div>
  );
};
