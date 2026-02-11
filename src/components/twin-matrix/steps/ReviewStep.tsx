interface Props {
  signature: string[];
  username: string;
  tags: string[];
  onNext: () => void;
}

export const ReviewStep = ({ signature, username, tags, onNext }: Props) => {
  const primaryCode = signature.slice(0, 4).join('-');

  return (
    <div className="animate-fade-in space-y-6 max-w-lg mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-1">📊 你的靈魂主軸</h2>
        <p className="text-muted-foreground text-sm">Twin Matrix Signature 已生成</p>
      </div>

      <div className="glass-card text-center space-y-6">
        <div>
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-widest">Primary Code</p>
          <p className="text-3xl font-mono font-bold tracking-wider">{primaryCode}</p>
        </div>

        {/* 4x4 Matrix visualization */}
        <div className="inline-grid grid-cols-4 gap-1.5 mx-auto">
          {signature.map((hex, i) => {
            const val = parseInt(hex, 16);
            const hue = (val * 1.4) % 360;
            const lightness = 30 + (val / 255) * 35;
            return (
              <div
                key={i}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-[10px] font-mono opacity-90"
                style={{ background: `hsl(${hue} 55% ${lightness}%)` }}
              >
                {hex}
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-foreground/10">
          <p className="text-sm text-muted-foreground">@{username}</p>
          <div className="flex justify-center gap-2 mt-2">
            {tags.map(t => (
              <span key={t} className="text-xs px-2 py-1 rounded-full bg-foreground/10 text-foreground/70">
                #{t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-center text-muted-foreground/60">
        此 Signature 代表你在 256 個維度中的獨特座標
      </p>

      <button onClick={onNext} className="btn-twin btn-twin-primary w-full py-3">
        授權並綁定 →
      </button>
    </div>
  );
};
