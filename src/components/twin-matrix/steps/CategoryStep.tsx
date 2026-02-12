import { useState } from 'react';
import type { IdentityModule } from '@/types/twin-matrix';

const MODULES: IdentityModule[] = [
  { id: 'sport', icon: '🏃', label: 'Sport', description: 'Your physical tendencies & competitive style', active: true },
  { id: 'music', icon: '🎵', label: 'Music', description: 'Rhythm, emotion & listening habits', active: false },
  { id: 'art', icon: '🎨', label: 'Art', description: 'Aesthetic orientation & creative tendencies', active: false },
  { id: 'reading', icon: '📚', label: 'Reading', description: 'Knowledge absorption & thinking paths', active: false },
  { id: 'food', icon: '🍳', label: 'Food', description: 'Lifestyle rhythm & dietary choices', active: false },
  { id: 'travel', icon: '✈️', label: 'Travel', description: 'Exploration preferences & mobility habits', active: false },
  { id: 'finance', icon: '💰', label: 'Finance', description: 'Risk tendencies & asset style', active: false },
  { id: 'gaming', icon: '🎮', label: 'Gaming', description: 'Competitive mindset & strategic tendencies', active: false },
  { id: 'learning', icon: '🧠', label: 'Learning', description: 'Growth motivation & focus patterns', active: false },
];

interface Props {
  activeModules: string[];
  onUpdate: (modules: string[]) => void;
  onNext: () => void;
}

export const CategoryStep = ({ activeModules, onUpdate, onNext }: Props) => {
  const [activated, setActivated] = useState<string[]>(activeModules);

  const toggleModule = (id: string, available: boolean) => {
    if (!available) return;
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
        <h2 className="text-2xl font-bold mb-1">Identity Modules</h2>
        <p className="text-muted-foreground text-sm">Tap to activate the modules that define your identity.</p>
      </div>

      <div className="space-y-2">
        {MODULES.map(mod => {
          const isActivated = activated.includes(mod.id);
          const isAvailable = mod.active;

          return (
            <div
              key={mod.id}
              onClick={() => toggleModule(mod.id, isAvailable)}
              className={`glass-card !p-4 flex items-center gap-4 transition-all duration-300 ${
                isActivated ? 'border-foreground/25 shadow-[0_0_16px_rgba(255,255,255,0.06)]' : ''
              } ${!isAvailable ? 'opacity-40' : 'cursor-pointer'}`}
            >
              <span className="text-2xl">{mod.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{mod.label}</span>
                  {!isAvailable && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-foreground/5 text-muted-foreground">soon</span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground truncate">{mod.description}</p>
              </div>
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 transition-all ${isActivated ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-foreground/10'}`} />
            </div>
          );
        })}
      </div>

      <button onClick={onNext} disabled={!hasActive} className={`btn-twin btn-twin-primary w-full py-3 disabled:opacity-30 disabled:cursor-not-allowed ${hasActive ? 'btn-glow' : ''}`}>
        Continue
      </button>
    </div>
  );
};
