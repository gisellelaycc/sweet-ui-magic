import { useState } from 'react';

interface Props {
  onNext: () => void;
}

export const AuthStep = ({ onNext }: Props) => {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="animate-fade-in space-y-6 max-w-lg mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-1">🔐 授權並綁定</h2>
        <p className="text-muted-foreground text-sm">確認並完成你的 Twin Matrix 身份綁定</p>
      </div>

      <div className="glass-card space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-foreground/5">
          <span className="text-lg mt-0.5">✅</span>
          <div>
            <p className="text-sm font-medium">身份資料加密儲存</p>
            <p className="text-xs text-muted-foreground">所有資料以端到端加密保護</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-xl bg-foreground/5">
          <span className="text-lg mt-0.5">✅</span>
          <div>
            <p className="text-sm font-medium">Soulbound Token 鑄造</p>
            <p className="text-xs text-muted-foreground">不可轉讓的身份證明，永久綁定</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-xl bg-foreground/5">
          <span className="text-lg mt-0.5">✅</span>
          <div>
            <p className="text-sm font-medium">Twin Matrix 上鏈</p>
            <p className="text-xs text-muted-foreground">你的 256D 簽章將寫入區塊鏈</p>
          </div>
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer px-1">
        <div
          onClick={() => setAgreed(!agreed)}
          className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
            agreed ? 'bg-foreground border-foreground' : 'border-foreground/30'
          }`}
        >
          {agreed && <span className="text-background text-xs">✓</span>}
        </div>
        <span className="text-sm text-muted-foreground">我同意 Twin Matrix 使用條款與隱私政策</span>
      </label>

      <button onClick={onNext} disabled={!agreed} className="btn-twin btn-twin-primary w-full py-3 disabled:opacity-30 disabled:cursor-not-allowed">
        確認授權
      </button>
    </div>
  );
};
