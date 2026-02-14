import { useState, useCallback } from 'react';
import { Slider } from '@/components/ui/slider';
import type { SoulData, SoulBar } from '@/types/twin-matrix';
import { StepLayout, StepHeader, StepContent, StepFooter } from '../StepLayout';

const DEFAULT_BARS: SoulBar[] = [
  { id: 'BAR_OUTCOME_EXPERIENCE', label: 'Performance Orientation', left: 'I train to improve performance', right: 'I train for the experience', value: null },
  { id: 'BAR_CONTROL_RELEASE', label: 'Structure Preference', left: 'I prefer structured training', right: 'I prefer spontaneous movement', value: null },
  { id: 'BAR_SOLO_GROUP', label: 'Social Preference', left: 'I prefer training alone', right: 'I prefer training with others', value: null },
  { id: 'BAR_PASSIVE_ACTIVE', label: 'Engagement Mode', left: 'I mostly consume sports content', right: 'I actively track or share my activity', value: null },
];

function getBarRaw(value: number | null): number {
  if (value === null) return 0;
  return Math.round((value / 100) * 255);
}

interface Props {
  data: SoulData;
  onUpdate: (d: SoulData) => void;
  onNext: () => void;
}

export const SoulStep = ({ data, onUpdate, onNext }: Props) => {
  const [bars, setBars] = useState<SoulBar[]>(
    data.bars?.length === 4 ? data.bars : DEFAULT_BARS
  );

  const handleSlider = useCallback((idx: number, value: number) => {
    const nextBars = bars.map((b, i) => i === idx ? { ...b, value } : b);
    setBars(nextBars);
    onUpdate({ bars: nextBars, confirmed: true });
  }, [bars, onUpdate]);

  const touchedCount = bars.filter(b => b.value !== null).length;
  const hasInteracted = touchedCount > 0;

  return (
    <StepLayout>
      <StepHeader>
        <div>
          <h2 className="text-2xl font-bold mb-1">Soul Layer</h2>
          <p className="text-muted-foreground text-sm">Balance intention and instinct.</p>
        </div>
      </StepHeader>

      <StepContent>
        <div className="w-full max-w-lg mx-auto space-y-6 animate-fade-in">
          <div className="glass-card space-y-7">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Why do you train?</p>

            {bars.map((bar, idx) => (
              <div key={bar.id} className="space-y-3">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="max-w-[45%] text-left leading-tight">{bar.left}</span>
                  <span className="max-w-[45%] text-right leading-tight">{bar.right}</span>
                </div>
                <div className="relative group">
                  {bar.value !== null && (
                    <div
                      className="absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2 rounded-full pointer-events-none z-0"
                      style={{
                        background: `linear-gradient(90deg, transparent 0%, rgba(10, 255, 255, 0.05) ${Math.max(bar.value - 30, 0)}%, rgba(10, 255, 255, 0.35) ${bar.value}%, rgba(173, 255, 255, 0.05) ${Math.min(bar.value + 30, 100)}%, transparent 100%)`,
                        boxShadow: `0 0 8px rgba(10, 255, 255, 0.15), 0 0 20px rgba(10, 255, 255, 0.06)`,
                      }}
                    />
                  )}
                  <Slider
                    value={[bar.value ?? 50]}
                    onValueChange={([v]) => handleSlider(idx, v)}
                    max={100}
                    step={1}
                    className="relative z-10"
                  />
                </div>
              </div>
            ))}
          </div>

          {hasInteracted && (
            <div className="glass-card space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Soul Signature</p>
                <p className="text-[10px] text-muted-foreground">Configured: {touchedCount} / 4</p>
              </div>
              <div className="space-y-2">
                {bars.map(bar => {
                  const raw = getBarRaw(bar.value);
                  return (
                    <div key={bar.id} className="flex items-center justify-between text-[11px]">
                      <span className="text-foreground/60">{bar.label}</span>
                      {bar.value !== null ? (
                        <span className="text-[9px] text-muted-foreground font-mono">{raw} / 255</span>
                      ) : (
                        <span className="text-muted-foreground/40 italic text-[10px]">No direction yet</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </StepContent>

      <StepFooter>
        <button
          onClick={onNext}
          disabled={!hasInteracted}
          className={`btn-twin btn-twin-primary w-full py-2.5 text-sm disabled:opacity-30 disabled:cursor-not-allowed ${hasInteracted ? 'btn-glow' : ''}`}
        >
          Review Your State →
        </button>
      </StepFooter>
    </StepLayout>
  );
};
