import { useState } from 'react';
import type { SportSetup } from '@/types/twin-matrix';

const FREQ_OPTIONS = ['每週 1-2 次', '每週 3-4 次', '每週 5+ 次', '偶爾'];
const DURATION_OPTIONS = ['30 分鐘內', '30-60 分鐘', '60-90 分鐘', '90 分鐘以上'];

const CATEGORIES = [
  { icon: '🏃', label: '運動', active: true },
  { icon: '🎵', label: '音樂', active: false },
  { icon: '🎨', label: '藝術', active: false },
  { icon: '📚', label: '閱讀', active: false },
  { icon: '🍳', label: '料理', active: false },
  { icon: '✈️', label: '旅行', active: false },
];

interface Props {
  data: SportSetup;
  onUpdate: (d: SportSetup) => void;
  onNext: () => void;
}

export const CategoryStep = ({ data, onUpdate, onNext }: Props) => {
  const [setup, setSetup] = useState(data);
  const update = (key: keyof SportSetup, val: string) => {
    const next = { ...setup, [key]: val };
    setSetup(next);
    onUpdate(next);
  };

  const isValid = setup.frequency && setup.duration;

  return (
    <div className="animate-fade-in space-y-6 max-w-lg mx-auto">
      <div>
        <h2 className="text-2xl font-bold mb-1">📱 選擇生活面向</h2>
        <p className="text-muted-foreground text-sm">選擇你的興趣面向（Demo: 運動）</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(c => (
          <div
            key={c.label}
            className={`chip text-sm ${c.active ? '!bg-foreground/15 !border-foreground/30 !text-foreground' : 'opacity-40 cursor-not-allowed'}`}
          >
            {c.icon} {c.label}
            {!c.active && <span className="text-[10px] ml-1">soon</span>}
          </div>
        ))}
      </div>

      <div className="glass-card space-y-5">
        <h3 className="font-semibold text-base">🎯 運動設定</h3>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">運動頻率</label>
          <div className="flex flex-wrap gap-2">
            {FREQ_OPTIONS.map(o => (
              <button key={o} onClick={() => update('frequency', o)}
                className={`chip text-sm ${setup.frequency === o ? '!bg-foreground/15 !border-foreground/30 !text-foreground' : ''}`}>
                {o}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">運動時間</label>
          <div className="flex flex-wrap gap-2">
            {DURATION_OPTIONS.map(o => (
              <button key={o} onClick={() => update('duration', o)}
                className={`chip text-sm ${setup.duration === o ? '!bg-foreground/15 !border-foreground/30 !text-foreground' : ''}`}>
                {o}
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
