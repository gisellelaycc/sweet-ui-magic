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

  return (
    <div className="animate-fade-in space-y-6 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold mb-0.5">Core Identity</h2>
        <p className="text-muted-foreground text-[10px] leading-relaxed">
          All optional · Nothing public · Set your direction
        </p>
      </div>

      {/* Chip cloud */}
      <div className="flex flex-wrap justify-center gap-2.5 px-2">
        {FIELDS.map((f, i) => {
          const isOpen = openKey === f.key;
          const isAnswered = answered(f.key);
          const driftDelay = `${(i * 0.6) % 3.5}s`;

          return (
            <div
              key={f.key}
              className={`transition-all duration-300 ${!isAnswered && !isOpen ? 'animate-chip-drift' : ''}`}
              style={!isAnswered && !isOpen ? { animationDelay: driftDelay } : undefined}
            >
              {/* Chip button */}
              <button
                onClick={() => toggle(f.key)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] transition-all duration-200 border ${
                  isAnswered
                    ? 'border-foreground/15 text-foreground'
                    : 'border-foreground/[0.06] text-muted-foreground/60 hover:text-muted-foreground/90 hover:border-foreground/10'
                }`}
                style={
                  isAnswered
                    ? {
                        background: 'rgba(40, 180, 160, 0.08)',
                        boxShadow: '0 0 10px rgba(40, 180, 160, 0.15), 0 0 20px rgba(40, 180, 160, 0.06)',
                      }
                    : { background: 'rgba(255, 255, 255, 0.03)' }
                }
              >
                <span className="font-medium">{f.label}</span>
                {isAnswered && (
                  <span className="text-[10px] text-muted-foreground/80 ml-0.5">{profile[f.key]}</span>
                )}
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${
                    isAnswered ? 'text-foreground/40' : 'text-muted-foreground/30'
                  }`}
                />
              </button>

              {/* Expandable options */}
              {isOpen && (
                <div className="animate-fade-in mt-1.5 flex flex-wrap gap-1 justify-center max-w-[280px]">
                  {f.options.map(o => (
                    <button
                      key={o}
                      onClick={() => update(f.key, o)}
                      className={`text-[10px] px-2.5 py-1 rounded-full border transition-all duration-200 ${
                        profile[f.key] === o
                          ? 'border-foreground/20 text-foreground'
                          : 'border-transparent text-muted-foreground/50 hover:text-muted-foreground/80'
                      }`}
                      style={
                        profile[f.key] === o
                          ? {
                              background: 'rgba(40, 180, 160, 0.12)',
                              boxShadow: '0 0 8px rgba(40, 180, 160, 0.2)',
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

      <button onClick={onNext} className="btn-twin btn-twin-primary w-full py-2.5 btn-glow mt-4">
        Commit Core Layer
      </button>
    </div>
  );
};
