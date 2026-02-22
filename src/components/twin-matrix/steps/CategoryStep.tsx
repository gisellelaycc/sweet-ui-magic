import { useState, useEffect, useRef } from 'react';
import { Lock } from 'lucide-react';
import type { IdentityModule } from '@/types/twin-matrix';
import { StepLayout, StepContent } from '../StepLayout';
import { useI18n } from '@/lib/i18n';

const SIGNALS: (IdentityModule & { soon?: boolean })[] = [
  { id: 'sport', icon: '🏃', label: 'Sport', description: 'Physical signal · competitive state', active: true },
  { id: 'music', icon: '🎵', label: 'Music', description: 'Rhythm signal · listening state', active: false, soon: true },
  { id: 'art', icon: '🎨', label: 'Art', description: 'Aesthetic signal · creative state', active: false, soon: true },
  { id: 'reading', icon: '📚', label: 'Reading', description: 'Knowledge signal · absorption state', active: false, soon: true },
  { id: 'food', icon: '🍳', label: 'Food', description: 'Lifestyle signal · dietary state', active: false, soon: true },
  { id: 'travel', icon: '✈️', label: 'Travel', description: 'Mobility signal · exploration state', active: false, soon: true },
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
  const { t } = useI18n();
  const [selected, setSelected] = useState(SIGNALS[0].id);
  const [activated, setActivated] = useState<string[]>(activeModules.filter((moduleId) => moduleId === 'sport'));
  const [transitioning, setTransitioning] = useState(false);
  const [soonTooltip, setSoonTooltip] = useState<string | null>(null);
  const tooltipTimer = useRef<ReturnType<typeof setTimeout>>();

  const current = SIGNALS.find(s => s.id === selected)!;
  const isActivated = activated.includes(selected);
  const isMinted = MINTED_MODULES.includes(selected);
  const hasActive = activated.length > 0;

  useEffect(() => {
    const sanitized = activeModules.filter((moduleId) => moduleId === 'sport');
    if (sanitized.length !== activeModules.length) {
      setActivated(sanitized);
      onUpdate(sanitized);
    }
  }, [activeModules, onUpdate]);

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

  // Display translated label/description, internal id stays English
  const getLabel = (id: string) => t(`signal.${id}`);
  const getDesc = (id: string) => t(`signal.${id}.desc`);

  const chipItems = [
    ...SIGNALS.map(s => ({ id: s.id, icon: s.icon, soon: !!s.soon })),
    { id: '_more', icon: '→', soon: false },
  ];

  return (
    <StepLayout>
      <StepContent>
        <div className="w-full flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          <div className="flex-1 min-w-0 flex flex-col items-center lg:items-start">
            <div className="mb-8 w-full">
              <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] tracking-tight mb-2">
                {t('category.title')}
              </h2>
              <p className="text-muted-foreground text-base md:text-lg">
                {t('category.subtitle')}
              </p>
            </div>

            <div
              onClick={toggleActive}
              className="relative cursor-pointer w-full"
              style={{
                maxWidth: '520px', height: '260px', borderRadius: '28px',
                background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 60%, transparent 100%)',
                backdropFilter: 'blur(16px) saturate(160%)',
                boxShadow: `0 0 60px -20px rgba(10, 255, 255, ${isActivated ? '0.15' : '0.05'}), 0 0 120px -40px rgba(173, 255, 255, ${isActivated ? '0.08' : '0.02'})`,
                border: 'none',
                transform: isActivated ? 'translateY(-4px)' : 'translateY(0)',
                transition: 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 400ms ease',
              }}
            >
              <div
                className="absolute inset-0 flex flex-col items-center justify-center text-center px-8"
                style={{
                  opacity: transitioning ? 0 : 1,
                  transform: transitioning ? 'scale(0.98)' : 'scale(1)',
                  transition: 'opacity 150ms ease, transform 150ms ease',
                }}
              >
                <span className="text-5xl mb-4">{current.icon}</span>
                <h3 className="text-xl font-semibold text-foreground mb-1">{getLabel(current.id)}</h3>
                {isMinted && (
                  <span className="text-xs px-3 py-0.5 rounded-full bg-green-400/10 text-green-400 mb-2">{t('category.minted')}</span>
                )}
                <p className="text-sm text-muted-foreground/70 max-w-xs">{getDesc(current.id)}</p>
                <p className="text-xs text-muted-foreground/40 mt-4">
                  {isActivated ? t('category.tapDeactivate') : t('category.tapActivate')}
                </p>
              </div>

              {isActivated && (
                <div style={{
                  position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)',
                  width: '48px', height: '3px', borderRadius: '4px',
                  background: isMinted ? 'rgba(74, 222, 128, 0.5)' : 'rgba(54, 230, 255, 0.4)',
                  boxShadow: isMinted ? '0 0 16px rgba(74, 222, 128, 0.3)' : '0 0 16px rgba(54, 230, 255, 0.25)',
                  animation: 'signal-breathe 3s ease-in-out infinite',
                }} />
              )}
            </div>

            <div className="w-full mt-6" style={{ maxWidth: '520px' }}>
              <button onClick={onNext} disabled={!hasActive}
                className={`btn-twin btn-twin-primary w-full py-2.5 text-sm disabled:opacity-30 disabled:cursor-not-allowed ${hasActive ? 'btn-glow' : ''}`}>
                {t('category.proceed')}
              </button>
            </div>
          </div>

          <div className="lg:w-[280px] shrink-0 flex flex-col gap-2">
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
                      setSelected(chip.id);
                      const next = activated.includes(chip.id)
                        ? activated.filter(m => m !== chip.id)
                        : [...activated, chip.id];
                      setActivated(next);
                      onUpdate(next);
                    }}
                    onMouseEnter={() => { if (isSoon) showSoonTooltip(chip.id); }}
                    onMouseLeave={() => { if (isSoon) setSoonTooltip(null); }}
                    className="relative w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all duration-300"
                    style={{
                      background: isChipSelected ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                      border: `1px solid ${isChipSelected ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)'}`,
                      opacity: isMore ? 0.4 : isSoon ? 0.4 : isChipSelected ? 1 : 0.7,
                      filter: isSoon ? 'blur(0.5px)' : 'none',
                      cursor: isSoon || isMore ? 'default' : 'pointer',
                      boxShadow: isChipActivated && !isSoon
                        ? isChipMinted
                          ? '0 4px 12px -2px rgba(74, 222, 128, 0.15), inset 0 -1px 0 rgba(74, 222, 128, 0.2)'
                          : '0 4px 12px -2px rgba(54, 230, 255, 0.15), inset 0 -1px 0 rgba(54, 230, 255, 0.2)'
                        : 'none',
                    }}
                  >
                    {isSoon && <Lock className="w-3 h-3 text-foreground/30 shrink-0" />}
                    <span className="text-lg shrink-0">{chip.icon}</span>
                    <div className="min-w-0">
                      <span className={`text-sm font-medium block ${isChipSelected ? 'text-foreground' : 'text-foreground/70'}`}>
                        {isMore ? t('category.andMore') : getLabel(chip.id)}
                      </span>
                      {!isMore && (
                      <span className="text-[11px] text-muted-foreground/50 block leading-tight mt-0.5">
                          {getDesc(chip.id)}
                        </span>
                      )}
                    </div>
                  </button>

                  {soonTooltip === chip.id && (
                    <div className="absolute -top-9 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 rounded-lg text-[11px] text-foreground/70 whitespace-nowrap animate-fade-in"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      {t('category.comingSoon')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <style>{`
          @keyframes signal-breathe { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        `}</style>
      </StepContent>
    </StepLayout>
  );
};
