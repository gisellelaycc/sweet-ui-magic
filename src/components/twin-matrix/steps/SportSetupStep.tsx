import { useState } from 'react';
import type { SportSetup } from '@/types/twin-matrix';
import { StepLayout, StepContent } from '../StepLayout';
import { useI18n } from '@/lib/i18n';

// Internal values stay as-is (English labels like "1–2x / week")
// Zone display is translated
const FREQ_OPTIONS = [
  { label: '1–2x / week', zoneKey: 'zone.lightActivity' },
  { label: '3–4x / week', zoneKey: 'zone.moderateTraining' },
  { label: '5+ / week', zoneKey: 'zone.highFrequency' },
  { label: 'Occasionally', zoneKey: 'zone.casual' },
];
const DURATION_OPTIONS = [
  { label: '< 30 min', zoneKey: 'zone.quickSession' },
  { label: '30–60 min', zoneKey: 'zone.standardSession' },
  { label: '60–90 min', zoneKey: 'zone.extendedSession' },
  { label: '90+ min', zoneKey: 'zone.enduranceSession' },
];
const STEP_OPTIONS = [
  { label: '< 3,000', zoneKey: 'zone.sedentary' },
  { label: '3,000–7,000', zoneKey: 'zone.lightlyActive' },
  { label: '7,000–12,000', zoneKey: 'zone.active' },
  { label: '12,000+', zoneKey: 'zone.highlyActive' },
];

interface Props {
  data: SportSetup;
  onUpdate: (d: SportSetup) => void;
  onNext: () => void;
}

const SliderSelect = ({ label, options, value, onChange, t }: { label: string; options: { label: string; zoneKey: string }[]; value: string; onChange: (v: string) => void; t: (k: string) => string }) => {
  const idx = options.findIndex(o => o.label === value);
  const zone = idx >= 0 ? t(options[idx].zoneKey) : null;
  return (
    <div className="space-y-3">
      <label className="text-base text-muted-foreground">{label}</label>
      <div className="flex gap-2">
        {options.map(o => (
          <button key={o.label} onClick={() => onChange(o.label)} className={`chip flex-1 justify-center ${value === o.label ? '!bg-foreground/15 !border-foreground/30 !text-foreground' : ''}`}>
            {o.label}
          </button>
        ))}
      </div>
      {zone && <div className="text-sm text-center py-1.5 px-3 rounded-full bg-foreground/5 text-foreground/60 inline-block">{t('zone.label')} {zone}</div>}
    </div>
  );
};

export const SportSetupStep = ({ data, onUpdate, onNext }: Props) => {
  const { t } = useI18n();
  const [setup, setSetup] = useState(data);
  const update = (key: keyof SportSetup, val: string) => {
    const next = { ...setup, [key]: val };
    setSetup(next);
    onUpdate(next);
  };
  const isValid = setup.frequency !== '' && setup.duration !== '' && setup.dailySteps !== '';

  return (
    <StepLayout>
      <StepContent>
        <div className="flex flex-col items-center">
          <div className="w-full max-w-xl mb-8">
            <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] tracking-tight mb-2">
              {t('sportSetup.title')}
            </h2>
            <p className="text-muted-foreground text-base md:text-lg">
              {t('sportSetup.subtitle')}
            </p>
          </div>

          <div className="glass-card space-y-6 w-full max-w-xl">
            <SliderSelect label={t('sportSetup.frequency')} options={FREQ_OPTIONS} value={setup.frequency} onChange={v => update('frequency', v)} t={t} />
            <SliderSelect label={t('sportSetup.duration')} options={DURATION_OPTIONS} value={setup.duration} onChange={v => update('duration', v)} t={t} />
            <SliderSelect label={t('sportSetup.steps')} options={STEP_OPTIONS} value={setup.dailySteps} onChange={v => update('dailySteps', v)} t={t} />
          </div>

          <div className="w-full max-w-xl mt-6">
            <button onClick={onNext} disabled={!isValid} className={`btn-twin btn-twin-primary w-full py-2.5 text-sm disabled:opacity-30 disabled:cursor-not-allowed ${isValid ? 'btn-glow' : ''}`}>
              {t('sportSetup.proceed')}
            </button>
          </div>
        </div>
      </StepContent>
    </StepLayout>
  );
};
