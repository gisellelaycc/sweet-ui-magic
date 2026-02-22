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
    const t1 = setTimeout(() => setVisible(true), 300);
    const t2 = setTimeout(() => setCardsVisible(true), 700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleHumanClick = () => {
    if (locked && onRequestConnect) {
      onRequestConnect();
    } else {
      onHumanEntry();
    }
  };

  return (
    <div className="relative flex flex-col justify-center min-h-[85vh] px-6 md:px-12 lg:px-16">
      {/* Main Layout: Left text + Right cards */}
      <div className="flex flex-col lg:flex-row items-start lg:items-stretch gap-8 lg:gap-10 w-full max-w-[1400px] mx-auto">

        {/* ── Left: Brand Typography ── */}
        <div
          className="flex-1 flex flex-col justify-center min-w-0"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 800ms ease-out, transform 800ms ease-out',
          }}
        >
          {/* Pre-title */}
          <p className="text-base md:text-lg uppercase tracking-[0.25em] text-muted-foreground font-heading mb-4 md:mb-6">
            {t('welcome.pretitle')}
          </p>

          {/* Main Headline — massive, left-aligned like twin3.ai */}
          <h1 className="font-heading font-extrabold uppercase leading-[0.95] tracking-tight relative">
            <span
              className="block text-muted-foreground/30"
              style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)' }}
            >
              Empowering
            </span>
            <span
              className="block text-foreground"
              style={{ fontSize: 'clamp(3rem, 8.5vw, 7.5rem)' }}
            >
              Human
            </span>
            <span
              className="block text-foreground"
              style={{ fontSize: 'clamp(3rem, 8.5vw, 7.5rem)' }}
            >
              Experience
            </span>
            <span
              className="block text-muted-foreground/30"
              style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)' }}
            >
              In the AI Age
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-muted-foreground text-base md:text-lg max-w-lg leading-relaxed mt-6 md:mt-8">
            {t('welcome.subtitle')}
          </p>
        </div>

        {/* ── Right: Dual Entry Cards ── */}
        <div
          className="w-full lg:w-[460px] xl:w-[520px] shrink-0 flex flex-col gap-5"
          style={{
            opacity: cardsVisible ? 1 : 0,
            transform: cardsVisible ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 600ms ease-out, transform 600ms ease-out',
          }}
        >
          {/* Human Entry Card */}
          <div
            className="glass-card glass-card-hover flex flex-col cursor-pointer flex-1"
            onClick={handleHumanClick}
            style={{ padding: '2rem 2.25rem' }}
          >
            <p className="text-sm text-muted-foreground mb-4">
              {t('entry.humanDesc')}
            </p>

            <div className="flex-1" />

            {/* CTA */}
            <button
              className="w-full py-4 rounded-xl text-base font-semibold transition-colors bg-foreground text-background hover:bg-foreground/90"
              onClick={(e) => { e.stopPropagation(); handleHumanClick(); }}
            >
              {locked ? t('wallet.connect') : t('entry.humanCta')}
            </button>
          </div>

          {/* Agent Entry Card */}
          <div
            className="glass-card flex flex-col flex-1"
            style={{ padding: '2rem 2.25rem' }}
          >
            {/* Social icons row */}
            <div className="flex items-center gap-5 mb-5">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.alt}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
                >
                  <img src={link.icon} alt={link.alt} className="w-6 h-6" />
                </a>
              ))}
            </div>

            <p className="text-sm font-medium text-foreground/80 mb-1">
              {t('welcome.trackUs')}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              {t('welcome.trackUsDesc')}
            </p>

            <div className="flex-1" />

            <button
              className="w-full py-4 rounded-xl text-base font-semibold border border-foreground/15 text-muted-foreground cursor-not-allowed opacity-50"
              disabled
            >
              {t('entry.agentCta')}
            </button>
            <p className="text-xs text-muted-foreground/50 text-center mt-2 italic">
              {t('entry.agentComingSoon')}
            </p>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div
        className="absolute bottom-6 right-6 text-sm text-muted-foreground/40"
        style={{
          opacity: cardsVisible ? 1 : 0,
          transition: 'opacity 1s ease-out 500ms',
        }}
      >
        Scroll to explore ↓
      </div>
    </div>
  );
};
