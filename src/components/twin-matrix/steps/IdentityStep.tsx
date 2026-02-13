import { useState, useRef, useEffect } from 'react';
import type { UserProfile } from '@/types/twin-matrix';

const AGE_OPTIONS = ['18–24', '25–34', '35–44', '45–54', '55–64', '65+'];
const HEIGHT_OPTIONS = ['< 160 cm', '160–170', '170–180', '> 180 cm'];
const WEIGHT_OPTIONS = ['< 50 kg', '50–65', '65–80', '> 80 kg'];
const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

const EDUCATION_OPTIONS = ['High School', "Bachelor's", "Master's", 'Doctorate', 'Other', 'Prefer not to say'];
const INCOME_OPTIONS = ['< $30k', '$30k–60k', '$60k–100k', '$100k+', 'Prefer not to say'];
const MARITAL_OPTIONS = ['Single', 'In a relationship', 'Married', 'N/A', 'Prefer not to say'];
const OCCUPATION_OPTIONS = ['Student', 'Employee', 'Self-employed', 'Freelancer', 'Other'];
const LIVING_OPTIONS = ['Urban', 'Suburban', 'Rural', 'Prefer not to say'];

interface Props {
  data: UserProfile;
  onUpdate: (d: UserProfile) => void;
  onNext: () => void;
}

interface FieldDef {
  key: keyof UserProfile;
  label: string;
  options: string[];
}

const BIO_FIELDS: FieldDef[] = [
  { key: 'ageBin', label: 'Age', options: AGE_OPTIONS },
  { key: 'gender', label: 'Gender', options: GENDER_OPTIONS },
  { key: 'heightBin', label: 'Height', options: HEIGHT_OPTIONS },
  { key: 'weightBin', label: 'Weight', options: WEIGHT_OPTIONS },
];

const SOCIAL_FIELDS: FieldDef[] = [
  { key: 'education', label: 'Education', options: EDUCATION_OPTIONS },
  { key: 'income', label: 'Income', options: INCOME_OPTIONS },
  { key: 'maritalStatus', label: 'Status', options: MARITAL_OPTIONS },
  { key: 'occupation', label: 'Occupation', options: OCCUPATION_OPTIONS },
  { key: 'livingType', label: 'Living', options: LIVING_OPTIONS },
];

const SwipeRail = ({
  options,
  value,
  onChange,
  isFirstField,
  hasInteracted,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  isFirstField: boolean;
  hasInteracted: boolean;
}) => {
  const railRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative">
      {!value && (
        <p className="text-[9px] text-muted-foreground/40 italic mb-1">
          {isFirstField && !hasInteracted ? 'Slide to set' : 'No direction yet'}
        </p>
      )}
      <div
        ref={railRef}
        className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1 snap-x snap-mandatory"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {options.map(o => (
          <button
            key={o}
            onClick={() => onChange(value === o ? '' : o)}
            className={`snap-center shrink-0 text-[10px] px-2.5 py-1 rounded-full border transition-all duration-200 ${
              value === o
                ? 'border-foreground/25 text-foreground'
                : 'border-transparent text-muted-foreground/50 hover:text-muted-foreground/80'
            }`}
            style={
              value === o
                ? {
                    background: 'rgba(40, 180, 160, 0.12)',
                    boxShadow: '0 0 8px rgba(40, 180, 160, 0.2), 0 0 16px rgba(40, 180, 160, 0.08)',
                  }
                : { background: 'transparent' }
            }
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
};

const FieldRow = ({
  field,
  value,
  onChange,
  isFirstField,
  hasInteracted,
}: {
  field: FieldDef;
  value: string;
  onChange: (v: string) => void;
  isFirstField: boolean;
  hasInteracted: boolean;
}) => (
  <div className="flex items-start gap-4 py-2.5 border-b border-foreground/[0.04] last:border-0">
    <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider w-16 shrink-0 pt-0.5">
      {field.label}
    </span>
    <div className="flex-1 min-w-0">
      <SwipeRail
        options={field.options}
        value={value}
        onChange={onChange}
        isFirstField={isFirstField}
        hasInteracted={hasInteracted}
      />
    </div>
  </div>
);

export const IdentityStep = ({ data, onUpdate, onNext }: Props) => {
  const [profile, setProfile] = useState(data);
  const [hasInteracted, setHasInteracted] = useState(false);

  const update = (key: keyof UserProfile, val: string) => {
    if (!hasInteracted) setHasInteracted(true);
    const next = { ...profile, [key]: val };
    setProfile(next);
    onUpdate(next);
  };

  return (
    <div className="animate-fade-in space-y-4 max-w-3xl mx-auto">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold mb-0.5">Core Identity</h2>
        <p className="text-muted-foreground text-[10px] leading-relaxed">
          All fields optional · Nothing is public · This defines your identity direction
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Biological Layer */}
        <div className="space-y-0">
          <h3 className="text-[9px] font-semibold text-muted-foreground/50 uppercase tracking-widest mb-2">
            Biological Layer
          </h3>
          <div className="glass-card !p-3 !rounded-xl">
            {BIO_FIELDS.map((f, i) => (
              <FieldRow
                key={f.key}
                field={f}
                value={profile[f.key]}
                onChange={v => update(f.key, v)}
                isFirstField={i === 0}
                hasInteracted={hasInteracted}
              />
            ))}
          </div>
        </div>

        {/* Social Layer */}
        <div className="space-y-0">
          <h3 className="text-[9px] font-semibold text-muted-foreground/50 uppercase tracking-widest mb-2">
            Social Layer
          </h3>
          <div className="glass-card !p-3 !rounded-xl">
            {SOCIAL_FIELDS.map((f, i) => (
              <FieldRow
                key={f.key}
                field={f}
                value={profile[f.key]}
                onChange={v => update(f.key, v)}
                isFirstField={false}
                hasInteracted={hasInteracted}
              />
            ))}
          </div>
        </div>
      </div>

      <button onClick={onNext} className="btn-twin btn-twin-primary w-full py-2.5 btn-glow">
        Commit Core Layer
      </button>
    </div>
  );
};
