import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { UserProfile } from '@/types/twin-matrix';

const FIELDS: { key: keyof UserProfile; label: string; options: string[] }[] = [
  { key: 'ageBin', label: 'Age?', options: ['18–24', '25–34', '35–44', '45–54', '55–64', '65+'] },
  { key: 'gender', label: 'Gender?', options: ['Male', 'Female', 'Non-binary', 'Prefer not to say'] },
  { key: 'heightBin', label: 'Height?', options: ['< 160 cm', '160–170', '170–180', '> 180 cm'] },
  { key: 'weightBin', label: 'Weight?', options: ['< 50 kg', '50–65', '65–80', '> 80 kg'] },
  { key: 'education', label: 'Education?', options: ['High School', "Bachelor's", "Master's", 'Doctorate', 'Other', 'Prefer not to say'] },
  { key: 'income', label: 'Income?', options: ['< $30k', '$30k–60k', '$60k–100k', '$100k+', 'Prefer not to say'] },
  { key: 'maritalStatus', label: 'Status?', options: ['Single', 'In a relationship', 'Married', 'N/A', 'Prefer not to say'] },
  { key: 'occupation', label: 'Work?', options: ['Student', 'Employee', 'Self-employed', 'Freelancer', 'Other'] },
  { key: 'livingType', label: 'Living?', options: ['Urban', 'Suburban', 'Rural', 'Prefer not to say'] },
];

interface Props {
  data: UserProfile;
  onUpdate: (d: UserProfile) => void;
  onNext: () => void;
}

export const IdentityStep = ({ data, onUpdate, onNext }: Props) => {
  const [profile, setProfile] = useState(data);
  const [openKey, setOpenKey] = useState<string | null>(null);

  const update = (key: keyof UserProfile, val: string) => {
    const next = { ...profile, [key]: val === profile[key] ? '' : val };
    setProfile(next);
    onUpdate(next);
    if (val !== profile[key]) setOpenKey(null);
  };

  const toggle = (key: string) => setOpenKey(prev => (prev === key ? null : key));

  const answered = (key: keyof UserProfile) => !!profile[key];

  // Split into rows of 3-3-3
  const rows = [FIELDS.slice(0, 3), FIELDS.slice(3, 6), FIELDS.slice(6, 9)];

  return (
    <div className="animate-fade-in flex flex-col items-center justify-center h-full max-w-4xl mx-auto px-4">
      {/* Title block */}
      <div className="text-center mb-20">
        <h2 className="text-2xl font-bold text-foreground mb-1">Core Identity</h2>
        <p className="text-foreground/50 text-xs leading-relaxed">
          Optional signals. Nothing exposed.
        </p>
      </div>

      {/* Chip cloud — 3×3 centered, wide gaps, inline options */}
      <div className="flex flex-col items-center gap-5 mb-20 w-full">
        {rows.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-8">
            {row.map((f, i) => {
              const globalIdx = ri * 3 + i;
              const isOpen = openKey === f.key;
              const isAnswered = answered(f.key);
              const driftDelay = `${(globalIdx * 0.6) % 3.5}s`;

              return (
                <div
                  key={f.key}
                  className={`relative flex items-center gap-2 transition-all duration-300 ${!isAnswered && !isOpen ? 'animate-chip-drift' : ''}`}
                  style={!isAnswered && !isOpen ? { animationDelay: driftDelay } : undefined}
                >
                  <button
                    onClick={() => toggle(f.key)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] transition-all duration-200 border whitespace-nowrap shrink-0 ${
                      isAnswered
                        ? 'border-foreground/15 text-foreground'
                        : 'border-foreground/10 text-foreground/60 hover:text-foreground/90 hover:border-foreground/15'
                    }`}
                    style={
                      isAnswered
                        ? {
                            background: 'rgba(10, 255, 255, 0.08)',
                            boxShadow: '0 0 10px rgba(10, 255, 255, 0.2), 0 0 20px rgba(10, 255, 255, 0.08)',
                          }
                        : { background: 'rgba(255, 255, 255, 0.04)' }
                    }
                  >
                    <span className="font-medium">{f.label}</span>
                    {isAnswered && (
                      <span className="text-[11px] text-foreground/60 ml-0.5">{profile[f.key]}</span>
                    )}
                    <ChevronDown
                      className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${
                        isAnswered ? 'text-foreground/40' : 'text-foreground/30'
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="animate-fade-in flex items-center gap-1.5 flex-nowrap">
                      {f.options.map(o => (
                        <button
                          key={o}
                          onClick={() => update(f.key, o)}
                          className={`text-[11px] px-2.5 py-1 rounded-full border transition-all duration-200 whitespace-nowrap ${
                            profile[f.key] === o
                              ? 'border-foreground/20 text-foreground'
                              : 'border-transparent text-foreground/40 hover:text-foreground/70'
                          }`}
                          style={
                            profile[f.key] === o
                              ? {
                                  background: 'rgba(10, 255, 255, 0.12)',
                                  boxShadow: '0 0 8px rgba(10, 255, 255, 0.25)',
                                }
                              : { background: 'transparent' }
                          }
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Commit button */}
      <button onClick={onNext} className="btn-twin btn-twin-primary w-full max-w-md py-2.5 btn-glow">
        Commit Core Layer
      </button>
    </div>
  );
};
