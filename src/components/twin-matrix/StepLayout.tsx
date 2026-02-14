interface Props {
  children: React.ReactNode;
}

/**
 * Fixed "stage" layout for wizard steps.
 * - StepHeader: fixed top anchor (pt-88px equivalent)
 * - StepContent: scrollable middle stage, max-width 760px, centered
 * - StepFooter: fixed glass dock at bottom, centered narrow CTA
 */
export const StepLayout = ({ children }: Props) => (
  <div className="flex flex-col h-full min-h-0 relative">
    {children}
  </div>
);

/** Top zone: fixed anchor position. Does NOT shift with content. */
export const StepHeader = ({ children }: Props) => (
  <div className="shrink-0 pt-4 pb-3 px-8">
    {children}
  </div>
);

/** Middle zone: scrollable stage area. Content centered when short, scrolls when long. */
export const StepContent = ({ children }: Props) => (
  <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
    <div className="min-h-full flex flex-col items-center justify-center px-8 py-4">
      <div className="w-full max-w-[760px]">
        {children}
      </div>
    </div>
  </div>
);

/** Bottom zone: glass dock pinned at bottom with constrained CTA. */
export const StepFooter = ({ children }: Props) => (
  <div className="shrink-0 px-8 py-3">
    <div
      className="max-w-[420px] mx-auto rounded-2xl px-6 py-3"
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.06) inset, 0 -4px 24px rgba(0, 0, 0, 0.2)',
      }}
    >
      {children}
    </div>
  </div>
);
