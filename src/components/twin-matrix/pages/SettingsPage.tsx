import { useMemo } from 'react';
import { useI18n } from '@/lib/i18n';

function generateWalletAddress(): string {
  const chars = '0123456789abcdef';
  let addr = '0x';
  for (let i = 0; i < 40; i++) {
    addr += chars[Math.floor(Math.random() * chars.length)];
  }
  return addr;
}

export const SettingsPage = () => {
  const { t } = useI18n();
  const walletAddress = useMemo(() => generateWalletAddress(), []);

  return (
    <div className="animate-fade-in space-y-6 max-w-lg mx-auto">
      <div>
        <h2 className="text-2xl font-bold mb-1">{t('settings.title')}</h2>
        <p className="text-muted-foreground text-sm">{t('settings.subtitle')}</p>
      </div>

      {/* Wallet */}
      <div className="glass-card space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t('settings.wallet')}</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('settings.status')}</span>
            <span className="text-green-400 text-xs">{t('settings.statusConnected')}</span>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">{t('settings.address')}</span>
            <p className="text-[11px] text-foreground/70 font-mono break-all mt-0.5">{walletAddress}</p>
          </div>
        </div>
      </div>

      {/* Market */}
      <div className="glass-card space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t('settings.market')}</h3>
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">{t('settings.marketId')}</span>
          <span className="text-foreground/80 font-mono text-xs">global_default</span>
        </div>
      </div>

      {/* Preferences */}
      <div className="glass-card space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t('settings.preferences')}</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">{t('settings.notifications')}</span>
            <div className="w-10 h-5 rounded-full bg-green-400/20 relative cursor-pointer">
              <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-green-400 transition-all" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">{t('settings.privacyMode')}</span>
            <div className="w-10 h-5 rounded-full bg-foreground/10 relative cursor-pointer">
              <div className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-foreground/30 transition-all" />
            </div>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground/30 text-center">Twin Matrix v0.1 — Demo</p>
    </div>
  );
};
