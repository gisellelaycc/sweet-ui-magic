interface Props {
  username: string;
  scope: string;
  duration: string;
}

export const CompleteStep = ({ username, scope, duration }: Props) => (
  <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-fade-in px-4">
    <div className="text-6xl mb-6">✨</div>
    <h2 className="text-3xl font-bold mb-2">Identity Issued</h2>
    <p className="text-muted-foreground mb-8 max-w-sm">
      Your identity credential has been forged and bound to your wallet address.
    </p>

    <div className="glass-card max-w-xs w-full text-center space-y-4">
      <p className="text-xs text-muted-foreground uppercase tracking-widest">Credential Summary</p>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between px-2">
          <span className="text-muted-foreground">Identity</span>
          <span className="text-foreground font-medium">@{username}</span>
        </div>
        <div className="flex justify-between px-2">
          <span className="text-muted-foreground">Scope</span>
          <span className="text-foreground font-medium">{scope}</span>
        </div>
        <div className="flex justify-between px-2">
          <span className="text-muted-foreground">Duration</span>
          <span className="text-foreground font-medium">{duration}</span>
        </div>
      </div>
      <div className="pt-3 border-t border-foreground/10">
        <p className="text-xs text-green-400">✓ Bound to wallet</p>
      </div>
    </div>

    <button
      onClick={() => window.location.reload()}
      className="btn-twin btn-twin-ghost mt-8 px-8 py-3"
    >
      Start Over
    </button>
  </div>
);
