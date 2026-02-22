import React from 'react';
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
{ icon: bcscanLogo, href: 'https://bscscan.com/token/0xe3ec133e29addfbba26a412c38ed5de37195156f', alt: 'BscScan' }];


export const EntryPage = ({ onHumanEntry, onAgentEntry, locked = false, onRequestConnect }: Props) => {
  const { t } = useI18n();

  const handleHumanClick = () => {
    if (locked && onRequestConnect) onRequestConnect();else
    onHumanEntry();
  };

  const cardStyle: React.CSSProperties = {
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '16px',
    padding: '1.75rem 1.75rem',
    background: 'rgba(255, 255, 255, 0.02)'
  };

  const handleCardEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
  };
  const handleCardLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
  };

  return (
    <div className="relative flex flex-col justify-center min-h-[85vh] px-6 md:px-12 lg:px-16">
      <div className="flex flex-col lg:flex-row items-start lg:items-stretch gap-8 lg:gap-10 w-full max-w-[1400px] mx-auto">

        {/* ── Left: Brand Typography ── */}
        <div className="flex-1 flex flex-col justify-center min-w-0">
          <p className="text-base md:text-lg uppercase tracking-[0.25em] text-muted-foreground font-heading mb-4 md:mb-6">
            {t('welcome.pretitle')}
          </p>

          {/* Pretitle */}
          



          {/* Main headline — largest, with scan-glow */}
          <h1 className="font-heading font-extrabold uppercase leading-[0.95] tracking-tight relative">
            {/* Base white text */}
            <span className="block text-foreground" style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)' }}>
              Build and
            </span>
            <span className="block text-foreground" style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)' }}>
              operate your
            </span>
            <span className="block text-foreground" style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)' }}>
              Twin Matrix
            </span>
            {/* Scan glow overlay */}
            <span className="scan-text-glow font-heading font-extrabold uppercase leading-[0.95] tracking-tight" aria-hidden="true">
              <span className="block" style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)' }}>
                Build and
              </span>
              <span className="block" style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)' }}>
                operate your
              </span>
              <span className="block" style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)' }}>
                Twin Matrix
              </span>
            </span>
          </h1>

          {/* Usage line */}
          <p className="text-muted-foreground/70 text-base md:text-lg max-w-lg leading-relaxed mt-6">
            Verify as human. Update your identity. Deploy your agent.
          </p>

          {/* Brand tagline */}
          <p className="text-muted-foreground/40 text-sm md:text-base max-w-lg leading-relaxed mt-4">
            Empowering human experience in the AI age.
          </p>
        </div>

        {/* ── Right: Cards (vertical) + Social ── */}
        <div className="w-full lg:w-[520px] xl:w-[560px] shrink-0 flex flex-col gap-4">
          {/* Human Entry Card */}
          <div
            className="flex flex-col cursor-pointer transition-all duration-300"
            onClick={handleHumanClick}
            style={cardStyle}
            onMouseEnter={handleCardEnter}
            onMouseLeave={handleCardLeave}>

            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6">
              {t('entry.humanDesc')}
            </p>
            <button
              className="w-full py-4 rounded-xl text-base font-semibold transition-colors bg-foreground text-background hover:bg-foreground/90"
              onClick={(e) => {e.stopPropagation();handleHumanClick();}}>

              {locked ? t('wallet.connect') : t('entry.humanCta')}
            </button>
          </div>

          {/* Agent Entry Card — same size & style */}
          <div
            className="flex flex-col transition-all duration-300"
            style={cardStyle}
            onMouseEnter={handleCardEnter}
            onMouseLeave={handleCardLeave}>

            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6">
              {t('entry.agentDesc')}
            </p>
            <button
              className="w-full py-4 rounded-xl text-base font-semibold border border-foreground/15 text-muted-foreground/50 cursor-not-allowed"
              disabled>

              {t('entry.agentCta')}
            </button>
            <p className="text-xs text-muted-foreground/40 text-center mt-2 italic">
              {t('entry.agentComingSoon')}
            </p>
          </div>

          {/* Social block — below both cards */}
          <div className="flex flex-col px-2 py-4">
            <div className="flex items-center gap-5 mb-3">
              {SOCIAL_LINKS.map((link) =>
              <a
                key={link.alt}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity">

                  <img src={link.icon} alt={link.alt} className="w-7 h-7" />
                </a>
              )}
            </div>
            <p className="text-base font-medium text-foreground/80 mb-1">
              {t('welcome.trackUs')}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('welcome.trackUsDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-6 right-6 text-sm text-muted-foreground/40">
        Scroll to explore ↓
      </div>
    </div>);

};