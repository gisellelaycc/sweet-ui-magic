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
    border: '1px solid var(--glass-border)',
    borderRadius: '16px',
    padding: '1.75rem 1.75rem',
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(16px) saturate(160%)',
    boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.4), 0 4px 16px -4px rgba(100,130,180,0.10)',
  };

  const handleCardEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.borderColor = 'hsl(var(--foreground) / 0.2)';
    e.currentTarget.style.background = 'hsl(var(--foreground) / 0.04)';
  };
  const handleCardLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.borderColor = '';
    e.currentTarget.style.background = 'var(--glass-bg)';
  };

  return (
    <div className="relative flex flex-col px-6 md:px-12 lg:px-16">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-10 w-full max-w-[1400px] mx-auto min-h-[calc(100vh-6rem)] justify-center">

        {/* ── Left: Brand Typography ── */}
        <div className="flex-1 flex flex-col justify-center min-w-0">
          <p className="text-base md:text-lg uppercase tracking-[0.25em] text-muted-foreground font-heading mb-4 md:mb-6">
            {t('welcome.pretitle')}
          </p>

          {/* Main headline — largest, with scan-glow */}
          <h1 className="font-heading uppercase leading-[0.95] tracking-tight relative" style={{ fontSize: 'clamp(2rem, 5.5vw, 4.5rem)' }}>
            <span className="block text-foreground">
              <span className="font-extrabold">Humans</span>{' '}
              <span className="font-normal">list their experience.</span>
            </span>
            <div className="mt-3" style={{ paddingLeft: '2.1em' }}>
              <span className="block text-foreground">
                <span className="font-extrabold">Agents</span>
              </span>
              <span className="block text-foreground font-normal">
                find, negotiate,
              </span>
              <span className="block text-foreground font-normal">
                and pay for it.
              </span>
            </div>
            {/* Scan glow overlay */}
            <span className="scan-text-glow font-heading uppercase leading-[0.95] tracking-tight" aria-hidden="true" style={{ fontSize: 'clamp(2rem, 5.5vw, 4.5rem)' }}>
              <span className="block">
                <span className="font-extrabold">Humans</span>{' '}
                <span className="font-normal">list their experience.</span>
              </span>
              <div className="mt-3" style={{ paddingLeft: '2.1em' }}>
                <span className="block font-extrabold">Agents</span>
                <span className="block font-normal">find, negotiate,</span>
                <span className="block font-normal">and pay for it.</span>
              </div>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-muted-foreground/70 text-sm md:text-base max-w-lg leading-relaxed mt-6" style={{ whiteSpace: 'nowrap' }}>
            A marketplace connecting real human experience with agent economies.
          </p>
        </div>

        {/* ── Right: Cards (vertical) + Social ── */}
        <div className="w-full lg:w-[460px] xl:w-[500px] shrink-0 flex flex-col gap-4">
          {/* Human Entry Card */}
          {/* Human Entry Card */}
          <div
            className="flex flex-col cursor-pointer transition-all duration-300"
            onClick={handleHumanClick}
            style={cardStyle}
            onMouseEnter={handleCardEnter}
            onMouseLeave={handleCardLeave}>

            <p className="text-sm uppercase tracking-widest text-muted-foreground/60 font-heading mb-2">For Humans</p>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6">
              {t('entry.humanDesc')}
            </p>
            <button
              className="btn-twin btn-twin-primary w-full py-4 rounded-xl text-base font-semibold"
              onClick={(e) => {e.stopPropagation();handleHumanClick();}}>
              {locked ? t('wallet.connect') : t('entry.humanCta')}
            </button>
          </div>

          {/* Agent Entry Card */}
          <div
            className="flex flex-col transition-all duration-300"
            style={cardStyle}
            onMouseEnter={handleCardEnter}
            onMouseLeave={handleCardLeave}>

            <p className="text-sm uppercase tracking-widest text-muted-foreground/60 font-heading mb-2">For Agents & Systems</p>
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

                  <img src={link.icon} alt={link.alt} className="w-7 h-7 social-icon" />
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

      {/* ── How it Works ── */}
      <div className="px-6 md:px-12 lg:px-16 py-16 max-w-[1400px] mx-auto w-full">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-center mb-10">How it Works</h2>
        <div className="grid md:grid-cols-2 gap-10">
          {/* Humans */}
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-widest text-muted-foreground/60 font-heading">For Humans</p>
            {[
              { step: '01', title: 'Verify', desc: "Prove your humanity through twin3.ai's verification protocol." },
              { step: '02', title: 'Build Your Twin Matrix', desc: 'Define your skills, experience, and identity layers through a guided wizard.' },
              { step: '03', title: 'Get Discovered', desc: 'Buyer agents find, negotiate, and pay for your verified experience.' },
            ].map((s) => (
              <div key={s.step} className="flex gap-4 items-start" style={{ border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '1.25rem 1.5rem', background: 'var(--glass-bg)' }}>
                <span className="text-xs font-mono text-muted-foreground/40 mt-0.5">{s.step}</span>
                <div>
                  <p className="text-sm font-semibold">{s.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Agents */}
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-widest text-muted-foreground/60 font-heading">For Agents</p>
            {[
              { step: '01', title: 'Connect', desc: 'Register your buyer agent via Skill protocol, REST API, or SDK.' },
              { step: '02', title: 'Search & Match', desc: 'Query verified humans by skill, availability, and matrix signature.' },
              { step: '03', title: 'Negotiate & Pay', desc: 'Propose tasks, agree on terms, and execute on-chain payments.' },
            ].map((s) => (
              <div key={s.step} className="flex gap-4 items-start" style={{ border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '1.25rem 1.5rem', background: 'var(--glass-bg)' }}>
                <span className="text-xs font-mono text-muted-foreground/40 mt-0.5">{s.step}</span>
                <div>
                  <p className="text-sm font-semibold">{s.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Trust Primitives ── */}
      <div className="px-6 md:px-12 lg:px-16 py-16 max-w-[1400px] mx-auto w-full">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-center mb-3">Trust Primitives</h2>
        <p className="text-center text-sm text-muted-foreground mb-10 max-w-lg mx-auto">
          Every interaction is built on verifiable, immutable trust layers.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: '🛡️', title: 'Human Verification', desc: 'Every seller is verified through twin3.ai before they can list experience. No bots. No fakes.' },
            { icon: '📋', title: 'Versioned Tasks', desc: 'Every task, negotiation, and completion is recorded as an immutable version on-chain.' },
            { icon: '🔗', title: 'On-chain Records', desc: 'Twin Matrix state, authorizations, and payments are transparent and auditable on BSC.' },
          ].map((item) => (
            <div key={item.title} className="text-center space-y-3" style={{ border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '1.75rem', background: 'var(--glass-bg)' }}>
              <span className="text-2xl">{item.icon}</span>
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-6 right-6 text-sm text-muted-foreground/40">
        Scroll to explore ↓
      </div>
    </div>);

};