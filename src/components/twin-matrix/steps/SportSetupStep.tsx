import { useState } from 'react';
import type { SportSetup } from '@/types/twin-matrix';

const FREQ_OPTIONS = [
  { label: '1–2x / week', zone: 'Light Activity' },
  { label: '3–4x / week', zone: 'Moderate Training' },
  { label: '5+ / week', zone: 'High-Frequency Training' },
  { label: 'Occasionally', zone: 'Casual' },
];
const DURATION_OPTIONS = [
  { label: '< 30 min', zone: 'Quick Session' },
  { label: '30–60 min', zone: 'Standard Session' },
  { label: '60–90 min', zone: 'Extended Session' },
  { label: '90+ min', zone: 'Endurance Session' },
];
const STEP_OPTIONS = [
  { label: '< 3,000', zone: 'Sedentary' },
  { label: '3,000–7,000', zone: 'Lightly Active' },
  { label: '7,000–12,000', zone: 'Active' },
  { label: '12,000+', zone: 'Highly Active' },
];

interface Props {
  data: SportSetup;
  onUpdate: (d: SportSetup) => void;
  onNext: () => void;
}

const SliderSelect = ({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string; zone: string }[];
  value: string;
  onChange: (v: string) => void;
}) => {
  const idx = options.findIndex(o => o.label === value);
  const zone = idx >= 0 ? options[idx].zone : null;

  return (
    <div className="space-y-3">
      <label className="text-sm text-muted-foreground">{label}</label>
      <div className="flex gap-2">
        {options.map(o => (
          <button
            key={o.label}
            onClick={() => onChange(o.label)}
            className={`chip !text-xs flex-1 justify-center ${value === o.label ? '!bg-foreground/15 !border-foreground/30 !text-foreground' : ''}`}
          >
            {o.label}
          </button>
        ))}
      </div>
      {zone && (
        <div className="text-xs text-center py-1.5 px-3 rounded-full bg-foreground/5 text-foreground/60 inline-block">
          Zone: {zone}
        </div>
      )}
    </div>
  );
};

export const SportSetupStep = ({ data, onUpdate, onNext }: Props) => {
  const [setup, setSetup] = useState(data);
  const update = (key: keyof SportSetup, val: string) => {
    const next = { ...setup, [key]: val };
    setSetup(next);
    onUpdate(next);
  };

  // All 3 fields required per spec
  const isValid = setup.frequency !== '' && setup.duration !== '' && setup.dailySteps !== '';

  return (
    <div className="animate-fade-in space-y-6 max-w-lg mx-auto">
      <div>
        <h2 className="text-2xl font-bold mb-1">Activity Baseline</h2>
        <p className="text-muted-foreground text-sm">Define your physical signal baseline for this layer.</p>
      </div>

      <div className="glass-card space-y-6">
        <SliderSelect label="Exercise Frequency" options={FREQ_OPTIONS} value={setup.frequency} onChange={v => update('frequency', v)} />
        <SliderSelect label="Session Duration" options={DURATION_OPTIONS} value={setup.duration} onChange={v => update('duration', v)} />
        <SliderSelect label="Average Daily Steps" options={STEP_OPTIONS} value={setup.dailySteps} onChange={v => update('dailySteps', v)} />
      </div>

      <button onClick={onNext} disabled={!isValid} className={`btn-twin btn-twin-primary w-full py-3 disabled:opacity-30 disabled:cursor-not-allowed ${isValid ? 'btn-glow' : ''}`}>
        Proceed
      </button>
    </div>
  );
};
