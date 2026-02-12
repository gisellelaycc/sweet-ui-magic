import { useState } from 'react';
import type { UserProfile } from '@/types/twin-matrix';

const AGE_OPTIONS = ['18–24', '25–34', '35–44', '45+'];
const HEIGHT_OPTIONS = ['< 160 cm', '160–170 cm', '170–180 cm', '> 180 cm'];
const WEIGHT_OPTIONS = ['< 50 kg', '50–65 kg', '65–80 kg', '> 80 kg'];
const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

const EDUCATION_OPTIONS = ['High School', 'Bachelor\'s', 'Master\'s', 'Doctorate', 'Other'];
const INCOME_OPTIONS = ['< $30k', '$30k–$60k', '$60k–$100k', '$100k+', 'Prefer not to say'];
const MARITAL_OPTIONS = ['Single', 'In a relationship', 'Married', 'Prefer not to say'];
const OCCUPATION_OPTIONS = ['Student', 'Employee', 'Self-employed', 'Freelancer', 'Other'];
const LIVING_OPTIONS = ['Urban', 'Suburban', 'Rural'];
const ETHNICITY_OPTIONS = ['Asian', 'Black', 'Hispanic', 'White', 'Mixed', 'Other', 'Prefer not to say'];

interface Props {
  data: UserProfile;
  onUpdate: (d: UserProfile) => void;
  onNext: () => void;
}

const FieldCard = ({
  label,
  options,
  value,
  onChange,
  skippable = true,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  skippable?: boolean;
}) => (
  <div className={`flex items-center justify-between gap-4 p-4 rounded-2xl border transition-all duration-300 ${
    value
      ? 'bg-foreground/[0.06] border-foreground/20 shadow-[0_0_12px_rgba(255,255,255,0.04)]'
      : 'bg-foreground/[0.02] border-foreground/[0.06]'
  }`}>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {skippable && <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">optional</span>}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {options.map(o => (
          <button
            key={o}
            onClick={() => onChange(value === o ? '' : o)}
            className={`chip !text-xs !py-1.5 !px-3 ${value === o ? '!bg-foreground/15 !border-foreground/30 !text-foreground' : ''}`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  </div>
);

export const IdentityStep = ({ data, onUpdate, onNext }: Props) => {
  const [profile, setProfile] = useState(data);
  const update = (key: keyof UserProfile, val: string) => {
    const next = { ...profile, [key]: val };
    setProfile(next);
    onUpdate(next);
  };

  const isValid = profile.username.trim().length > 0;

  return (
    <div className="animate-fade-in space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold mb-1">Core Identity</h2>
        <p className="text-muted-foreground text-sm">
          All fields are optional. This only shapes your identity direction — nothing is made public.
        </p>
      </div>

      {/* Username (required) */}
      <div className="glass-card space-y-2">
        <label className="text-sm text-muted-foreground">Username</label>
        <input
          value={profile.username}
          onChange={e => update('username', e.target.value)}
          placeholder="Choose a name"
          className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/25 transition-colors"
        />
      </div>

      {/* Section A: Biological */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Biological Traits</h3>
        <FieldCard label="Select your age range" options={AGE_OPTIONS} value={profile.ageBin} onChange={v => update('ageBin', v)} />
        <FieldCard label="Height" options={HEIGHT_OPTIONS} value={profile.heightBin} onChange={v => update('heightBin', v)} />
        <FieldCard label="Weight" options={WEIGHT_OPTIONS} value={profile.weightBin} onChange={v => update('weightBin', v)} />
        <FieldCard label="Gender" options={GENDER_OPTIONS} value={profile.gender} onChange={v => update('gender', v)} />
      </div>

      {/* Section B: Social */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Social Positioning</h3>
        <FieldCard label="Education" options={EDUCATION_OPTIONS} value={profile.education} onChange={v => update('education', v)} />
        <FieldCard label="Annual Income" options={INCOME_OPTIONS} value={profile.income} onChange={v => update('income', v)} />
        <FieldCard label="Marital Status" options={MARITAL_OPTIONS} value={profile.maritalStatus} onChange={v => update('maritalStatus', v)} />
        <FieldCard label="Occupation" options={OCCUPATION_OPTIONS} value={profile.occupation} onChange={v => update('occupation', v)} />
        <FieldCard label="Living Environment" options={LIVING_OPTIONS} value={profile.livingType} onChange={v => update('livingType', v)} />
        <FieldCard label="Ethnic Background" options={ETHNICITY_OPTIONS} value={profile.ethnicity} onChange={v => update('ethnicity', v)} />
      </div>

      <button onClick={onNext} disabled={!isValid} className="btn-twin btn-twin-primary w-full py-3 disabled:opacity-30 disabled:cursor-not-allowed">
        Continue
      </button>
    </div>
  );
};
