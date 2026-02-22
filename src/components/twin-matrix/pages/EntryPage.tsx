import { useState, useEffect } from 'react';
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
  { icon: xLogo, href: 'https://x.com/twin3_ai', alt: 'X' },
  { icon: elementLogo, href: 'https://element.market/collections/twin3-1?search[toggles][0]=ALL', alt: 'Element' },
  { icon: farcasterLogo, href: 'https://warpcast.com/twin3.eth', alt: 'Farcaster' },
  { icon: bcscanLogo, href: 'https://bscscan.com/token/0xe3ec133e29addfbba26a412c38ed5de37195156f', alt: 'BscScan' },
];

export const EntryPage = ({ onHumanEntry, onAgentEntry, locked = false, onRequestConnect }: Props) => {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 200);
    const t2 = setTimeout(() => setCardsVisible(true), 500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleHumanClick = () => {
    if (locked && onRequestConnect) onRequestConnect();
    else onHumanEntry();
  };

  return (
    <div className="relative flex flex-col justify-center min-h-[85vh] px-6 md:px-12 lg:px-16">
      <div className="flex flex-col lg:flex-row items-start lg:items-stretch gap-8 lg:gap-10 w-full max-w-[1400px] mx-auto">

        {/* ── Left: Brand Typography ── */}
        <div
          className="flex-1 flex flex-col justify-center min-w-0"
          style={{
            opacity: visible ? 1 : 0,
            transition: 'opacity 600ms ease-out',
          }}
        >
          <p className="text-base md:text-lg uppercase tracking-[0.25em] text-muted-foreground font-heading mb-4 md:mb-6">
            {t('welcome.pretitle')}
          </p>

          {/* Massive headline with scan-glow */}
          <h1 className="font-heading font-extrabold uppercase leading-[0.95] tracking-tight relative">
            <span className="block text-muted-foreground/30" style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)' }}>
              <span className="scan-text-base">Empowering</span>
              <span className="scan-text-glow" aria-hidden="true">Empowering</span>
            </span>
            <span className="block text-foreground relative" style={{ fontSize: 'clamp(3rem, 8.5vw, 7.5rem)' }}>
              <span className="scan-text-base">Human</span>
              <span className="scan-text-glow" aria-hidden="true">Human</span>
            </span>
            <span className="block text-foreground relative" style={{ fontSize: 'clamp(3rem, 8.5vw, 7.5rem)' }}>
              <span className="scan-text-base">Experience</span>
              <span className="scan-text-glow" aria-hidden="true">Experience</span>
            </span>
            <span className="block text-muted-foreground/30" style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)' }}>
              <span className="scan-text-base">In the AI Age</span>
              <span className="scan-text-glow" aria-hidden="true">In the AI Age</span>
            </span>
          </h1>

          <p className="text-muted-foreground text-base md:text-lg max-w-lg leading-relaxed mt-6 md:mt-8">
            {t('welcome.subtitle')}
          </p>
        </div>

        {/* ── Right: Cards + Social ── */}
        <div
          className="w-full lg:w-[520px] xl:w-[560px] shrink-0 flex flex-row gap-4"
          style={{
            opacity: cardsVisible ? 1 : 0,
            transform: cardsVisible ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 500ms ease-out, transform 500ms ease-out',
          }}
        >
          {/* Human Entry Card — thin border, very transparent like twin3.ai */}
          <div
            className="flex-[1.2] flex flex-col cursor-pointer group transition-all duration-300"
            onClick={handleHumanClick}
            style={{
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '16px',
              padding: '1.75rem 1.75rem',
              background: 'rgba(255, 255, 255, 0.02)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
            }}
          >
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6">
              {t('entry.humanDesc')}
            </p>

            <div className="flex-1" />

            {/* White CTA button like twin3.ai "Free Mint" */}
            <button
              className="w-full py-4 rounded-xl text-base font-semibold transition-colors bg-foreground text-background hover:bg-foreground/90"
              onClick={(e) => { e.stopPropagation(); handleHumanClick(); }}
            >
              {locked ? t('wallet.connect') : t('entry.humanCta')}
            </button>
          </div>

          {/* Right column: Social + Agent */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Social block — no card border, just content like twin3.ai */}
            <div className="flex flex-col px-2 py-4">
              <div className="flex items-center gap-5 mb-4">
                {SOCIAL_LINKS.map((link) => (
                  <a
                    key={link.alt}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
                  >
                    <img src={link.icon} alt={link.alt} className="w-7 h-7" />
                  </a>
                ))}
              </div>
              <p className="text-base md:text-lg font-medium text-foreground/80 mb-1">
                {t('welcome.trackUs')}
              </p>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                {t('welcome.trackUsDesc')}
              </p>
            </div>

            {/* Agent Entry Card — thin border, same style */}
            <div
              className="flex flex-col transition-all duration-300"
              style={{
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '1.5rem 1.5rem',
                background: 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-4">
                {t('entry.agentDesc')}
              </p>
              <button
                className="w-full py-3 rounded-xl text-base font-semibold border border-foreground/15 text-muted-foreground/50 cursor-not-allowed"
                disabled
              >
                {t('entry.agentCta')}
              </button>
              <p className="text-xs text-muted-foreground/40 text-center mt-2 italic">
                {t('entry.agentComingSoon')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div
        className="absolute bottom-6 right-6 text-sm text-muted-foreground/40"
        style={{ opacity: cardsVisible ? 1 : 0, transition: 'opacity 1s ease-out 400ms' }}
      >
        Scroll to explore ↓
      </div>
    </div>
  );
};
