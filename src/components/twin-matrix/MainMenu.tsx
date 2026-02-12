import { useState } from 'react';

const MENU_ITEMS = [
  { id: 'identity', icon: '◈', label: 'My Identity' },
  { id: 'update', icon: '✏️', label: 'Update Identity' },
  { id: 'auth', icon: '🔐', label: 'Active Authorizations' },
  { id: 'missions', icon: '🎯', label: 'Missions' },
  { id: 'settings', icon: '⚙️', label: 'Settings' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export const MainMenu = ({ open, onClose }: Props) => {
  const [active, setActive] = useState('identity');

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed left-0 top-0 bottom-0 w-72 z-50 glass animate-fade-in flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-foreground/5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-foreground/10 flex items-center justify-center text-sm">◈</div>
            <span className="font-semibold tracking-tight text-sm">Twin Matrix</span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg">×</button>
        </div>

        <nav className="flex-1 py-3 px-3 space-y-1">
          {MENU_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                active === item.id
                  ? 'bg-foreground/10 text-foreground font-medium'
                  : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-foreground/5">
          <p className="text-[10px] text-muted-foreground/50">Twin Matrix v0.1 — Demo</p>
        </div>
      </div>
    </>
  );
};
