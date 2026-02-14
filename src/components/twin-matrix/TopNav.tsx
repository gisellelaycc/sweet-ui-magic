import logo from '@/assets/twin3-logo.svg';

type NavPage = 'identity' | 'update' | 'agent' | 'auth' | 'missions' | 'settings' | null;

interface Props {
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
  hasIdentity: boolean;
  walletAddress?: string;
}

interface NavItem {
  id: NavPage;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'identity', label: 'Identity' },
  { id: 'agent', label: 'Agents' },
  { id: 'auth', label: 'Records' },
];

export const TopNav = ({ activePage, onNavigate, hasIdentity, walletAddress = '0x12…A9' }: Props) => (
  <header className="flex items-center justify-between px-6 py-3 border-b border-foreground/5 relative z-30">
    <button
      onClick={() => onNavigate(null)}
      className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
    >
      <img src={logo} alt="Twin Matrix" className="w-6 h-6" />
      <span className="font-semibold tracking-tight text-sm">Twin Matrix</span>
    </button>

    <div className="flex items-center gap-6">
      {NAV_ITEMS.map(item => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className={`relative text-sm py-2 transition-colors group ${
            activePage === item.id
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {item.label}
          {/* Active underline */}
          <span
            className={`absolute bottom-0 left-0 right-0 h-px transition-opacity ${
              activePage === item.id
                ? 'opacity-100'
                : 'opacity-0 group-hover:opacity-100'
            }`}
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
            }}
          />
        </button>
      ))}
      <div className="ml-2 px-3 py-1.5 rounded-lg text-xs font-mono text-muted-foreground bg-foreground/5 border border-foreground/8">
        {walletAddress}
      </div>
    </div>
  </header>
);
