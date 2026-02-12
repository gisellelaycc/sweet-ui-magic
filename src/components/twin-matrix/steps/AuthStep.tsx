import { useState } from 'react';
import type { AuthSetup } from '@/types/twin-matrix';

const SCOPE_OPTIONS = ['Full Identity', 'Sport Only', 'Core + Soul', 'Signal Modules'];
const DURATION_OPTIONS = ['24 Hours', '7 Days', '30 Days', '90 Days'];
const USAGE_OPTIONS = ['Non-resettable', 'Resettable', 'Single-use'];

interface Props {
  data: AuthSetup;
  onUpdate: (d: AuthSetup) => void;
  onNext: () => void;
}

export const AuthStep = ({ data, onUpdate, onNext }: Props) => {
  const [confirmed, setConfirmed] = useState(false);
  const [setup, setSetup] = useState<AuthSetup>({
    scope: data.scope || 'Full Identity',
    duration: data.duration || '30 Days',
    usageLimit: data.usageLimit || 'Non-resettable',
  });
  const [editing, setEditing] = useState<string | null>(null);

  const updateField = (field: keyof AuthSetup, value: string) => {
    const next = { ...setup, [field]: value };
    setSetup(next);
    onUpdate(next);
    setEditing(null);
    setConfirmed(false);
  };

  const handleConfirm = () => {
    onUpdate(setup);
    setConfirmed(true);
  };

  const renderField = (label: string, field: keyof AuthSetup, options: string[]) => {
    const isEditing = editing === field;
    return (
      <div className="space-y-1.5">
        <div className="flex justify-between items-center px-2">
          <span className="text-muted-foreground">{label}</span>
          <div className="flex items-center gap-2">
            <span className="text-foreground font-medium">{setup[field]}</span>
            <button
              onClick={() => setEditing(isEditing ? null : field)}
              className="text-muted-foreground/50 hover:text-foreground transition-colors text-xs"
            >
              ✏️
            </button>
          </div>
        </div>
        {isEditing && (
          <div className="flex flex-wrap gap-1.5 px-2 animate-fade-in">
            {options.map(opt => (
              <button
                key={opt}
                onClick={() => updateField(field, opt)}
                className={`text-[11px] px-3 py-1.5 rounded-lg transition-all ${
                  setup[field] === opt
                    ? 'bg-foreground/20 text-foreground border border-foreground/20'
                    : 'bg-foreground/5 text-muted-foreground border border-foreground/5 hover:border-foreground/15'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-lg mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-1">Mint Access Token</h2>
        <p className="text-muted-foreground text-sm">
          Grant scoped access to your identity state.<br />
          Revoke or adjust anytime from the menu.
        </p>
      </div>

      <div className="glass-card space-y-4 text-center">
        <div className="space-y-3 text-sm">
          {renderField('Access Scope', 'scope', SCOPE_OPTIONS)}
          {renderField('Validity Period', 'duration', DURATION_OPTIONS)}
          {renderField('Usage Quota', 'usageLimit', USAGE_OPTIONS)}
        </div>

        <p className="text-[10px] text-muted-foreground/50 pt-2 border-t border-foreground/5">
          Manage active tokens via <strong>Issued Tokens</strong> in the menu.
        </p>
      </div>

      {!confirmed ? (
        <button onClick={handleConfirm} className="btn-twin btn-twin-primary w-full py-3 btn-glow">
          Mint & Issue ✓
        </button>
      ) : (
        <button onClick={onNext} className="btn-twin btn-twin-primary w-full py-3 btn-glow animate-fade-in">
          Continue →
        </button>
      )}
    </div>
  );
};
