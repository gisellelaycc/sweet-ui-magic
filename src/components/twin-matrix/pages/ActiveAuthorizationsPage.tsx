import { useI18n } from '@/lib/i18n';

const DEMO_AUTHORIZATIONS = [
  { id: '1', agent: 'Nike Running Agent', scope: 'Sport Only', remaining: 12, total: 15, expiresAt: '2025-03-15', status: 'active' as const },
  { id: '2', agent: 'Adidas Brand Hub', scope: 'Full Identity', remaining: 0, total: 5, expiresAt: '2025-02-01', status: 'consumed' as const },
  { id: '3', agent: 'Health Analytics', scope: 'Core + Soul', remaining: 3, total: 10, expiresAt: '2024-12-31', status: 'expired' as const },
];

const statusColor: Record<string, string> = {
  active: 'rgba(10, 255, 255, 0.8)',
  consumed: 'hsl(var(--foreground) / 0.3)',
  expired: 'rgba(242, 68, 85, 0.6)',
};

const ThinDivider = () => (
  <div className="w-full h-px" style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--foreground) / 0.06), transparent)' }} />
);

export const ActiveAuthorizationsPage = () => {
  const { t } = useI18n();

  const statusLabel: Record<string, string> = {
    active: t('records.active'),
    consumed: t('records.consumed'),
    expired: t('records.expired'),
  };
  const actionLabel: Record<string, string> = {
    active: t('records.revoke'),
    consumed: t('records.viewDetails'),
    expired: t('records.renew'),
  };

  const counts = {
    active: DEMO_AUTHORIZATIONS.filter(a => a.status === 'active').length,
    consumed: DEMO_AUTHORIZATIONS.filter(a => a.status === 'consumed').length,
    expired: DEMO_AUTHORIZATIONS.filter(a => a.status === 'expired').length,
  };

  return (
    <div className="animate-fade-in h-full overflow-y-auto scrollbar-hide">
      <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">{t('records.title')}</h2>
          <p className="text-muted-foreground text-sm mb-3">{t('records.subtitle')}</p>
          <p className="text-sm text-muted-foreground/70">
            <span style={{ color: 'rgba(10, 255, 255, 0.8)' }}>{t('records.active')}: {counts.active}</span>
            <span className="mx-2">·</span>
            <span>{t('records.consumed')}: {counts.consumed}</span>
            <span className="mx-2">·</span>
            <span style={{ color: 'rgba(242, 68, 85, 0.6)' }}>{t('records.expired')}: {counts.expired}</span>
          </p>
        </div>

        <ThinDivider />

        <div className="space-y-0">
          {DEMO_AUTHORIZATIONS.map((auth, idx) => (
            <div key={auth.id}>
              <div className="py-5 space-y-3">
                <div className="flex items-start justify-between">
                  <p className="font-semibold text-sm text-foreground">{auth.agent}</p>
                  <span className="text-xs font-medium" style={{ color: statusColor[auth.status] }}>
                    {statusLabel[auth.status]}
                  </span>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('records.scope')}</span>
                    <span className="text-foreground/70">{auth.scope}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('records.remaining')}</span>
                    <span className="text-foreground/70">{auth.remaining} / {auth.total}</span>
                  </div>
                  <div className="h-1 bg-foreground/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full"
                      style={{ width: `${(auth.remaining / auth.total) * 100}%`, background: statusColor[auth.status], opacity: 0.6 }} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{auth.status === 'expired' ? t('records.expired') : t('records.expires')}</span>
                    <span className="text-foreground/70">{auth.expiresAt}</span>
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('records.view')}</button>
                  <button className="text-sm transition-colors"
                    style={{ color: auth.status === 'active' ? 'rgba(242, 68, 85, 0.6)' : statusColor[auth.status] }}>
                    {actionLabel[auth.status]}
                  </button>
                </div>
              </div>
              {idx < DEMO_AUTHORIZATIONS.length - 1 && <ThinDivider />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
