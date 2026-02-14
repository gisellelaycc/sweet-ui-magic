import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Lock, Plus } from 'lucide-react';
import type { IdentityModule } from '@/types/twin-matrix';
import { StepLayout, StepHeader, StepContent, StepFooter } from '../StepLayout';

/* ── Signal data ── */
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

// Virtual items: signals + "and more" card
const CAROUSEL_ITEMS = [...SIGNALS, { id: '_more', icon: '', label: '+ And More', description: 'Emerging signals.', active: false }];
const MINTED_MODULES = ['music', 'reading'];

interface Props {
  activeModules: string[];
  onUpdate: (modules: string[]) => void;
  onNext: () => void;
}

export const CategoryStep = ({ activeModules, onUpdate, onNext }: Props) => {
  const [centerIdx, setCenterIdx] = useState(0);
  const [activated, setActivated] = useState<string[]>(activeModules);
  const [transitioning, setTransitioning] = useState(false);
  const [lockTooltip, setLockTooltip] = useState<string | null>(null);
  const tooltipTimer = useRef<ReturnType<typeof setTimeout>>();

  const total = CAROUSEL_ITEMS.length;

  const slide = (dir: -1 | 1) => {
    if (transitioning) return;
    setTransitioning(true);
    setCenterIdx(prev => (prev + dir + total) % total);
    setTimeout(() => setTransitioning(false), 380);
  };

  const toggleModule = (id: string) => {
    const item = SIGNALS.find(s => s.id === id);
    if (!item || item.soon || !item.active) return;
    const next = activated.includes(id) ? activated.filter(m => m !== id) : [...activated, id];
    setActivated(next);
    onUpdate(next);
  };

  const showLockTooltip = (id: string) => {
    setLockTooltip(id);
    clearTimeout(tooltipTimer.current);
    tooltipTimer.current = setTimeout(() => setLockTooltip(null), 2000);
  };

  useEffect(() => () => clearTimeout(tooltipTimer.current), []);

  const hasActive = activated.length > 0;

  const getVisibleIndices = () => {
    const indices: number[] = [];
    for (let offset = -2; offset <= 2; offset++) {
      indices.push((centerIdx + offset + total) % total);
    }
    return indices;
  };

  const visibleIndices = getVisibleIndices();

  return (
    <StepLayout>
      <StepHeader>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-1">Signal Layers</h2>
          <p className="text-muted-foreground text-sm">Choose which aspects of yourself shape this state.</p>
        </div>
      </StepHeader>

      <StepContent>
        <div className="w-full max-w-3xl mx-auto animate-fade-in">
          {/* Carousel */}
          <div className="relative flex items-center justify-center" style={{ minHeight: '260px' }}>
            <button onClick={() => slide(-1)} className="absolute left-0 z-20 p-2 text-muted-foreground/40 hover:text-foreground/70 transition-colors" aria-label="Previous signal">
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="relative w-full flex items-center justify-center overflow-hidden" style={{ height: '240px' }}>
              {visibleIndices.map((itemIdx, posIdx) => {
                const offset = posIdx - 2;
                const item = CAROUSEL_ITEMS[itemIdx];
                const isCenter = offset === 0;
                const isMore = item.id === '_more';
                const isSoon = 'soon' in item && item.soon;
                const isMinted = MINTED_MODULES.includes(item.id);
                const isActivated = activated.includes(item.id);

                const scale = isCenter ? 1.08 : Math.abs(offset) === 1 ? 0.88 : 0.72;
                const opacity = isCenter ? 1 : Math.abs(offset) === 1 ? 0.55 : 0.25;
                const translateX = offset * 140;
                const zIndex = isCenter ? 10 : Math.abs(offset) === 1 ? 5 : 1;
                const blur = isSoon ? 3 : isCenter ? 0 : Math.abs(offset) === 1 ? 0.5 : 2;

                return (
                  <div key={item.id} className="absolute flex flex-col items-center justify-center" style={{
                    transform: `translateX(${translateX}px) scale(${scale})`, opacity, filter: `blur(${blur}px)`,
                    transition: 'all 350ms cubic-bezier(0.4, 0, 0.2, 1)', zIndex, width: '160px', pointerEvents: isCenter ? 'auto' : 'none',
                  }}>
                    {isMore ? (
                      <div className="glass-card !p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:scale-105 transition-transform" style={{ width: '150px', height: '180px' }}>
                        <Plus className="w-8 h-8 text-muted-foreground/40 mb-3" />
                        <p className="text-sm font-semibold text-foreground/70">And More</p>
                        <p className="text-[10px] text-muted-foreground/50 mt-1">Emerging signals.</p>
                      </div>
                    ) : (
                      <div
                        onClick={() => { if (isSoon) { showLockTooltip(item.id); return; } if (isCenter) toggleModule(item.id); }}
                        className="relative glass-card !p-5 flex flex-col items-center justify-center text-center cursor-pointer group"
                        style={{ width: '150px', height: '180px', animation: !isCenter && !isSoon ? 'signal-float 6s ease-in-out infinite' : undefined, animationDelay: `${itemIdx * 0.8}s` }}
                      >
                        {isSoon && isCenter && (
                          <div className="absolute inset-0 flex items-center justify-center z-10 rounded-[20px]">
                            <Lock className="w-5 h-5 text-foreground/15 group-hover:animate-[lock-shake_0.4s_ease-in-out]" />
                          </div>
                        )}
                        {lockTooltip === item.id && isCenter && (
                          <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-30 glass-card !p-3 !rounded-xl whitespace-nowrap animate-fade-in">
                            <p className="text-[11px] font-medium text-foreground/80">Dormant signal</p>
                            <p className="text-[9px] text-muted-foreground/60">Unlock in future release</p>
                          </div>
                        )}
                        <span className="text-3xl mb-2" style={{ opacity: isSoon ? 0.3 : 1 }}>{item.icon}</span>
                        <p className={`text-sm font-semibold mb-0.5 ${isSoon ? 'text-foreground/30' : 'text-foreground'}`}>{item.label}</p>
                        {isMinted && <span className="text-[9px] px-2 py-0.5 rounded-full bg-green-400/10 text-green-400 mb-1">minted</span>}
                        <p className={`text-[10px] leading-tight ${isCenter && !isSoon ? 'text-muted-foreground/80' : 'text-muted-foreground/30'}`}>{item.description}</p>
                        {isActivated && !isSoon && (
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full" style={{
                            background: isMinted ? 'rgba(74, 222, 128, 0.5)' : 'rgba(54, 230, 255, 0.4)',
                            boxShadow: isMinted ? '0 0 12px rgba(74, 222, 128, 0.3)' : '0 0 12px rgba(54, 230, 255, 0.25)',
                            animation: 'signal-breathe 3s ease-in-out infinite',
                          }} />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button onClick={() => slide(1)} className="absolute right-0 z-20 p-2 text-muted-foreground/40 hover:text-foreground/70 transition-colors" aria-label="Next signal">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Hint */}
          <div className="text-center mt-2">
            {(() => {
              const centerItem = CAROUSEL_ITEMS[centerIdx];
              if (centerItem.id === '_more') return <p className="text-xs text-muted-foreground/40">More signals coming soon</p>;
              const isSoon = 'soon' in centerItem && centerItem.soon;
              const isActivated = activated.includes(centerItem.id);
              const isMinted = MINTED_MODULES.includes(centerItem.id);
              if (isSoon) return <p className="text-xs text-muted-foreground/30">Dormant signal</p>;
              if (isMinted) return <p className="text-xs text-green-400/50">Layer minted into your state</p>;
              return <p className="text-xs text-muted-foreground/50">{isActivated ? '✓ Active — tap to deactivate' : 'Tap to activate this signal'}</p>;
            })()}
          </div>
        </div>
      </StepContent>

      <StepFooter>
        <button onClick={onNext} disabled={!hasActive} className={`btn-twin btn-twin-primary w-full py-2.5 text-sm disabled:opacity-30 disabled:cursor-not-allowed ${hasActive ? 'btn-glow' : ''}`}>
          Proceed
        </button>
      </StepFooter>

      <style>{`
        @keyframes signal-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
        @keyframes signal-breathe { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        @keyframes lock-shake { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-8deg); } 75% { transform: rotate(8deg); } }
      `}</style>
    </StepLayout>
  );
};
