import { useEffect, useState } from 'react';

interface Props {
  onComplete: (signature: string[]) => void;
}

export const GenerateStep = ({ onComplete }: Props) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('分析身份數據...');

  useEffect(() => {
    const phases = [
      { at: 20, text: '建構 256 維度矩陣...' },
      { at: 50, text: '計算靈魂主軸...' },
      { at: 75, text: '生成 Signature Code...' },
      { at: 95, text: '完成！' },
    ];

    const interval = setInterval(() => {
      setProgress(p => {
        const next = Math.min(p + 2, 100);
        const currentPhase = phases.filter(ph => ph.at <= next).pop();
        if (currentPhase) setPhase(currentPhase.text);
        if (next >= 100) {
          clearInterval(interval);
          // Generate random signature
          const sig = Array.from({ length: 16 }, () =>
            Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()
          );
          setTimeout(() => onComplete(sig), 500);
        }
        return next;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-fade-in px-4">
      {/* Matrix animation */}
      <div className="w-32 h-32 mb-8 relative">
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-1">
          {Array.from({ length: 16 }, (_, i) => (
            <div
              key={i}
              className="rounded-sm transition-all duration-300"
              style={{
                background: progress > (i / 16) * 100
                  ? `hsl(${(i * 22.5) % 360} 60% 50% / ${0.3 + Math.random() * 0.7})`
                  : 'rgba(255,255,255,0.05)',
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>

      <h2 className="text-xl font-bold mb-2">⚙️ 生成 Twin Matrix</h2>
      <p className="text-muted-foreground text-sm mb-6">{phase}</p>

      <div className="w-64 h-2 bg-foreground/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-foreground/80 rounded-full transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground/50 mt-2">{progress}%</p>
    </div>
  );
};
