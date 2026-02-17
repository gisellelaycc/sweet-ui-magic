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
    <header className="flex items-center justify-between px-6 py-3 border-b border-foreground/5 relative z-30">
      <button
        onClick={() => onNavigate(null)}
        className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
      >
        <img src={logo} alt="Twin Matrix" className="w-6 h-6" />
        <span className="font-semibold tracking-tight text-sm">Twin Matrix</span>
      </button>

      <div className="flex items-center gap-6">
        {NAV_KEYS.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`relative text-sm py-2 transition-colors group ${
              activePage === item.id
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t(item.key)}
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

        {/* Language Switcher */}
        <div className="relative" ref={popRef}>
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2 px-1"
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

        {isWalletConnected && walletAddress ? (
          <div className="relative" ref={walletRef}>
            <button
              onClick={() => setWalletMenuOpen((v) => !v)}
              className="px-3 py-1.5 rounded-lg text-xs font-mono text-foreground/90 bg-foreground/5 border border-foreground/8 hover:bg-foreground/10 transition-colors flex items-center gap-1.5"
            >
              <span>{walletAddress}</span>
              <span className="text-[10px] text-muted-foreground">▾</span>
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
            className="btn-twin btn-twin-primary py-2 px-3 text-xs"
          >
            {t('wallet.connect')}
          </button>
        )}
      </div>
    </header>
  );
};
