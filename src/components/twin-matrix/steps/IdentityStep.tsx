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

const CompactField = ({
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
  <div className="space-y-1.5">
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-foreground/80">{label}</span>
      <span className="text-[9px] text-muted-foreground/40 uppercase tracking-wider">optional</span>
    </div>
    <div className="flex flex-wrap gap-1">
      {options.map(o => (
        <button
          key={o}
          onClick={() => onChange(value === o ? '' : o)}
          className={`chip !text-[11px] !py-1 !px-2.5 ${value === o ? '!bg-foreground/15 !border-foreground/30 !text-foreground' : ''}`}
        >
          {o}
        </button>
      ))}
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
    <div className="animate-fade-in space-y-5 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold mb-1">Core Identity</h2>
        <p className="text-muted-foreground text-sm">
          All fields are optional. This only shapes your identity direction — nothing is made public.
        </p>
      </div>

      {/* Username (required) */}
      <div className="glass-card !p-4 space-y-1.5">
        <label className="text-xs text-muted-foreground">Username</label>
        <input
          value={profile.username}
          onChange={e => update('username', e.target.value)}
          placeholder="Choose a name"
          className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/25 transition-colors"
        />
      </div>

      {/* Section A: Biological */}
      <div className="glass-card !p-4 space-y-3">
        <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Biological Traits</h3>
        <CompactField label="Age Range" options={AGE_OPTIONS} value={profile.ageBin} onChange={v => update('ageBin', v)} />
        <CompactField label="Height" options={HEIGHT_OPTIONS} value={profile.heightBin} onChange={v => update('heightBin', v)} />
        <CompactField label="Weight" options={WEIGHT_OPTIONS} value={profile.weightBin} onChange={v => update('weightBin', v)} />
        <CompactField label="Gender" options={GENDER_OPTIONS} value={profile.gender} onChange={v => update('gender', v)} />
      </div>

      {/* Section B: Social */}
      <div className="glass-card !p-4 space-y-3">
        <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Social Positioning</h3>
        <CompactField label="Education" options={EDUCATION_OPTIONS} value={profile.education} onChange={v => update('education', v)} />
        <CompactField label="Annual Income" options={INCOME_OPTIONS} value={profile.income} onChange={v => update('income', v)} />
        <CompactField label="Marital Status" options={MARITAL_OPTIONS} value={profile.maritalStatus} onChange={v => update('maritalStatus', v)} />
        <CompactField label="Occupation" options={OCCUPATION_OPTIONS} value={profile.occupation} onChange={v => update('occupation', v)} />
        <CompactField label="Living Environment" options={LIVING_OPTIONS} value={profile.livingType} onChange={v => update('livingType', v)} />
        <CompactField label="Ethnic Background" options={ETHNICITY_OPTIONS} value={profile.ethnicity} onChange={v => update('ethnicity', v)} />
      </div>

      <button onClick={onNext} disabled={!isValid} className="btn-twin btn-twin-primary w-full py-3 disabled:opacity-30 disabled:cursor-not-allowed">
        Continue
      </button>
    </div>
  );
};
