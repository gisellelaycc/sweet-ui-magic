import { useI18n } from '@/lib/i18n';

interface Props {
  activeModules: string[];
  tags: string[];
  onNavigate: (id: string) => void;
}

const ALL_MODULES = [
  { id: 'sport', icon: 'SP' },
  { id: 'music', icon: 'MU' },
  { id: 'art', icon: 'AR' },
  { id: 'reading', icon: 'RD' },
  { id: 'food', icon: 'FD' },
  { id: 'travel', icon: 'TR' },
  { id: 'finance', icon: 'FI' },
  { id: 'gaming', icon: 'GM' },
  { id: 'learning', icon: 'LN' },
];

export const UpdateIdentityPage = ({ activeModules, tags }: Props) => {
  const { t } = useI18n();

  return (
    <div className="animate-fade-in space-y-6 max-w-lg mx-auto">
      <div>
        <h2 className="text-2xl font-bold mb-1">{t('update.title')}</h2>
        <p className="text-muted-foreground text-sm">{t('update.subtitle')}</p>
      </div>

      <div className="glass-card space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t('update.coreLayer')}</h3>
          <button className="text-xs text-muted-foreground/50 hover:text-foreground transition-colors">{t('update.edit')}</button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{t('update.editHint')}</p>
      </div>

      <div className="glass-card space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t('update.signalLayers')}</h3>
        <div className="space-y-2">
          {ALL_MODULES.map(mod => {
            const isActive = activeModules.includes(mod.id);
            return (
              <div key={mod.id} className="flex items-center justify-between py-2 px-1">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{mod.icon}</span>
                  <span className="text-sm">{t(`signal.${mod.id}`)}</span>
                </div>
                {isActive ? (
                  <button className="text-xs px-3 py-1 rounded-lg bg-foreground/10 text-foreground/70 hover:bg-foreground/15 transition-colors">
                    {t('update.edit')}
                  </button>
                ) : (
                  <button className="text-xs px-3 py-1 rounded-lg bg-foreground/5 text-muted-foreground hover:bg-foreground/10 transition-colors">
                    {t('update.activate')}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-card space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t('update.soulLayer')}</h3>
          <button className="text-xs text-muted-foreground/50 hover:text-foreground transition-colors">{t('update.edit')}</button>
        </div>
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {tags.map(tg => (
              <span key={tg} className="chip text-xs !py-1 !px-3 !bg-foreground/8 !text-foreground/70">#{tg}</span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">{t('update.noTags')}</p>
        )}
      </div>

      <button className="btn-twin btn-twin-primary w-full py-3 btn-glow">
        {t('update.remint')}
      </button>
    </div>
  );
};
