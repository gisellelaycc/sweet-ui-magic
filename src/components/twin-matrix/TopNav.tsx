import { useState, useRef, useEffect } from 'react';
import logo from '@/assets/twin3-logo.svg';
import { useI18n, type Lang } from '@/lib/i18n';

type NavPage = 'identity' | 'update' | 'agent' | 'auth' | 'missions' | 'settings' | null;

interface Props {
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
  hasIdentity: boolean;
  isWalletConnected: boolean;
  walletAddress?: string;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
}

const NAV_KEYS: { id: NavPage; key: string }[] = [
  { id: 'identity', key: 'nav.identity' },
  { id: 'agent', key: 'nav.agents' },
  { id: 'missions', key: 'nav.signalRecords' },
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
  const { lang, setLang, t, langLabels } = useI18n();
  const [langOpen, setLangOpen] = useState(false);
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const popRef = useRef<HTMLDivElement>(null);
  const walletRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!langOpen && !walletMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setLangOpen(false);
      if (walletRef.current && !walletRef.current.contains(e.target as Node)) setWalletMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [langOpen, walletMenuOpen]);

  const langs: Lang[] = ['en', 'zh', 'zhCN', 'ja', 'ko'];

  return (
    <header className="sticky top-0 flex items-center justify-between px-8 md:px-12 py-5 z-30" style={{ background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
      {/* Logo — icon only, like twin3.ai */}
      <button
        onClick={() => onNavigate(null)}
        className="hover:opacity-80 transition-opacity"
      >
        <img src={logo} alt="Twin Matrix" className="w-8 h-8" />
      </button>

      {/* Right side nav */}
      <div className="flex items-center gap-5 md:gap-7">
        {NAV_KEYS.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`text-sm uppercase tracking-widest font-medium transition-colors ${
              activePage === item.id
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t(item.key)}
          </button>
        ))}

        {/* Language Switcher */}
        <div className="relative" ref={popRef}>
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="text-sm uppercase tracking-widest font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {lang === 'zhCN' ? '简体' : lang.toUpperCase()}
          </button>

          {langOpen && (
            <div
              className="absolute right-0 top-full mt-2 py-1.5 rounded-xl z-50 min-w-[140px] animate-fade-in"
              style={{
                background: 'rgba(20, 22, 26, 0.92)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              }}
            >
              {langs.map(l => (
                <button
                  key={l}
                  onClick={() => { setLang(l); setLangOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    lang === l
                      ? 'text-foreground bg-foreground/5'
                      : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
                  }`}
                >
                  {langLabels[l]}
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
                  background: 'rgba(20, 22, 26, 0.92)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
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
