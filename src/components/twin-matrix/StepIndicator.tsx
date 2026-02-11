interface StepIndicatorProps {
  current: number;
  total: number;
}

export const StepIndicator = ({ current, total }: StepIndicatorProps) => {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-500 ${
            i < current
              ? 'w-6 bg-foreground'
              : i === current
              ? 'w-8 bg-foreground'
              : 'w-4 bg-muted'
          }`}
        />
      ))}
    </div>
  );
};
