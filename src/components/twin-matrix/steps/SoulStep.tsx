import { useState } from 'react';
import type { SoulData } from '@/types/twin-matrix';

const SUGGESTED_TAGS = ['自律', '突破', '平衡', '熱血', '療癒', '冒險', '堅持', '自由'];

interface Props {
  data: SoulData;
  onUpdate: (d: SoulData) => void;
  onNext: () => void;
}

export const SoulStep = ({ data, onUpdate, onNext }: Props) => {
  const [soul, setSoul] = useState(data);

  const updateSentence = (s: string) => {
    const next = { ...soul, sentence: s };
    setSoul(next);
    onUpdate(next);
  };

  const toggleTag = (t: string) => {
    const list = soul.tags.includes(t)
      ? soul.tags.filter(x => x !== t)
      : soul.tags.length < 3 ? [...soul.tags, t] : soul.tags;
    const next = { ...soul, tags: list };
    setSoul(next);
    onUpdate(next);
  };

  const isValid = soul.sentence.trim().length > 0 && soul.tags.length > 0;

  return (
    <div className="animate-fade-in space-y-6 max-w-lg mx-auto">
      <div>
        <h2 className="text-2xl font-bold mb-1">✨ 靈魂動機</h2>
        <p className="text-muted-foreground text-sm">用一句話定義你的運動靈魂</p>
      </div>

      <div className="glass-card space-y-5">
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">你為什麼運動？（一句話）</label>
          <textarea
            value={soul.sentence}
            onChange={e => updateSentence(e.target.value)}
            placeholder="例：我跑步是為了追上更好的自己"
            maxLength={100}
            rows={3}
            className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/25 transition-colors resize-none"
          />
          <p className="text-xs text-muted-foreground/50 text-right">{soul.sentence.length}/100</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">選擇標籤（最多 3 個）</label>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_TAGS.map(t => (
              <button key={t} onClick={() => toggleTag(t)}
                className={`chip text-sm ${soul.tags.includes(t) ? '!bg-foreground/15 !border-foreground/30 !text-foreground' : ''}`}>
                #{t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button onClick={onNext} disabled={!isValid} className="btn-twin btn-twin-primary w-full py-3 disabled:opacity-30 disabled:cursor-not-allowed">
        生成我的 Twin Matrix
      </button>
    </div>
  );
};
