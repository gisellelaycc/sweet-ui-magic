import { useState, useCallback } from 'react';
import { Slider } from '@/components/ui/slider';
import type { SoulData } from '@/types/twin-matrix';

function computeWeights(spectrum: SoulData['spectrum']) {
  const { achievementFreedom, healthSocial, disciplineRelease } = spectrum;
  return {
    achievement: Math.round((100 - achievementFreedom) * 0.6 + (100 - disciplineRelease) * 0.2 + (100 - healthSocial) * 0.2),
    exploration: Math.round(achievementFreedom * 0.5 + disciplineRelease * 0.3 + healthSocial * 0.2),
    discipline: Math.round((100 - disciplineRelease) * 0.6 + (100 - achievementFreedom) * 0.3 + (100 - healthSocial) * 0.1),
    social: Math.round(healthSocial * 0.6 + achievementFreedom * 0.2 + disciplineRelease * 0.2),
    emotional: Math.round(disciplineRelease * 0.5 + healthSocial * 0.3 + achievementFreedom * 0.2),
  };
}

interface Props {
  data: SoulData;
  onUpdate: (d: SoulData) => void;
  onNext: () => void;
}

const spectrumConfig = [
  { key: 'achievementFreedom' as const, left: 'Achievement', right: 'Freedom' },
  { key: 'healthSocial' as const, left: 'Health', right: 'Social' },
  { key: 'disciplineRelease' as const, left: 'Discipline', right: 'Release' },
];

export const SoulStep = ({ data, onUpdate, onNext }: Props) => {
  const [soul, setSoul] = useState<SoulData>(data);
  const [interacted, setInteracted] = useState(false);

  const handleSlider = useCallback((key: keyof SoulData['spectrum'], value: number) => {
    setInteracted(true);
    const nextSpectrum = { ...soul.spectrum, [key]: value };
    const weights = computeWeights(nextSpectrum);
    const next: SoulData = { spectrum: nextSpectrum, weights, confirmed: false };
    setSoul(next);
    onUpdate(next);
  }, [soul, onUpdate]);

  const confirm = () => {
    const next = { ...soul, confirmed: true };
    setSoul(next);
    onUpdate(next);
  };

  const topWeights = Object.entries(soul.weights)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div className="animate-fade-in space-y-6 max-w-lg mx-auto">
      <div>
        <h2 className="text-2xl font-bold mb-1">Soul Layer</h2>
        <p className="text-muted-foreground text-sm">Define your signal spectrum.</p>
      </div>

      <div className="glass-card space-y-7">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">Why do you move?</p>

        {spectrumConfig.map(({ key, left, right }) => (
          <div key={key} className="space-y-3">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{left}</span>
              <span>{right}</span>
            </div>
            <div className="relative group">
              <div
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at ${soul.spectrum[key]}% 50%, rgba(40, 180, 160, 0.15) 0%, transparent 70%)`,
                }}
              />
              <Slider
                value={[soul.spectrum[key]]}
                onValueChange={([v]) => handleSlider(key, v)}
                max={100}
                step={1}
                className="relative z-10"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Weight Preview */}
      {interacted && (
        <div className="glass-card space-y-3 animate-fade-in">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Signal Weights</p>
          <div className="space-y-2">
            {topWeights.map(([name, value]) => (
              <div key={name} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-foreground/70 capitalize">{name}</span>
                  <span className="text-muted-foreground">{value}</span>
                </div>
                <div className="h-1.5 bg-foreground/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${value}%`,
                      background: 'linear-gradient(90deg, rgba(40, 180, 160, 0.4), rgba(40, 180, 160, 0.7))',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {!soul.confirmed && (
            <button onClick={confirm} className="btn-twin btn-twin-primary w-full py-2 text-xs mt-2">
              Commit Signal
            </button>
          )}
          {soul.confirmed && (
            <div className="flex justify-center">
              <span className="text-green-400 text-sm">✓ Signal Committed</span>
            </div>
          )}
        </div>
      )}

      <button
        onClick={onNext}
        disabled={!soul.confirmed}
        className={`btn-twin btn-twin-primary w-full py-3 disabled:opacity-30 disabled:cursor-not-allowed ${soul.confirmed ? 'btn-glow' : ''}`}
      >
        Mint Identity State
      </button>
    </div>
  );
};
