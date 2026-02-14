import { useState, useEffect } from 'react';
import lobsterIcon from '@/assets/lobster-icon.png';

interface Props {
  agentName: string;
  onDashboard: () => void;
  onCreateAnother: () => void;
}

export const AgentActivatedStep = ({ agentName, onDashboard, onCreateAnother }: Props) => {
  const [showLobster, setShowLobster] = useState(true);
  const [lobsterFaded, setLobsterFaded] = useState(false);

  // Flash the red lobster for 0.6s, then fade to system color
  useEffect(() => {
    const fadeTimer = setTimeout(() => setLobsterFaded(true), 600);
    const hideTimer = setTimeout(() => setShowLobster(false), 1200);
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer); };
  }, []);

  const [telegramConnected, setTelegramConnected] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-fade-in px-4">
      {/* Lobster flash moment */}
      {showLobster && (
        <div
          className="mb-6 transition-all duration-500"
          style={{
            opacity: lobsterFaded ? 0 : 1,
            transform: lobsterFaded ? 'scale(1.2)' : 'scale(1)',
            filter: lobsterFaded ? 'hue-rotate(160deg) brightness(1.5)' : 'none',
          }}
        >
          <img src={lobsterIcon} alt="" className="w-16 h-16" style={{
            filter: !lobsterFaded ? 'drop-shadow(0 0 12px rgba(255, 60, 60, 0.6))' : undefined,
          }} />
        </div>
      )}

      {!showLobster && <div className="text-5xl mb-6">⚡</div>}

      <h2 className="text-3xl font-bold mb-2">Agent Activated</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        Your agent is now operating under your committed identity.
      </p>

      {/* Agent Info Card */}
      <div className="glass-card max-w-sm w-full space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Agent</span>
          <span className="text-sm font-medium text-foreground">{agentName || 'Unnamed Agent'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Status</span>
          <span className="text-xs text-green-400 font-medium">● Active</span>
        </div>

        {/* Telegram connection */}
        <div className="pt-3 border-t border-foreground/10">
          {!telegramConnected ? (
            <button
              onClick={() => setTelegramConnected(true)}
              className="btn-twin btn-twin-ghost w-full py-2 text-xs"
            >
              🔗 Connect Telegram
            </button>
          ) : (
            <p className="text-xs text-green-400 text-center">✓ Telegram Connected</p>
          )}
          <p className="text-[9px] text-muted-foreground/50 mt-1 text-center">Required for agent notifications</p>
        </div>
      </div>

      {/* CTAs */}
      <div className="w-full max-w-sm space-y-3">
        <button onClick={onDashboard} className="btn-twin btn-twin-primary btn-glow w-full py-3">
          Return to Dashboard
        </button>
        <button onClick={onCreateAnother} className="btn-twin btn-twin-ghost w-full py-2.5 text-sm">
          Create Another Agent
        </button>
      </div>
    </div>
  );
};
