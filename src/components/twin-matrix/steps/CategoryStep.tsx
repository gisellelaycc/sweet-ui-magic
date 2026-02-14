import { useState, useEffect, useRef } from 'react';
import { Lock } from 'lucide-react';
import type { IdentityModule } from '@/types/twin-matrix';
import { StepLayout, StepHeader, StepContent, StepFooter } from '../StepLayout';

const SIGNALS: (IdentityModule & { soon?: boolean })[] = [
  { id: 'sport', icon: '🏃', label: 'Sport', description: 'Physical signal · competitive state', active: true },
  { id: 'music', icon: '🎵', label: 'Music', description: 'Rhythm signal · listening state', active: true },
  { id: 'art', icon: '🎨', label: 'Art', description: 'Aesthetic signal · creative state', active: true },
  { id: 'reading', icon: '📚', label: 'Reading', description: 'Knowledge signal · absorption state', active: true },
  { id: 'food', icon: '🍳', label: 'Food', description: 'Lifestyle signal · dietary state', active: true },
  { id: 'travel', icon: '✈️', label: 'Travel', description: 'Mobility signal · exploration state', active: true },
  { id: 'finance', icon: '💰', label: 'Finance', description: 'Risk signal · asset state', active: false, soon: true },
  { id: 'gaming', icon: '🎮', label: 'Gaming', description: 'Strategic signal · competitive state', active: false, soon: true },
  { id: 'learning', icon: '🧠', label: 'Learning', description: 'Growth signal · focus state', active: false, soon: true },
];

const MINTED_MODULES = ['music', 'reading'];

interface Props {
  activeModules: string[];
  onUpdate: (modules: string[]) => void;
  onNext: () => void;
}

export const CategoryStep = ({ activeModules, onUpdate, onNext }: Props) => {
  const [selected, setSelected] = useState(SIGNALS[0].id);
  const [activated, setActivated] = useState<string[]>(activeModules);
  const [transitioning, setTransitioning] = useState(false);
  const [soonTooltip, setSoonTooltip] = useState<string | null>(null);
  const tooltipTimer = useRef<ReturnType<typeof setTimeout>>();

  const current = SIGNALS.find(s => s.id === selected)!;
  const isActivated = activated.includes(selected);
  const isMinted = MINTED_MODULES.includes(selected);
  const hasActive = activated.length > 0;

  const selectSignal = (id: string) => {
    const sig = SIGNALS.find(s => s.id === id);
    if (!sig || sig.soon) return;
    if (id === selected) return;
    setTransitioning(true);
    setTimeout(() => {
      setSelected(id);
      setTimeout(() => setTransitioning(false), 30);
    }, 150);
  };

  const toggleActive = () => {
    if (current.soon) return;
    const next = isActivated
      ? activated.filter(m => m !== selected)
      : [...activated, selected];
    setActivated(next);
    onUpdate(next);
  };

  const showSoonTooltip = (id: string) => {
    setSoonTooltip(id);
    clearTimeout(tooltipTimer.current);
    tooltipTimer.current = setTimeout(() => setSoonTooltip(null), 1800);
  };

  useEffect(() => () => clearTimeout(tooltipTimer.current), []);

  // All items for chips: signals + "And more"
  const chipItems = [
    ...SIGNALS.map(s => ({ id: s.id, icon: s.icon, label: s.label, soon: !!s.soon })),
    { id: '_more', icon: '→', label: 'And more', soon: false },
  ];

  return (
    <StepLayout>
      <StepHeader>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-1">Signal Layers</h2>
          <p className="text-muted-foreground text-sm">Choose which aspects of yourself shape this state.</p>
        </div>
      </StepHeader>

      <StepContent>
        <div className="w-full flex flex-col items-center gap-8 animate-fade-in">
          {/* ── Main Card ── */}
          <div
            onClick={toggleActive}
            className="relative cursor-pointer w-full"
            style={{
              maxWidth: '580px',
              height: '280px',
              borderRadius: '22px',
              background: 'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(16px) saturate(160%)',
              boxShadow: `inset 0 0 0 1px rgba(255, 255, 255, 0.07), 0 8px 32px rgba(0, 0, 0, 0.15)${isActivated ? ', 0 12px 40px -8px rgba(54, 230, 255, 0.12)' : ''}`,
              transform: isActivated ? 'translateY(-4px)' : 'translateY(0)',
              transition: 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 400ms ease',
            }}
          >
            {/* Top micro-light */}
            <div style={{
              position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
              borderRadius: '1px',
            }} />

            {/* Card content with transition */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center text-center px-8"
              style={{
                opacity: transitioning ? 0 : 1,
                transform: transitioning ? 'scale(0.98)' : 'scale(1)',
                transition: 'opacity 150ms ease, transform 150ms ease',
              }}
            >
              <span className="text-5xl mb-4">{current.icon}</span>
              <h3 className="text-xl font-semibold text-foreground mb-1">{current.label}</h3>
              {isMinted && (
                <span className="text-[10px] px-3 py-0.5 rounded-full bg-green-400/10 text-green-400 mb-2">minted</span>
              )}
              <p className="text-sm text-muted-foreground/70 max-w-xs">{current.description}</p>
              <p className="text-xs text-muted-foreground/40 mt-4">
                {isActivated ? '✓ Active — tap to deactivate' : 'Tap to activate this signal'}
              </p>
            </div>

            {/* Bottom glow bar when activated */}
            {isActivated && (
              <div style={{
                position: 'absolute',
                bottom: '16px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '48px',
                height: '3px',
                borderRadius: '4px',
                background: isMinted ? 'rgba(74, 222, 128, 0.5)' : 'rgba(54, 230, 255, 0.4)',
                boxShadow: isMinted ? '0 0 16px rgba(74, 222, 128, 0.3)' : '0 0 16px rgba(54, 230, 255, 0.25)',
                animation: 'signal-breathe 3s ease-in-out infinite',
              }} />
            )}
          </div>

          {/* ── Chip Row ── */}
          <div className="flex flex-wrap justify-center gap-3 max-w-[680px]">
            {chipItems.map(chip => {
              const isMore = chip.id === '_more';
              const isSoon = chip.soon;
              const isChipSelected = chip.id === selected;
              const isChipActivated = activated.includes(chip.id);
              const isChipMinted = MINTED_MODULES.includes(chip.id);

              return (
                <div key={chip.id} className="relative">
                  <button
                    onClick={() => {
                      if (isMore) return;
                      if (isSoon) { showSoonTooltip(chip.id); return; }
                      selectSignal(chip.id);
                    }}
                    onMouseEnter={() => { if (isSoon) showSoonTooltip(chip.id); }}
                    onMouseLeave={() => { if (isSoon) setSoonTooltip(null); }}
                    className="relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm transition-all duration-300"
                    style={{
                      minWidth: '130px',
                      background: isChipSelected
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${isChipSelected ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.06)'}`,
                      opacity: isMore ? 0.4 : isSoon ? 0.4 : isChipSelected ? 1 : 0.6,
                      filter: isSoon ? 'blur(0.5px)' : 'none',
                      cursor: isSoon || isMore ? 'default' : 'pointer',
                      boxShadow: isChipActivated && !isSoon
                        ? isChipMinted
                          ? '0 4px 12px -2px rgba(74, 222, 128, 0.15), inset 0 -1px 0 rgba(74, 222, 128, 0.2)'
                          : '0 4px 12px -2px rgba(54, 230, 255, 0.15), inset 0 -1px 0 rgba(54, 230, 255, 0.2)'
                        : 'none',
                    }}
                  >
                    {isSoon && <Lock className="w-3 h-3 text-foreground/30" />}
                    <span>{chip.icon}</span>
                    <span className={`font-medium ${isChipSelected ? 'text-foreground' : 'text-foreground/70'}`}>
                      {chip.label}
                    </span>
                  </button>

                  {/* Soon tooltip */}
                  {soonTooltip === chip.id && (
                    <div className="absolute -top-9 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 rounded-lg text-[11px] text-foreground/70 whitespace-nowrap animate-fade-in"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      Coming soon
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </StepContent>

      <StepFooter>
        <button onClick={onNext} disabled={!hasActive}
          className={`btn-twin btn-twin-primary w-full py-2.5 text-sm disabled:opacity-30 disabled:cursor-not-allowed ${hasActive ? 'btn-glow' : ''}`}>
          Proceed
        </button>
      </StepFooter>

      <style>{`
        @keyframes signal-breathe { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
      `}</style>
    </StepLayout>
  );
};
