interface StepIndicatorProps {
  current: number;
  total: number;
}

export const StepIndicator = ({ current, total }: StepIndicatorProps) => {
  const progress = ((current) / total) * 100;

  return (
    <div className="w-24 h-1 rounded-full bg-transparent overflow-hidden relative">
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{
          width: `${progress}%`,
          background: 'linear-gradient(90deg, rgba(10,255,255,0.5), rgba(10,255,255,0.9))',
          boxShadow: '0 0 6px rgba(10,255,255,0.5), 0 0 16px rgba(10,255,255,0.25)',
        }}
      />
    </div>
  );
};
