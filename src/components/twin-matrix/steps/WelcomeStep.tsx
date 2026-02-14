import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import logo from '@/assets/twin3-logo.svg';
import { StepLayout, StepHeader, StepContent, StepFooter } from '../StepLayout';

interface Props {
  username: string;
  onUpdateUsername: (name: string) => void;
  onNext: () => void;
}

export const WelcomeStep = ({ username, onUpdateUsername, onNext }: Props) => {
  const [value, setValue] = useState(username);
  const isValid = value.trim().length > 0;

  const handleConfirm = () => {
    if (!isValid) return;
    onUpdateUsername(value.trim());
    onNext();
  };

  return (
    <StepLayout>
      <StepContent>
        <div className="flex flex-col items-center text-center animate-fade-in px-4">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-foreground/5 flex items-center justify-center"
              style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.05) inset' }}>
              <img src={logo} alt="Twin Matrix" className="w-12 h-12" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Define your identity state.
            </h1>
            <p className="text-muted-foreground text-base max-w-sm mx-auto leading-relaxed">
              A private space for clarity.
            </p>
          </div>

          <div className="w-full max-w-xs mx-auto mb-6">
            <div className="relative glass-card !p-0 !rounded-xl">
              <input
                value={value}
                onChange={e => setValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleConfirm()}
                placeholder="your name"
                className="w-full bg-transparent border-none rounded-xl px-4 py-3 text-center text-base text-foreground placeholder:text-muted-foreground/40 focus:outline-none transition-colors pr-12 relative z-10"
              />
              <button
                onClick={handleConfirm}
                disabled={!isValid}
                className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all z-10 ${
                  isValid
                    ? 'text-foreground bg-foreground/10 hover:bg-foreground/15'
                    : 'text-muted-foreground/30 cursor-not-allowed'
                }`}
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </StepContent>
      <StepFooter>
        <button
          onClick={handleConfirm}
          disabled={!isValid}
          className={`btn-twin btn-twin-primary text-base px-10 py-3 w-full disabled:opacity-30 disabled:cursor-not-allowed ${isValid ? 'btn-glow' : ''}`}
        >
          Enter the Space →
        </button>
        <p className="text-muted-foreground/50 text-xs mt-3 text-center">Takes about 2 minutes</p>
      </StepFooter>
    </StepLayout>
  );
};
