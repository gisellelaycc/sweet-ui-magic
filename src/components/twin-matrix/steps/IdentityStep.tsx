import { useState } from 'react';
import type { UserProfile } from '@/types/twin-matrix';

const HEIGHT_OPTIONS = ['< 160 cm', '160–170 cm', '170–180 cm', '> 180 cm'];
const WEIGHT_OPTIONS = ['< 50 kg', '50–65 kg', '65–80 kg', '> 80 kg'];
const AGE_OPTIONS = ['18–24', '25–34', '35–44', '45+'];

interface Props {
  data: UserProfile;
  onUpdate: (d: UserProfile) => void;
  onNext: () => void;
}

const BinSelector = ({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) => (
  <div className="space-y-2">
    <label className="text-sm text-muted-foreground">{label}</label>
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`chip text-sm ${value === o ? '!bg-foreground/15 !border-foreground/30 !text-foreground' : ''}`}
        >
          {o}
        </button>
      ))}
    </div>
  </div>
);

export const IdentityStep = ({ data, onUpdate, onNext }: Props) => {
  const [profile, setProfile] = useState(data);
  const update = (key: keyof UserProfile, val: string) => {
    const next = { ...profile, [key]: val };
    setProfile(next);
    onUpdate(next);
  };

  const isValid = profile.username.trim() && profile.heightBin && profile.weightBin && profile.ageBin;

  return (
    <div className="animate-fade-in space-y-6 max-w-lg mx-auto">
      <div>
        <h2 className="text-2xl font-bold mb-1">📱 建立身份</h2>
        <p className="text-muted-foreground text-sm">填寫基本資料，開始你的數位分身旅程</p>
      </div>

      <div className="glass-card space-y-5">
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Username</label>
          <input
            value={profile.username}
            onChange={e => update('username', e.target.value)}
            placeholder="輸入你的名稱"
            className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/25 transition-colors"
          />
        </div>

        <BinSelector label="Height" options={HEIGHT_OPTIONS} value={profile.heightBin} onChange={v => update('heightBin', v)} />
        <BinSelector label="Weight" options={WEIGHT_OPTIONS} value={profile.weightBin} onChange={v => update('weightBin', v)} />
        <BinSelector label="Age" options={AGE_OPTIONS} value={profile.ageBin} onChange={v => update('ageBin', v)} />
      </div>

      <button onClick={onNext} disabled={!isValid} className="btn-twin btn-twin-primary w-full py-3 disabled:opacity-30 disabled:cursor-not-allowed">
        下一步
      </button>
    </div>
  );
};
