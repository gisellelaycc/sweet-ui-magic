import { useState } from 'react';
import type { AuthSetup } from '@/types/twin-matrix';

interface Props {
  data: AuthSetup;
  onUpdate: (d: AuthSetup) => void;
  onNext: () => void;
}

export const AuthStep = ({ data, onUpdate, onNext }: Props) => {
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    const setup: AuthSetup = {
      scope: 'Full Identity',
      duration: '30 Days',
      usageLimit: 'Non-resettable',
    };
    onUpdate(setup);
    setConfirmed(true);
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-lg mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-1">Issue Authorization</h2>
        <p className="text-muted-foreground text-sm">
          Authorize your twin identity with a single tap.<br />
          You can manage or revoke this anytime from the menu.
        </p>
      </div>

      <div className="glass-card space-y-4 text-center">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between px-2">
            <span className="text-muted-foreground">Scope</span>
            <span className="text-foreground font-medium">Full Identity</span>
          </div>
          <div className="flex justify-between px-2">
            <span className="text-muted-foreground">Duration</span>
            <span className="text-foreground font-medium">30 Days</span>
          </div>
          <div className="flex justify-between px-2">
            <span className="text-muted-foreground">Usage</span>
            <span className="text-foreground font-medium">Non-resettable</span>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground/50 pt-2 border-t border-foreground/5">
          Go to <strong>Active Authorizations</strong> in the menu to revoke or adjust later.
        </p>
      </div>

      {!confirmed ? (
        <button onClick={handleConfirm} className="btn-twin btn-twin-primary w-full py-3 btn-glow">
          Authorize & Issue ✓
        </button>
      ) : (
        <button onClick={onNext} className="btn-twin btn-twin-primary w-full py-3 btn-glow animate-fade-in">
          Continue →
        </button>
      )}
    </div>
  );
};
