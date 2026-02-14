import { useState } from 'react';
import type { SportTwin } from '@/types/twin-matrix';
import { StepLayout, StepContent } from '../StepLayout';

const SPORTS = [
  'Running', 'Cycling', 'Long-distance Swimming', 'Trail / Off-road Running',
  'Strength Training', 'Yoga & Pilates', 'Team Sports', 'Combat Sports',
  'Racquet Sports', 'Climbing', 'Golf',
];
const OUTFIT_STYLES = [
  'Minimal Functional', 'Streetwear Athletic', 'Pro Competition', 'Casual Comfort',
  'Premium Athletic', 'Retro Sports', 'Outdoor Technical', 'Tight Performance',
  'Vivid & Energetic', 'Brand Centric',
];
const BRANDS = ['Nike', 'Adidas', 'Under Armour', 'Lululemon', 'New Balance', 'ASICS', 'Puma', 'Reebok', 'On', 'Hoka'];

interface Props {
  data: SportTwin;
  onUpdate: (d: SportTwin) => void;
  onNext: () => void;
}

export const SportTwinStep = ({ data, onUpdate, onNext }: Props) => {
  const [twin, setTwin] = useState(data);

  const toggleSport = (s: string) => {
    const list = twin.sportRanking.includes(s)
      ? twin.sportRanking.filter(x => x !== s)
      : twin.sportRanking.length < 10 ? [...twin.sportRanking, s] : twin.sportRanking;
    const next = { ...twin, sportRanking: list };
    setTwin(next);
    onUpdate(next);
  };

  const toggleStyle = (s: string) => {
    const list = twin.outfitStyle.includes(s)
      ? twin.outfitStyle.filter(x => x !== s)
      : [...twin.outfitStyle, s];
    const next = { ...twin, outfitStyle: list };
    setTwin(next);
    onUpdate(next);
  };

  const toggleBrand = (b: string) => {
    const list = twin.brands.includes(b)
      ? twin.brands.filter(x => x !== b)
      : [...twin.brands, b];
    const next = { ...twin, brands: list };
    setTwin(next);
    onUpdate(next);
  };

  const isValid = twin.sportRanking.length > 0 && twin.outfitStyle.length > 0 && twin.brands.length > 0;

  return (
    <StepLayout>
      <StepContent>
        <div className="flex flex-col items-center">
          {/* Title centered */}
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] tracking-tight mb-2">
              Most frequent activities
            </h2>
            <p className="text-muted-foreground text-base md:text-lg">
              Order what feels essential.
            </p>
          </div>

          {/* 3 cards horizontal */}
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="glass-card !p-4 space-y-2 flex-1 min-w-0">
              <div>
                <label className="text-sm font-medium text-foreground">Select your most frequent activities</label>
                <p className="text-xs text-muted-foreground mt-0.5">Order reflects priority (up to 10).</p>
              </div>
              {twin.sportRanking.length > 0 && (
                <p className="text-xs text-muted-foreground">Selected {twin.sportRanking.length} / 10</p>
              )}
              <div className="flex flex-wrap gap-1.5">
                {SPORTS.map(s => {
                  const rank = twin.sportRanking.indexOf(s);
                  const isSelected = rank >= 0;
                  return (
                    <button
                      key={s}
                      onClick={() => toggleSport(s)}
                      className={`chip !text-xs !py-1.5 !px-3 relative ${isSelected ? '!bg-foreground/15 !border-foreground/30 !text-foreground' : ''}`}
                    >
                      {s}
                      {isSelected && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-foreground text-background text-[9px] flex items-center justify-center font-bold">
                          {rank + 1}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="glass-card !p-4 space-y-2 flex-1 min-w-0">
              <div>
                <label className="text-sm font-medium text-foreground">Outfit Style</label>
                <p className="text-xs text-muted-foreground mt-0.5">Select styles that best represent your athletic expression.</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {OUTFIT_STYLES.map(s => (
                  <button
                    key={s}
                    onClick={() => toggleStyle(s)}
                    className={`chip !text-xs !py-1.5 !px-3 ${twin.outfitStyle.includes(s) ? '!bg-foreground/15 !border-foreground/30 !text-foreground' : ''}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card !p-4 space-y-2 flex-1 min-w-0">
              <div>
                <label className="text-sm font-medium text-foreground">Brand Preferences</label>
                <p className="text-xs text-muted-foreground mt-0.5">Brands you've worn most in the past year.</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {BRANDS.map(b => (
                  <button
                    key={b}
                    onClick={() => toggleBrand(b)}
                    className={`chip !text-xs !py-1.5 !px-3 ${twin.brands.includes(b) ? '!bg-foreground/15 !border-foreground/30 !text-foreground' : ''}`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CTA centered */}
          <div className="w-full max-w-md mx-auto mt-6">
            <button onClick={onNext} disabled={!isValid} className="btn-twin btn-twin-primary w-full py-2.5 text-sm disabled:opacity-30 disabled:cursor-not-allowed">
              Commit Layer
            </button>
          </div>
        </div>
      </StepContent>
    </StepLayout>
  );
};
