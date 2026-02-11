import { useState } from 'react';
import type { SportTwin } from '@/types/twin-matrix';

const SPORTS = ['🏃 跑步', '🏋️ 重訓', '🧘 瑜伽', '🚴 騎車', '🏊 游泳', '⚽ 球類'];
const OUTFIT_STYLES = ['極簡機能', '街頭運動', '專業競技', '休閒舒適'];
const BRANDS = ['Nike', 'Adidas', 'Under Armour', 'lululemon', 'New Balance', 'ASICS', 'Puma', 'Reebok'];

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
      : [...twin.sportRanking, s];
    const next = { ...twin, sportRanking: list };
    setTwin(next);
    onUpdate(next);
  };

  const toggleBrand = (b: string) => {
    const list = twin.brands.includes(b)
      ? twin.brands.filter(x => x !== b)
      : twin.brands.length < 3 ? [...twin.brands, b] : twin.brands;
    const next = { ...twin, brands: list };
    setTwin(next);
    onUpdate(next);
  };

  const setStyle = (s: string) => {
    const next = { ...twin, outfitStyle: s };
    setTwin(next);
    onUpdate(next);
  };

  const isValid = twin.sportRanking.length > 0 && twin.outfitStyle && twin.brands.length > 0;

  return (
    <div className="animate-fade-in space-y-6 max-w-lg mx-auto">
      <div>
        <h2 className="text-2xl font-bold mb-1">🏃 建立運動分身</h2>
        <p className="text-muted-foreground text-sm">選擇你的運動偏好，建立專屬分身</p>
      </div>

      <div className="glass-card space-y-5">
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">排序運動類型（點選加入）</label>
          <div className="flex flex-wrap gap-2">
            {SPORTS.map(s => (
              <button key={s} onClick={() => toggleSport(s)}
                className={`chip text-sm ${twin.sportRanking.includes(s) ? '!bg-foreground/15 !border-foreground/30 !text-foreground' : ''}`}>
                {s}
                {twin.sportRanking.includes(s) && (
                  <span className="ml-1 text-xs opacity-60">#{twin.sportRanking.indexOf(s) + 1}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">穿搭風格</label>
          <div className="flex flex-wrap gap-2">
            {OUTFIT_STYLES.map(s => (
              <button key={s} onClick={() => setStyle(s)}
                className={`chip text-sm ${twin.outfitStyle === s ? '!bg-foreground/15 !border-foreground/30 !text-foreground' : ''}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">選擇品牌（最多 3 個）</label>
          <div className="flex flex-wrap gap-2">
            {BRANDS.map(b => (
              <button key={b} onClick={() => toggleBrand(b)}
                className={`chip text-sm ${twin.brands.includes(b) ? '!bg-foreground/15 !border-foreground/30 !text-foreground' : ''}`}>
                {b}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button onClick={onNext} disabled={!isValid} className="btn-twin btn-twin-primary w-full py-3 disabled:opacity-30 disabled:cursor-not-allowed">
        下一步
      </button>
    </div>
  );
};
