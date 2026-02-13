import { useState, useCallback } from 'react';
import { Slider } from '@/components/ui/slider';
import type { SoulData, SoulBar } from '@/types/twin-matrix';

const DEFAULT_BARS: SoulBar[] = [
  { id: 'BAR_OUTCOME_EXPERIENCE', label: 'Performance Orientation', left: 'I train to improve performance', right: 'I train for the experience', value: null },
  { id: 'BAR_CONTROL_RELEASE', label: 'Structure Preference', left: 'I prefer structured training', right: 'I prefer spontaneous movement', value: null },
  { id: 'BAR_SOLO_GROUP', label: 'Social Preference', left: 'I prefer training alone', right: 'I prefer training with others', value: null },
  { id: 'BAR_PASSIVE_ACTIVE', label: 'Engagement Mode', left: 'I mostly consume sports content', right: 'I actively track or share my activity', value: null },
];

function getBarState(value: number | null): string {
  if (value === null) return 'Not set';
  const t = value / 100;
  if (t < 0.4) return 'Left';
  if (t > 0.6) return 'Right';
  return 'Balanced';
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
    <div className="animate-fade-in space-y-6 max-w-lg mx-auto">
      <div>
        <h2 className="text-2xl font-bold mb-1">Soul Layer</h2>
        <p className="text-muted-foreground text-sm">Define your signal spectrum.</p>
      </div>

      <div className="glass-card space-y-7">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">Why do you train?</p>

        {bars.map((bar, idx) => (
          <div key={bar.id} className="space-y-3">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="max-w-[45%] text-left leading-tight">{bar.left}</span>
              <span className="max-w-[45%] text-right leading-tight">{bar.right}</span>
            </div>
            <div className="relative group">
              <div
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at ${bar.value ?? 50}% 50%, rgba(40, 180, 160, 0.15) 0%, transparent 70%)`,
                }}
              />
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

      {/* Soul Signature Card */}
      {hasInteracted && (
        <div className="glass-card space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Soul Signature</p>
            <p className="text-[10px] text-muted-foreground">Configured: {touchedCount} / 4</p>
          </div>
          <div className="space-y-2">
            {bars.map(bar => {
              const state = getBarState(bar.value);
              return (
                <div key={bar.id} className="flex items-center justify-between text-[11px]">
                  <span className="text-foreground/60">{bar.label}</span>
                  <span className={`font-medium ${state === 'Not set' ? 'text-muted-foreground/40' : 'text-foreground/80'}`}>
                    {state}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <button
        onClick={onNext}
        disabled={!hasInteracted}
        className={`btn-twin btn-twin-primary w-full py-3 disabled:opacity-30 disabled:cursor-not-allowed ${hasInteracted ? 'btn-glow' : ''}`}
      >
        Mint Identity State
      </button>
    </div>
  );
};
