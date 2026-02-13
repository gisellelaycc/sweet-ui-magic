interface StepIndicatorProps {
  current: number;
  total: number;
}

export const StepIndicator = ({ current, total }: StepIndicatorProps) => {
  const progress = ((current) / total) * 100;

  return (
    <div className="w-24 h-1 rounded-full bg-transparent overflow-hidden relative">
      <div
        className="h-full rounded-full transition-all duration-700 ease-out animate-glow-pulse"
        style={{
          width: `${progress}%`,
          background: 'linear-gradient(90deg, hsl(var(--foreground) / 0.4), hsl(var(--foreground) / 0.8))',
        }}
      />
    </div>
  );
};
