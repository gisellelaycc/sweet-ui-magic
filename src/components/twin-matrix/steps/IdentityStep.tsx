import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
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

const MiniField = ({
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
  <div className="space-y-1">
    <span className="text-[10px] font-medium text-foreground/60 uppercase tracking-wider">{label}</span>
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button
          key={o}
          onClick={() => onChange(value === o ? '' : o)}
          className={`chip !text-[10px] !py-1 !px-3 ${value === o ? '!bg-foreground/15 !border-foreground/30 !text-foreground' : ''}`}
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

  const isValid = true; // username already confirmed on welcome page

  return (
    <div className="animate-fade-in space-y-5 max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-0.5">Core Identity</h2>
        <p className="text-muted-foreground text-xs leading-relaxed">
          All fields optional.<br />
          Nothing is public.<br />
          This defines your identity direction.
        </p>
      </div>

      {/* Biological — default open */}
      <Collapsible defaultOpen>
        <div className="glass-card !p-3 space-y-2">
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <h3 className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest">Biological Layer</h3>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <MiniField label="Age" options={AGE_OPTIONS} value={profile.ageBin} onChange={v => update('ageBin', v)} />
              <MiniField label="Gender" options={GENDER_OPTIONS} value={profile.gender} onChange={v => update('gender', v)} />
              <MiniField label="Height" options={HEIGHT_OPTIONS} value={profile.heightBin} onChange={v => update('heightBin', v)} />
              <MiniField label="Weight" options={WEIGHT_OPTIONS} value={profile.weightBin} onChange={v => update('weightBin', v)} />
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Social — default collapsed */}
      <Collapsible>
        <div className="glass-card !p-3 space-y-2">
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <h3 className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest">Social Layer</h3>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <MiniField label="Education" options={EDUCATION_OPTIONS} value={profile.education} onChange={v => update('education', v)} />
              <MiniField label="Income" options={INCOME_OPTIONS} value={profile.income} onChange={v => update('income', v)} />
              <MiniField label="Status" options={MARITAL_OPTIONS} value={profile.maritalStatus} onChange={v => update('maritalStatus', v)} />
              <MiniField label="Occupation" options={OCCUPATION_OPTIONS} value={profile.occupation} onChange={v => update('occupation', v)} />
              <MiniField label="Living" options={LIVING_OPTIONS} value={profile.livingType} onChange={v => update('livingType', v)} />
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      <button onClick={onNext} disabled={!isValid} className={`btn-twin btn-twin-primary w-full py-2.5 disabled:opacity-30 disabled:cursor-not-allowed ${isValid ? 'btn-glow' : ''}`}>
        Commit Core Layer
      </button>
    </div>
  );
};
