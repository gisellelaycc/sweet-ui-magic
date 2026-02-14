import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import logo from '@/assets/twin3-logo.svg';
import { StepLayout, StepContent } from '../StepLayout';

interface Props {
  username: string;
  onUpdateUsername: (name: string) => void;
  onNext: () => void;
}

/* ── Glowing divider line (white, shimmering) ── */
const GlowLine = () => (
  <div className="relative w-full h-px mt-1 mb-6">
    <div className="absolute inset-0 bg-foreground/10" />
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute top-0 h-full w-[60px]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent)',
          animation: 'divider-trace-welcome 6s linear infinite',
        }}
      />
    </div>
  </div>
);

/* ── Scan Glow Title: text itself glows as scan passes ── */
const ScanGlowTitle = ({ text, visible }: { text: string; visible: boolean }) => (
  <h1
    className="text-4xl sm:text-5xl md:text-[3.5rem] font-bold tracking-tight leading-[1.15] whitespace-nowrap relative"
    style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'scale(1)' : 'scale(0.92)',
      transition: 'opacity 800ms ease-out, transform 800ms ease-out',
    }}
  >
    <span className="scan-text-base">{text}</span>
    <span className="scan-text-glow" aria-hidden="true">{text}</span>
  </h1>
);

export const WelcomeStep = ({ username, onUpdateUsername, onNext }: Props) => {
  const [value, setValue] = useState(username);
  const isValid = value.trim().length > 0;

  const [titleVisible, setTitleVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setTitleVisible(true), 600);
    const t2 = setTimeout(() => setContentVisible(true), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleConfirm = () => {
    if (!isValid) return;
    onUpdateUsername(value.trim());
    onNext();
  };

  return (
    <StepLayout>
      <StepContent>
        <div className="relative flex flex-col items-center justify-center text-center min-h-[70vh] px-4">
          <div className="relative z-10 flex flex-col items-center">
            {/* Logo */}
            <img
              src={logo}
              alt="Twin Matrix"
              className="w-12 h-12 mb-8"
              style={{
                opacity: titleVisible ? 1 : 0,
                transition: 'opacity 600ms ease-out',
              }}
            />

            <ScanGlowTitle text="Bring your 256D self to life." visible={titleVisible} />

            <p
              className="text-muted-foreground text-lg md:text-xl max-w-md mx-auto leading-relaxed mt-5"
              style={{
                opacity: titleVisible ? 1 : 0,
                transform: titleVisible ? 'translateY(0)' : 'translateY(12px)',
                transition: 'opacity 600ms ease-out 400ms, transform 600ms ease-out 400ms',
              }}
            >
              Build an OpenClaw agent that thinks like you.
            </p>

            {/* Input + Arrow merged in one row */}
            <div
              className="mt-10 w-full max-w-sm mx-auto"
              style={{
                opacity: contentVisible ? 1 : 0,
                transform: contentVisible ? 'translateY(0)' : 'translateY(16px)',
                transition: 'opacity 600ms ease-out, transform 600ms ease-out',
              }}
            >
              {/* Inline input with arrow */}
              <div className="relative flex items-center pb-0">
                <input
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleConfirm()}
                  placeholder="Your name"
                  className="flex-1 bg-transparent border-none px-0 py-1 text-xl text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
                />
                <button
                  onClick={handleConfirm}
                  disabled={!isValid}
                  className={`ml-2 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                    isValid
                      ? 'text-foreground hover:bg-foreground/10'
                      : 'text-muted-foreground/30 cursor-not-allowed'
                  }`}
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Glow divider — tight to input */}
              <GlowLine />

              {/* Subtitle below divider */}
              <p className="text-muted-foreground/50 text-xs text-center -mt-3">
                Shape your 256D space in 2 min.
              </p>
            </div>
          </div>
        </div>
      </StepContent>
    </StepLayout>
  );
};
