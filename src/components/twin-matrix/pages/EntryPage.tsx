import { useState, useEffect } from 'react';
import logo from '@/assets/twin3-logo.svg';
import { useI18n } from '@/lib/i18n';
import xLogo from '@/assets/social/x-logo.svg';
import elementLogo from '@/assets/social/element-logo.svg';
import farcasterLogo from '@/assets/social/farcaster-logo.svg';
import bcscanLogo from '@/assets/social/bcscan-logo.svg';

interface Props {
  onHumanEntry: () => void;
  onAgentEntry: () => void;
  locked?: boolean;
  onRequestConnect?: () => void;
}

const SOCIAL_LINKS = [
  { icon: xLogo, href: 'https://x.com/twin3_ai', alt: 'X (Twitter)' },
  { icon: elementLogo, href: 'https://element.market/collections/twin3-1?search[toggles][0]=ALL', alt: 'Element' },
  { icon: farcasterLogo, href: 'https://warpcast.com/twin3.eth', alt: 'Farcaster' },
  { icon: bcscanLogo, href: 'https://bscscan.com/token/0xe3ec133e29addfbba26a412c38ed5de37195156f', alt: 'BscScan' },
];

export const EntryPage = ({ onHumanEntry, onAgentEntry, locked = false, onRequestConnect }: Props) => {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 400);
    const t2 = setTimeout(() => setCardsVisible(true), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[75vh] px-4">
      {/* Brand + Tagline */}
      <div
        className="flex flex-col items-center text-center mb-12"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 700ms ease-out, transform 700ms ease-out',
        }}
      >
        <img src={logo} alt="Twin3" className="w-12 h-12 mb-6" />
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground font-heading mb-3">
          {t('welcome.pretitle')}
        </p>
        <h1
          className="font-heading font-bold tracking-tight leading-[1.1] relative"
          style={{ fontSize: 'clamp(1.75rem, 4.5vw, 3rem)', maxWidth: '620px' }}
        >
          <span className="scan-text-base">{t('welcome.title')}</span>
          <span className="scan-text-glow" aria-hidden="true">{t('welcome.title')}</span>
        </h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto leading-relaxed mt-4">
          {t('entry.chooseYourPath')}
        </p>
      </div>

      {/* Dual Entry Cards */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl relative"
        style={{
          opacity: cardsVisible ? 1 : 0,
          transform: cardsVisible ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 600ms ease-out, transform 600ms ease-out',
        }}
      >
        {/* Human Entry */}
        <div className="glass-card glass-card-hover flex flex-col items-center text-center group cursor-pointer"
          onClick={() => {
            if (locked && onRequestConnect) {
              onRequestConnect();
            } else {
              onHumanEntry();
            }
          }}
        >
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
            style={{ background: 'rgba(10, 255, 255, 0.08)', border: '1px solid rgba(10, 255, 255, 0.2)' }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(10, 255, 255, 0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h2 className="font-heading font-semibold text-xl tracking-wide text-foreground mb-2">
            {t('entry.human')}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-[260px]">
            {t('entry.humanDesc')}
          </p>
          <button
            className="btn-twin btn-twin-primary btn-glow w-full py-3 text-sm mt-auto"
            onClick={(e) => {
              e.stopPropagation();
              if (locked && onRequestConnect) {
                onRequestConnect();
              } else {
                onHumanEntry();
              }
            }}
          >
            {locked ? t('wallet.connect') : t('entry.humanCta')}
          </button>
        </div>

        {/* Agent Entry */}
        <div className="glass-card glass-card-hover flex flex-col items-center text-center group">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
            style={{ background: 'rgba(242, 68, 85, 0.08)', border: '1px solid rgba(242, 68, 85, 0.2)' }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(242, 68, 85, 0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <circle cx="12" cy="5" r="2" />
              <path d="M12 7v4" />
              <line x1="8" y1="16" x2="8" y2="16" />
              <line x1="16" y1="16" x2="16" y2="16" />
            </svg>
          </div>
          <h2 className="font-heading font-semibold text-xl tracking-wide text-foreground mb-2">
            {t('entry.agent')}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-[260px]">
            {t('entry.agentDesc')}
          </p>
          <button
            className="btn-twin btn-twin-ghost w-full py-3 text-sm mt-auto opacity-60 cursor-not-allowed"
            disabled
          >
            {t('entry.agentCta')}
          </button>
          <p className="text-[11px] text-muted-foreground/60 mt-2 italic">
            {t('entry.agentComingSoon')}
          </p>
        </div>
      </div>

      {/* Social Footer */}
      <div
        className="flex flex-col items-center gap-3 mt-12"
        style={{
          opacity: cardsVisible ? 1 : 0,
          transition: 'opacity 800ms ease-out 300ms',
        }}
      >
        <div className="flex items-center gap-4">
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.alt}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity duration-200"
            >
              <img src={link.icon} alt={link.alt} className="w-5 h-5" />
            </a>
          ))}
        </div>
        <div className="text-center">
          <p className="text-xs font-medium text-foreground/80">{t('welcome.trackUs')}</p>
          <p className="text-[11px] text-muted-foreground">{t('welcome.trackUsDesc')}</p>
        </div>
      </div>
    </div>
  );
};
