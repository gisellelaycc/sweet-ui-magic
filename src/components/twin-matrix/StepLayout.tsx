interface Props {
  children: React.ReactNode;
}

/**
 * Fixed viewport layout for wizard steps.
 * Three zones: header (auto), content (flex-1 centered), CTA (auto at bottom).
 * Wrap step content in this; place your CTA as the last child.
 */
export const StepLayout = ({ children }: Props) => (
  <div className="flex flex-col h-full min-h-0">
    {children}
  </div>
);

/** Top zone: step title / description. Shrinks to fit. */
export const StepHeader = ({ children }: Props) => (
  <div className="shrink-0 pt-2 pb-4">
    {children}
  </div>
);

/** Middle zone: flex-1, content centered vertically. Scrolls only if truly overflowing. */
export const StepContent = ({ children }: Props) => (
  <div className="flex-1 min-h-0 flex flex-col items-center justify-center overflow-y-auto scrollbar-hide">
    {children}
  </div>
);

/** Bottom zone: CTA buttons pinned at bottom. */
export const StepFooter = ({ children }: Props) => (
  <div className="shrink-0 pt-4 pb-2">
    {children}
  </div>
);
