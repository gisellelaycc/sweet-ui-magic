import { useState, useRef, useEffect } from 'react';
import logo from '@/assets/twin3-logo.svg';
import { useI18n } from '@/lib/i18n';
import { useTheme, type ColorMode } from '@/contexts/ThemeContext';

type NavPage = 'identity' | 'agents' | 'account' | null;

interface Props {
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
  hasIdentity: boolean;
  isWalletConnected: boolean;
  walletAddress?: string;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
}

const NAV_ITEMS: { id: NavPage; label: string }[] = [
  { id: 'identity', label: 'Identity' },
  { id: 'agents', label: 'For Agents' },
  { id: 'account', label: 'Account' },
];

export const TopNav = ({
  activePage,
  onNavigate,
  hasIdentity,
  isWalletConnected,
  walletAddress,
  onConnectWallet,
  onDisconnectWallet,
}: Props) => {
  const { t } = useI18n();
  const { colorMode, setColorMode } = useTheme();
  const [themeOpen, setThemeOpen] = useState(false);
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);
  const walletRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!walletMenuOpen && !themeOpen) return;
    const handler = (e: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) setThemeOpen(false);
      if (walletRef.current && !walletRef.current.contains(e.target as Node)) setWalletMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [walletMenuOpen, themeOpen]);

  const themeLabels: Record<ColorMode, string> = { cream: 'Cream', dark: 'Dark' };
  const themeIcons: Record<ColorMode, string> = { cream: '◐', dark: '●' };

  return (
    <header className="sticky top-0 flex items-center justify-between px-8 md:px-12 py-5 z-30" style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
      {/* Logo — icon only, like twin3.ai */}
      <button
        onClick={() => onNavigate(null)}
        className="hover:opacity-80 transition-opacity"
      >
        <img src={logo} alt="Twin Matrix" className="w-8 h-8" />
      </button>

      {/* Right side nav */}
      <div className="flex items-center gap-5 md:gap-7">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`text-sm uppercase tracking-widest font-medium transition-colors ${
              activePage === item.id
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {item.label}
          </button>
        ))}

        {/* Theme Switcher */}
        <div className="relative" ref={themeRef}>
          <button
            onClick={() => setThemeOpen(!themeOpen)}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            title={themeLabels[colorMode]}
          >
            {themeIcons[colorMode]}
          </button>

          {themeOpen && (
            <div
              className="absolute right-0 top-full mt-2 py-1.5 rounded-xl z-50 min-w-[120px] animate-fade-in"
              style={{
                background: 'hsl(var(--popover))',
                backdropFilter: 'blur(20px)',
                border: '1px solid hsl(var(--border))',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              }}
            >
              {(['cream', 'dark'] as ColorMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => { setColorMode(mode); setThemeOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
                    colorMode === mode
                      ? 'text-foreground bg-foreground/5'
                      : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
                  }`}
                >
                  <span>{themeIcons[mode]}</span>
                  {themeLabels[mode]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Wallet — twin3.ai style rounded pill button */}
        {isWalletConnected && walletAddress ? (
          <div className="relative" ref={walletRef}>
            <button
              onClick={() => setWalletMenuOpen((v) => !v)}
              className="px-4 py-1.5 rounded-full text-xs font-medium border border-foreground/20 text-foreground hover:bg-foreground/10 transition-colors"
            >
              {walletAddress}
            </button>

            {walletMenuOpen && (
              <div
                className="absolute right-0 top-full mt-2 py-1.5 rounded-xl z-50 min-w-[160px] animate-fade-in"
                style={{
                  background: 'hsl(var(--popover))',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid hsl(var(--border))',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                }}
              >
                <button
                  onClick={() => {
                    setWalletMenuOpen(false);
                    onDisconnectWallet();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onConnectWallet}
            className="px-6 py-2 rounded-full text-sm font-medium bg-[hsl(210,80%,60%)] text-white hover:bg-[hsl(210,80%,55%)] transition-colors"
          >
            {t('wallet.connect')}
          </button>
        )}
      </div>
    </header>
  );
};
