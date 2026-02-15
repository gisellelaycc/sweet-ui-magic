import { useState, useEffect } from 'react';
import logo from '@/assets/twin3-logo.svg';
import { StepLayout, StepContent } from '../StepLayout';
import { useI18n } from '@/lib/i18n';

interface Props {
  onNext: () => void;
  locked?: boolean;
  onRequestConnect?: () => void;
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

export const WelcomeStep = ({ onNext, locked = false, onRequestConnect }: Props) => {
  const { t } = useI18n();

  const [titleVisible, setTitleVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setTitleVisible(true), 600);
    const t2 = setTimeout(() => setContentVisible(true), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleConfirm = () => {
    if (locked) return;
    onNext();
  };

  return (
    <StepLayout>
      <StepContent>
        <div className="relative flex flex-col items-center justify-center text-center min-h-[70vh] px-4">
          <div className="relative z-10 flex flex-col items-center">
            <img
              src={logo}
              alt="Twin Matrix"
              className="w-12 h-12 mb-8"
              style={{
                opacity: titleVisible ? 1 : 0,
                transition: 'opacity 600ms ease-out',
              }}
            />

            <ScanGlowTitle text={t('welcome.title')} visible={titleVisible} />

            <p
              className="text-muted-foreground text-lg md:text-xl max-w-md mx-auto leading-relaxed mt-5"
              style={{
                opacity: titleVisible ? 1 : 0,
                transform: titleVisible ? 'translateY(0)' : 'translateY(12px)',
                transition: 'opacity 600ms ease-out 400ms, transform 600ms ease-out 400ms',
              }}
            >
              {t('welcome.subtitle')}
            </p>

            <div
              className="mt-10 w-full max-w-sm mx-auto relative"
              style={{
                opacity: contentVisible ? 1 : 0,
                transform: contentVisible ? 'translateY(0)' : 'translateY(16px)',
                transition: 'opacity 600ms ease-out, transform 600ms ease-out',
              }}
            >
              <button
                onClick={handleConfirm}
                disabled={locked}
                className="btn-twin btn-twin-primary btn-glow w-full py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('welcome.start')}
              </button>

              <div className="mt-4">
                <GlowLine />
              </div>

              {locked && (
                <div className="absolute inset-0 rounded-xl bg-background/70 backdrop-blur-sm border border-foreground/10 flex flex-col items-center justify-center gap-4 px-4 py-6 min-h-[120px]">
                  <p className="text-xs text-muted-foreground text-center">
                    Connect wallet to continue.
                  </p>
                  <button
                    onClick={onRequestConnect}
                    className="btn-twin btn-twin-primary py-2 px-3 text-xs"
                  >
                    Connect Wallet
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </StepContent>
    </StepLayout>
  );
};
