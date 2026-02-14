import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import logo from '@/assets/twin3-logo.svg';
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
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-fade-in px-4">
      <div className="mb-8">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-foreground/5 border border-foreground/10 flex items-center justify-center">
          <img src={logo} alt="Twin Matrix" className="w-12 h-12" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Enter a private ritual of self-definition.
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
          
        </p>
      </div>

      <div className="w-full max-w-xs mb-6">
        <div className="relative">
          <input
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="your name"
            className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-center text-base text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/20 transition-colors pr-12"
          />
          <button
            onClick={handleConfirm}
            disabled={!isValid}
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              isValid
                ? 'text-foreground bg-foreground/10 hover:bg-foreground/15'
                : 'text-muted-foreground/30 cursor-not-allowed'
            }`}
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <button
        onClick={handleConfirm}
        disabled={!isValid}
        className={`btn-twin btn-twin-primary text-base px-10 py-3 disabled:opacity-30 disabled:cursor-not-allowed ${isValid ? 'btn-glow' : ''}`}
      >
        Enter the Space →
      </button>
      <p className="text-muted-foreground/50 text-xs mt-6">Takes about 2 minutes</p>
    </div>
  );
};
