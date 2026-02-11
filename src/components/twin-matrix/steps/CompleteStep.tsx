interface Props {
  signature: string[];
  username: string;
}

export const CompleteStep = ({ signature, username }: Props) => {
  const primaryCode = signature.slice(0, 4).join('-');

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-fade-in px-4">
      <div className="text-6xl mb-6">✨</div>
      <h2 className="text-3xl font-bold mb-2">完成！</h2>
      <p className="text-muted-foreground mb-8 max-w-sm">
        你的 Twin Matrix 身份已成功建立並綁定
      </p>

      <div className="glass-card max-w-xs w-full text-center space-y-4">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">Your Twin Matrix ID</p>
        <p className="text-2xl font-mono font-bold tracking-wider">{primaryCode}</p>
        <div className="inline-grid grid-cols-4 gap-1 mx-auto">
          {signature.map((hex, i) => {
            const val = parseInt(hex, 16);
            const hue = (val * 1.4) % 360;
            const lightness = 30 + (val / 255) * 35;
            return (
              <div
                key={i}
                className="w-6 h-6 rounded"
                style={{ background: `hsl(${hue} 55% ${lightness}%)` }}
              />
            );
          })}
        </div>
        <p className="text-sm text-muted-foreground">@{username}</p>
      </div>

      <button
        onClick={() => window.location.reload()}
        className="btn-twin btn-twin-ghost mt-8 px-8 py-3"
      >
        重新開始
      </button>
    </div>
  );
};
