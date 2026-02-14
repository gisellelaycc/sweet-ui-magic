interface Props {
  children: React.ReactNode;
}

/**
 * Fixed "stage" layout for wizard steps.
 * Supports two modes:
 * 1. Split layout (default for most steps): title left, content right
 * 2. Full layout (for Welcome, Generate, Complete): centered content
 */
export const StepLayout = ({ children }: Props) => (
  <div className="flex flex-col h-full min-h-0 relative">
    {children}
  </div>
);

/** Top zone: fixed anchor position. */
export const StepHeader = ({ children }: Props) => (
  <div className="shrink-0 pt-4 pb-3 px-8">
    {children}
  </div>
);

/** Middle zone: scrollable stage area — full width centered. */
export const StepContent = ({ children }: Props) => (
  <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
    <div className="min-h-full flex flex-col items-center justify-center px-8 py-4">
      <div className="w-full max-w-[760px]">
        {children}
      </div>
    </div>
  </div>
);

/** Bottom zone: pinned at bottom, centered narrow CTA. */
export const StepFooter = ({ children }: Props) => (
  <div className="shrink-0 px-8 py-3">
    <div className="max-w-[420px] mx-auto">
      {children}
    </div>
  </div>
);

/* ─── Split Layout ─── */
/* Left: big title + subtitle. Right: interactive content. */

interface SplitStepLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const SplitStepLayout = ({ title, subtitle, children, footer }: SplitStepLayoutProps) => {
  const words = title.split(' ');

  return (
    <div className="flex flex-col h-full min-h-0 relative">
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
        <div className="min-h-full flex flex-col lg:flex-row items-stretch px-6 md:px-10 py-8 gap-6 lg:gap-12">
          {/* Left: Title */}
          <div className="lg:w-[38%] flex flex-col justify-center shrink-0 lg:sticky lg:top-0 lg:self-start lg:pt-8">
            <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] tracking-tight mb-3">
              {words.map((word, i) => (
                <span
                  key={i}
                  className="inline-block mr-[0.3em] last:mr-0 animate-soft-enter"
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  {word}
                </span>
              ))}
            </h2>
            {subtitle && (
              <p
                className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-sm animate-soft-enter"
                style={{ animationDelay: `${words.length * 70 + 200}ms` }}
              >
                {subtitle}
              </p>
            )}
          </div>

          {/* Right: Interactive content */}
          <div className="lg:w-[62%] flex flex-col justify-center min-h-0">
            <div className="w-full animate-soft-enter" style={{ animationDelay: '300ms' }}>
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      {footer && (
        <div className="shrink-0 px-8 py-3">
          <div className="max-w-[420px] ml-auto lg:mr-[19%]">
            {footer}
          </div>
        </div>
      )}
    </div>
  );
};
