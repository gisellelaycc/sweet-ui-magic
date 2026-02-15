import { useState } from 'react';
import type { SportTwin } from '@/types/twin-matrix';
import { StepLayout, StepContent } from '../StepLayout';
import { useI18n } from '@/lib/i18n';

// Internal IDs stay English — used for backend storage
const SPORTS = [
  { id: 'Running', key: 'sport.running' },
  { id: 'Cycling', key: 'sport.cycling' },
  { id: 'Long-distance Swimming', key: 'sport.swimming' },
  { id: 'Trail / Off-road Running', key: 'sport.trail' },
  { id: 'Strength Training', key: 'sport.strength' },
  { id: 'Yoga & Pilates', key: 'sport.yoga' },
  { id: 'Team Sports', key: 'sport.team' },
  { id: 'Combat Sports', key: 'sport.combat' },
  { id: 'Racquet Sports', key: 'sport.racquet' },
  { id: 'Climbing', key: 'sport.climbing' },
  { id: 'Golf', key: 'sport.golf' },
];
const OUTFIT_STYLES = [
  { id: 'Minimal Functional', key: 'outfit.minimalFunctional' },
  { id: 'Streetwear Athletic', key: 'outfit.streetwear' },
  { id: 'Pro Competition', key: 'outfit.proCompetition' },
  { id: 'Casual Comfort', key: 'outfit.casualComfort' },
  { id: 'Premium Athletic', key: 'outfit.premiumAthletic' },
  { id: 'Retro Sports', key: 'outfit.retroSports' },
  { id: 'Outdoor Technical', key: 'outfit.outdoorTechnical' },
  { id: 'Tight Performance', key: 'outfit.tightPerformance' },
  { id: 'Vivid & Energetic', key: 'outfit.vividEnergetic' },
  { id: 'Brand Centric', key: 'outfit.brandCentric' },
];
// Brands stay in English (brand names)
const BRANDS = ['Nike', 'Adidas', 'Under Armour', 'Lululemon', 'New Balance', 'ASICS', 'Puma', 'Reebok', 'On', 'Hoka'];

interface Props {
  data: SportTwin;
  onUpdate: (d: SportTwin) => void;
  onNext: () => void;
}

export const SportTwinStep = ({ data, onUpdate, onNext }: Props) => {
  const { t } = useI18n();
  const [twin, setTwin] = useState(data);

  const toggleSport = (id: string) => {
    const list = twin.sportRanking.includes(id)
      ? twin.sportRanking.filter(x => x !== id)
      : twin.sportRanking.length < 10 ? [...twin.sportRanking, id] : twin.sportRanking;
    const next = { ...twin, sportRanking: list };
    setTwin(next);
    onUpdate(next);
  };

  const toggleStyle = (id: string) => {
    const list = twin.outfitStyle.includes(id)
      ? twin.outfitStyle.filter(x => x !== id)
      : [...twin.outfitStyle, id];
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
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] tracking-tight mb-2">
              {t('sportTwin.title')}
            </h2>
            <p className="text-muted-foreground text-base md:text-lg">
              {t('sportTwin.subtitle')}
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="glass-card !p-4 space-y-2 flex-1 min-w-0">
              <div>
                <label className="text-sm font-medium text-foreground">{t('sportTwin.activities')}</label>
                <p className="text-xs text-muted-foreground mt-0.5">{t('sportTwin.activitiesHint')}</p>
              </div>
              {twin.sportRanking.length > 0 && (
                <p className="text-xs text-muted-foreground">{t('sportTwin.selected')} {twin.sportRanking.length} / 10</p>
              )}
              <div className="flex flex-wrap gap-1.5">
                {SPORTS.map(s => {
                  const rank = twin.sportRanking.indexOf(s.id);
                  const isSelected = rank >= 0;
                  return (
                    <button key={s.id} onClick={() => toggleSport(s.id)}
                      className={`chip !text-xs !py-1.5 !px-3 relative ${isSelected ? '!bg-foreground/15 !border-foreground/30 !text-foreground' : ''}`}>
                      {t(s.key)}
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
                <label className="text-sm font-medium text-foreground">{t('sportTwin.outfitStyle')}</label>
                <p className="text-xs text-muted-foreground mt-0.5">{t('sportTwin.outfitHint')}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {OUTFIT_STYLES.map(s => (
                  <button key={s.id} onClick={() => toggleStyle(s.id)}
                    className={`chip !text-xs !py-1.5 !px-3 ${twin.outfitStyle.includes(s.id) ? '!bg-foreground/15 !border-foreground/30 !text-foreground' : ''}`}>
                    {t(s.key)}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card !p-4 space-y-2 flex-1 min-w-0">
              <div>
                <label className="text-sm font-medium text-foreground">{t('sportTwin.brands')}</label>
                <p className="text-xs text-muted-foreground mt-0.5">{t('sportTwin.brandsHint')}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {BRANDS.map(b => (
                  <button key={b} onClick={() => toggleBrand(b)}
                    className={`chip !text-xs !py-1.5 !px-3 ${twin.brands.includes(b) ? '!bg-foreground/15 !border-foreground/30 !text-foreground' : ''}`}>
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full max-w-md mx-auto mt-6">
            <button onClick={onNext} disabled={!isValid} className="btn-twin btn-twin-primary w-full py-2.5 text-sm disabled:opacity-30 disabled:cursor-not-allowed">
              {t('sportTwin.commit')}
            </button>
          </div>
        </div>
      </StepContent>
    </StepLayout>
  );
};
