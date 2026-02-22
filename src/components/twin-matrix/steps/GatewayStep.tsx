import { useState, useEffect } from 'react';
import logo from '@/assets/twin3-logo.svg';
import { StepLayout, StepContent } from '../StepLayout';
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

/* ── Social Footer ── */
const SOCIAL_LINKS = [
  { icon: xLogo, href: 'https://x.com/twin3_ai', alt: 'X (Twitter)' },
  { icon: elementLogo, href: 'https://element.market/collections/twin3-1?search[toggles][0]=ALL', alt: 'Element' },
  { icon: farcasterLogo, href: 'https://warpcast.com/twin3.eth', alt: 'Farcaster' },
  { icon: bcscanLogo, href: 'https://bscscan.com/token/0xe3ec133e29addfbba26a412c38ed5de37195156f', alt: 'BscScan' },
];

const SocialFooter = () => {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center gap-3 mt-auto pt-8">
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
  );
};

/* ── Entry Card ── */
interface EntryCardProps {
  title: string;
  description: string;
  cta: string;
  onClick: () => void;
  disabled?: boolean;
  badge?: string;
  variant: 'human' | 'agent';
}

const EntryCard = ({ title, description, cta, onClick, disabled, badge, variant }: EntryCardProps) => {
  const isHuman = variant === 'human';

  return (
    <div
      className="relative glass-card flex flex-col items-center text-center p-8 md:p-10 rounded-2xl transition-all duration-300 hover:border-foreground/20 group flex-1 min-w-[260px] max-w-[400px]"
      style={{
        borderColor: isHuman ? 'rgba(10, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* Icon */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300"
        style={{
          background: isHuman
            ? 'linear-gradient(135deg, rgba(10, 255, 255, 0.12), rgba(10, 255, 255, 0.04))'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
          border: isHuman
            ? '1px solid rgba(10, 255, 255, 0.18)'
            : '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {isHuman ? (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#0AFFFF]">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-foreground/70">
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <circle cx="12" cy="5" r="3" />
            <line x1="8" y1="16" x2="8" y2="16" />
            <line x1="16" y1="16" x2="16" y2="16" />
          </svg>
        )}
      </div>

      {/* Title */}
      <h2 className="font-heading font-bold text-2xl md:text-3xl tracking-tight mb-3">
        {title}
      </h2>

      {/* Description */}
      <p className="text-muted-foreground text-sm leading-relaxed mb-8 whitespace-pre-line max-w-[280px]">
        {description}
      </p>

      {/* Badge */}
      {badge && (
        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-muted-foreground/70 border border-foreground/10 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
            {badge}
          </span>
        </div>
      )}

      {/* CTA */}
      <div className="mt-auto w-full">
        <button
          onClick={onClick}
          disabled={disabled}
          className={`btn-twin w-full py-3 text-sm ${
            isHuman
              ? 'btn-twin-primary btn-glow'
              : 'btn-twin-ghost'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {cta}
        </button>
      </div>
    </div>
  );
};

export const GatewayStep = ({ onHumanEntry, onAgentEntry, locked = false, onRequestConnect }: Props) => {
  const { t } = useI18n();

  const [titleVisible, setTitleVisible] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setTitleVisible(true), 400);
    const t2 = setTimeout(() => setCardsVisible(true), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <StepLayout>
      <StepContent>
        <div className="relative flex flex-col items-center justify-center text-center min-h-[70vh] px-4">
          <div className="relative z-10 flex flex-col items-center w-full">
            {/* Logo */}
            <img
              src={logo}
              alt="Twin3"
              className="w-12 h-12 mb-6"
              style={{
                opacity: titleVisible ? 1 : 0,
                transition: 'opacity 600ms ease-out',
              }}
            />

            {/* Pre-title */}
            <p
              className="text-sm uppercase tracking-[0.2em] text-muted-foreground font-heading mb-3"
              style={{
                opacity: titleVisible ? 1 : 0,
                transform: titleVisible ? 'translateY(0)' : 'translateY(8px)',
                transition: 'opacity 500ms ease-out 200ms, transform 500ms ease-out 200ms',
              }}
            >
              {t('welcome.pretitle')}
            </p>

            {/* Main title */}
            <h1
              className="font-heading font-bold tracking-tight leading-[1.1] relative mb-4"
              style={{
                fontSize: 'clamp(1.8rem, 4.5vw, 3rem)',
                maxWidth: '600px',
                opacity: titleVisible ? 1 : 0,
                transform: titleVisible ? 'scale(1)' : 'scale(0.92)',
                transition: 'opacity 800ms ease-out, transform 800ms ease-out',
              }}
            >
              <span className="scan-text-base">{t('welcome.title')}</span>
              <span className="scan-text-glow" aria-hidden="true">{t('welcome.title')}</span>
            </h1>

            {/* Subtitle */}
            <p
              className="text-muted-foreground text-base max-w-md mx-auto leading-relaxed mb-3"
              style={{
                opacity: titleVisible ? 1 : 0,
                transform: titleVisible ? 'translateY(0)' : 'translateY(12px)',
                transition: 'opacity 600ms ease-out 400ms, transform 600ms ease-out 400ms',
              }}
            >
              {t('welcome.subtitle')}
            </p>

            {/* "Who are you?" prompt */}
            <p
              className="text-lg md:text-xl font-heading font-semibold tracking-wide text-foreground/90 mt-6 mb-8"
              style={{
                opacity: cardsVisible ? 1 : 0,
                transform: cardsVisible ? 'translateY(0)' : 'translateY(8px)',
                transition: 'opacity 500ms ease-out, transform 500ms ease-out',
              }}
            >
              {t('welcome.chooseEntry')}
            </p>

            {/* Entry Cards */}
            <div
              className="flex flex-col md:flex-row gap-6 w-full max-w-[840px] mx-auto relative"
              style={{
                opacity: cardsVisible ? 1 : 0,
                transform: cardsVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 600ms ease-out 100ms, transform 600ms ease-out 100ms',
              }}
            >
              <EntryCard
                variant="human"
                title={t('gateway.human.title')}
                description={t('gateway.human.desc')}
                cta={t('gateway.human.cta')}
                onClick={onHumanEntry}
                disabled={locked}
              />

              <EntryCard
                variant="agent"
                title={t('gateway.agent.title')}
                description={t('gateway.agent.desc')}
                cta={t('gateway.agent.cta')}
                onClick={onAgentEntry}
                disabled={locked}
                badge={t('gateway.agent.comingSoon')}
              />

              {/* Wallet overlay when locked */}
              {locked && (
                <div className="absolute inset-0 rounded-2xl bg-background/60 backdrop-blur-sm border border-foreground/10 flex flex-col items-center justify-center gap-4 z-10">
                  <p className="text-sm text-muted-foreground text-center px-4">
                    {t('wallet.connectToContinue')}
                  </p>
                  <button
                    onClick={onRequestConnect}
                    className="btn-twin btn-twin-primary py-2.5 px-5 text-sm"
                  >
                    {t('wallet.connect')}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Social Footer */}
          <div
            style={{
              opacity: cardsVisible ? 1 : 0,
              transition: 'opacity 800ms ease-out 400ms',
            }}
          >
            <SocialFooter />
          </div>
        </div>
      </StepContent>
    </StepLayout>
  );
};
