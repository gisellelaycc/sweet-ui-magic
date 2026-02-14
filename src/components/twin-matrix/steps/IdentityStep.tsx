import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { UserProfile } from '@/types/twin-matrix';
import { StepLayout, StepContent } from '../StepLayout';

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

  // Split into rows of 3
  const rows: typeof FIELDS[] = [];
  for (let i = 0; i < FIELDS.length; i += 3) {
    rows.push(FIELDS.slice(i, i + 3));
  }

  return (
    <StepLayout>
      <StepContent>
        <div className="flex flex-col items-center">
          {/* Title centered */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] tracking-tight mb-2 animate-soft-enter">
              Core Identity
            </h2>
            <p className="text-muted-foreground text-base md:text-lg animate-soft-enter" style={{ animationDelay: '100ms' }}>
              Optional signals. Nothing exposed.
            </p>
          </div>

          {/* 3-3-3 chip grid centered */}
          <div className="flex flex-col items-center gap-6 mb-12 animate-soft-enter" style={{ animationDelay: '200ms' }}>
            {rows.map((row, rowIdx) => (
              <div key={rowIdx} className="flex flex-wrap justify-center gap-3">
                {row.map((f, i) => {
                  const globalIdx = rowIdx * 3 + i;
                  const isOpen = openKey === f.key;
                  const isAnswered = answered(f.key);
                  const driftDelay = `${(globalIdx * 0.6) % 3.5}s`;

                  return (
                    <div
                      key={f.key}
                      className={`relative flex flex-wrap items-center gap-2 transition-all duration-300 ${!isAnswered && !isOpen ? 'animate-chip-drift' : ''}`}
                      style={!isAnswered && !isOpen ? { animationDelay: driftDelay } : undefined}
                    >
                      <button
                        onClick={() => toggle(f.key)}
                        className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm transition-all duration-200 border whitespace-nowrap shrink-0 ${
                          isAnswered
                            ? 'border-foreground/15 text-foreground'
                            : 'border-foreground/10 text-foreground/60 hover:text-foreground/90 hover:border-foreground/15'
                        }`}
                        style={
                          isAnswered
                            ? { background: 'rgba(10, 255, 255, 0.08)', boxShadow: '0 0 10px rgba(10, 255, 255, 0.2), 0 0 20px rgba(10, 255, 255, 0.08)' }
                            : { background: 'rgba(255, 255, 255, 0.04)' }
                        }
                      >
                        <span className="font-medium">{f.label}</span>
                        {isAnswered && <span className="text-xs text-foreground/60 ml-0.5">{profile[f.key]}</span>}
                        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${isAnswered ? 'text-foreground/40' : 'text-foreground/30'}`} />
                      </button>

                      {isOpen && (
                        <div className="animate-fade-in flex flex-wrap items-center gap-1.5">
                          {f.options.map(o => (
                            <button
                              key={o}
                              onClick={() => update(f.key, o)}
                              className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 whitespace-nowrap ${
                                profile[f.key] === o
                                  ? 'border-foreground/20 text-foreground'
                                  : 'border-transparent text-foreground/40 hover:text-foreground/70'
                              }`}
                              style={
                                profile[f.key] === o
                                  ? { background: 'rgba(10, 255, 255, 0.12)', boxShadow: '0 0 8px rgba(10, 255, 255, 0.25)' }
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

          {/* CTA centered */}
          <div className="w-full max-w-[420px] animate-soft-enter" style={{ animationDelay: '300ms' }}>
            <button onClick={onNext} className="btn-twin btn-twin-primary w-full py-2.5 text-sm btn-glow">
              Commit Core Layer
            </button>
          </div>
        </div>
      </StepContent>
    </StepLayout>
  );
};
