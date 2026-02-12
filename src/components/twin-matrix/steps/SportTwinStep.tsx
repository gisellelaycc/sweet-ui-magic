import { useState } from 'react';
import type { SportTwin } from '@/types/twin-matrix';

const SPORTS = [
  '🏃 Running', '🏋️ Weight Training', '🧘 Yoga', '🚴 Cycling',
  '🏊 Swimming', '⚽ Team Sports', '🥊 Combat Sports', '🎾 Racquet Sports',
  '🧗 Climbing', '🏌️ Golf',
];
const OUTFIT_STYLES = ['Minimal Functional', 'Streetwear Athletic', 'Pro Competition', 'Casual Comfort'];
const BRANDS = ['Nike', 'Adidas', 'Under Armour', 'lululemon', 'New Balance', 'ASICS', 'Puma', 'Reebok', 'On', 'Hoka'];

interface Props {
  data: SportTwin;
  onUpdate: (d: SportTwin) => void;
  onNext: () => void;
}

export const SportTwinStep = ({ data, onUpdate, onNext }: Props) => {
  const [twin, setTwin] = useState(data);

  const toggleSport = (s: string) => {
    let list: string[];
    if (twin.sportRanking.includes(s)) {
      // Remove and re-rank
      list = twin.sportRanking.filter(x => x !== s);
    } else {
      list = [...twin.sportRanking, s];
    }
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
    <div className="animate-fade-in space-y-6 max-w-lg mx-auto">
      <div>
        <h2 className="text-2xl font-bold mb-1">Skill & Style</h2>
        <p className="text-muted-foreground text-sm">Shape your athletic identity through preference and ranking.</p>
      </div>

      {/* Sport Ranking */}
      <div className="glass-card space-y-3">
        <div>
          <label className="text-sm font-medium text-foreground">Select your most frequent activities</label>
          <p className="text-xs text-muted-foreground mt-0.5">Click order = ranking. First click = primary.</p>
        </div>
        {twin.sportRanking.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Selected {twin.sportRanking.length} / {SPORTS.length}
            {twin.sportRanking.length < 3 && ` — pick ${3 - twin.sportRanking.length} more to continue`}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {SPORTS.map(s => {
            const rank = twin.sportRanking.indexOf(s);
            const isSelected = rank >= 0;
            return (
              <button
                key={s}
                onClick={() => toggleSport(s)}
                className={`chip text-sm relative ${isSelected ? '!bg-foreground/15 !border-foreground/30 !text-foreground' : ''}`}
              >
                {s}
                {isSelected && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-foreground text-background text-[10px] flex items-center justify-center font-bold">
                    {rank + 1}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Outfit Style */}
      <div className="glass-card space-y-3">
        <label className="text-sm font-medium text-foreground">Outfit Style (multi-select)</label>
        <div className="flex flex-wrap gap-2">
          {OUTFIT_STYLES.map(s => (
            <button
              key={s}
              onClick={() => toggleStyle(s)}
              className={`chip text-sm ${twin.outfitStyle.includes(s) ? '!bg-foreground/15 !border-foreground/30 !text-foreground' : ''}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Brand Preferences */}
      <div className="glass-card space-y-3">
        <div>
          <label className="text-sm font-medium text-foreground">Brand Preferences</label>
          <p className="text-xs text-muted-foreground mt-0.5">Brands you've worn most in the past year</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {BRANDS.map(b => (
            <button
              key={b}
              onClick={() => toggleBrand(b)}
              className={`chip text-sm ${twin.brands.includes(b) ? '!bg-foreground/15 !border-foreground/30 !text-foreground' : ''}`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      <button onClick={onNext} disabled={!isValid} className="btn-twin btn-twin-primary w-full py-3 disabled:opacity-30 disabled:cursor-not-allowed">
        Continue
      </button>
    </div>
  );
};
