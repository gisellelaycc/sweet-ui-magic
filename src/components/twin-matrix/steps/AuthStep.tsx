import { useState } from 'react';
import type { AuthSetup } from '@/types/twin-matrix';

const SCOPE_OPTIONS = ['Core Identity', 'Topic Modules', 'Motivation Layer', 'Full Identity'];
const DURATION_OPTIONS = ['24 Hours', '7 Days', 'Custom'];
const USAGE_OPTIONS = ['Single Use', 'Limited Uses', 'Non-resettable'];

interface Props {
  data: AuthSetup;
  onUpdate: (d: AuthSetup) => void;
  onNext: () => void;
}

const OptionGroup = ({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="space-y-3">
    <label className="text-sm font-medium text-foreground">{label}</label>
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`chip text-sm ${value === o ? '!bg-foreground/15 !border-foreground/30 !text-foreground' : ''}`}
        >
          {o}
        </button>
      ))}
    </div>
  </div>
);

export const AuthStep = ({ data, onUpdate, onNext }: Props) => {
  const [setup, setSetup] = useState(data);

  const update = (key: keyof AuthSetup, val: string) => {
    const next = { ...setup, [key]: val };
    setSetup(next);
    onUpdate(next);
  };

  const isValid = setup.scope && setup.duration && setup.usageLimit;

  return (
    <div className="animate-fade-in space-y-6 max-w-lg mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-1">Issue Authorization Credential</h2>
        <p className="text-muted-foreground text-sm">Configure the scope and constraints of your identity credential.</p>
      </div>

      <div className="glass-card space-y-6">
        <OptionGroup label="Scope" options={SCOPE_OPTIONS} value={setup.scope} onChange={v => update('scope', v)} />
        <OptionGroup label="Duration" options={DURATION_OPTIONS} value={setup.duration} onChange={v => update('duration', v)} />
        <OptionGroup label="Usage Limit" options={USAGE_OPTIONS} value={setup.usageLimit} onChange={v => update('usageLimit', v)} />
      </div>

      <button onClick={onNext} disabled={!isValid} className="btn-twin btn-twin-primary w-full py-3 disabled:opacity-30 disabled:cursor-not-allowed">
        Confirm & Issue
      </button>
    </div>
  );
};
