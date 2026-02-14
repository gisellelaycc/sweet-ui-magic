import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import logo from '@/assets/twin3-logo.svg';

type NavPage = 'identity' | 'update' | 'agent' | 'auth' | 'missions' | 'settings' | null;

interface Props {
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
  hasIdentity: boolean;
  walletAddress?: string;
}

interface DropdownItem {
  id: NavPage;
  label: string;
  desc?: string;
}

const IDENTITY_ITEMS: DropdownItem[] = [
  { id: 'identity', label: 'Identity State', desc: 'View your sealed identity' },
  { id: 'update', label: 'Refine State', desc: 'Update layers & modules' },
];

const AGENT_ITEMS: DropdownItem[] = [
  { id: 'agent', label: 'Agent Studio', desc: 'Create & manage agents' },
  { id: 'auth', label: 'Authorizations', desc: 'Issued records & certs' },
];

const RECORD_ITEMS: DropdownItem[] = [
  { id: 'missions', label: 'Missions', desc: 'Brand & signal requests' },
  { id: 'settings', label: 'Settings', desc: 'Account & preferences' },
];

const DropdownMenu = ({
  label,
  items,
  activePage,
  onSelect,
}: {
  label: string;
  items: DropdownItem[];
  activePage: NavPage;
  onSelect: (id: NavPage) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = items.some(i => i.id === activePage);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
          isActive
            ? 'text-foreground bg-foreground/5'
            : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
        }`}
      >
        {label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-56 rounded-xl glass border border-foreground/8 shadow-lg z-50 py-1.5 animate-fade-in">
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => { onSelect(item.id); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 transition-colors ${
                activePage === item.id
                  ? 'bg-foreground/8 text-foreground'
                  : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'
              }`}
            >
              <span className="text-sm font-medium block">{item.label}</span>
              {item.desc && <span className="text-[10px] text-muted-foreground/60 block">{item.desc}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const TopNav = ({ activePage, onNavigate, hasIdentity, walletAddress = '0x12…A9' }: Props) => (
  <header className="flex items-center justify-between px-6 py-3 border-b border-foreground/5 relative z-30">
    {/* Left: Logo + Name */}
    <button
      onClick={() => onNavigate(null)}
      className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
    >
      <img src={logo} alt="Twin Matrix" className="w-6 h-6" />
      <span className="font-semibold tracking-tight text-sm">Twin Matrix</span>
    </button>

    {/* Right: Dropdowns + Wallet */}
    <div className="flex items-center gap-1">
      <DropdownMenu label="Identity" items={IDENTITY_ITEMS} activePage={activePage} onSelect={onNavigate} />
      <DropdownMenu label="Agents" items={AGENT_ITEMS} activePage={activePage} onSelect={onNavigate} />
      <DropdownMenu label="Records" items={RECORD_ITEMS} activePage={activePage} onSelect={onNavigate} />
      <div className="ml-3 px-3 py-1.5 rounded-lg text-xs font-mono text-muted-foreground bg-foreground/5 border border-foreground/8">
        {walletAddress}
      </div>
    </div>
  </header>
);
