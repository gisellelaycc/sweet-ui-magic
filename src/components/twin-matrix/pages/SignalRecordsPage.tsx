const ThinDivider = () => (
  <div className="w-full h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />
);

type TaskStatus = 'active' | 'completed' | 'expired' | 'declined';

interface SignalRecordRow {
  id: string;
  taskName: string;
  agentName: string;
  scope: string;
  usage: string;
  rewardUsdt: number;
  expiryDate: string;
  completedDate?: string;
  status: TaskStatus;
}

const DEMO_ROWS: SignalRecordRow[] = [
  {
    id: 'active-1',
    taskName: 'Nike Running Upload Smartwatch Activity Records (30 days)',
    agentName: 'Nike Running Agent',
    scope: 'skill.sports.running',
    usage: '12/15',
    rewardUsdt: 3,
    expiryDate: '2026-03-15',
    status: 'active',
  },
  {
    id: 'done-1',
    taskName: 'Adidas Training Lab 7-day Training Feedback for Ultraboost Prototype',
    agentName: 'Adidas Training Lab',
    scope: 'skill.sports.gym',
    usage: '5/5',
    rewardUsdt: 2,
    expiryDate: '2026-02-28',
    completedDate: '2026-02-28',
    status: 'completed',
  },
  {
    id: 'done-2',
    taskName: 'HOKA Performance Field Test: Trail Cushion Feedback (2 weeks)',
    agentName: 'HOKA Performance Agent',
    scope: 'skill.outdoor.trail_running',
    usage: '6/10',
    rewardUsdt: 4,
    expiryDate: '2026-03-10',
    completedDate: '2026-03-10',
    status: 'completed',
  },
  {
    id: 'expired-1',
    taskName: 'Strava Insights Weekly Running Pattern Analysis (4 weeks)',
    agentName: 'Strava Insights Agent',
    scope: 'skill.sports.running',
    usage: '4/4',
    rewardUsdt: 4,
    expiryDate: '2026-01-05',
    status: 'expired',
  },
  {
    id: 'declined-1',
    taskName: 'New Balance Lab Daily Step Consistency Check (14 days)',
    agentName: 'New Balance Lab Agent',
    scope: 'core.activity.steps',
    usage: '14/14',
    rewardUsdt: 3,
    expiryDate: '2026-01-08',
    status: 'declined',
  },
];

function usageBarStyle(usage: string): { width: string; background: string } {
  const [usedRaw, totalRaw] = usage.split('/');
  const used = Number(usedRaw);
  const total = Number(totalRaw);
  const ratio = total > 0 ? Math.max(0, Math.min(1, used / total)) : 0;
  return {
    width: `${ratio * 100}%`,
    background: 'linear-gradient(90deg, rgba(10,255,255,0.75), rgba(10,255,255,0.35))',
  };
}

const STATUS_STYLE: Record<TaskStatus, string> = {
  active: 'bg-cyan-400/15 text-cyan-200',
  completed: 'bg-emerald-400/15 text-emerald-200',
  expired: 'bg-amber-400/15 text-amber-200',
  declined: 'bg-rose-400/15 text-rose-200',
};

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{title}</h3>
      <p className="text-[11px] text-muted-foreground/60 mt-1">{subtitle}</p>
    </div>
  );
}

export const SignalRecordsPage = () => {
  const { t } = useI18n();
  const activeRows = DEMO_ROWS.filter((r) => r.status === 'active');
  const completedRows = DEMO_ROWS.filter((r) => r.status === 'completed');
  const endedRows = DEMO_ROWS.filter((r) => r.status === 'expired' || r.status === 'declined');
  const totalInflow = DEMO_ROWS.filter((r) => r.status === 'completed').reduce((acc, cur) => acc + cur.rewardUsdt, 0);

  return (
    <div className="animate-fade-in h-full overflow-y-auto scrollbar-hide">
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">{t('signalRecords.title')}</h2>
          <p className="text-xs text-muted-foreground/70 mt-2">
            {t('signalRecords.subtitle')}
          </p>
        </div>

        <ThinDivider />

        <div className="flex items-center gap-6 text-xs text-muted-foreground/70 flex-wrap">
          <span>{t('signalRecords.activeCommitments')} <span className="text-foreground/80">{activeRows.length}</span></span>
          <span>·</span>
          <span>{t('signalRecords.completed')} <span className="text-foreground/80">{completedRows.length}</span></span>
          <span>·</span>
          <span>{t('signalRecords.expiredDeclined')} <span className="text-foreground/80">{endedRows.length}</span></span>
          <span>·</span>
          <span>{t('signalRecords.inflow')} <span className="text-foreground/80">{totalInflow} USDT</span></span>
        </div>

        <ThinDivider />

        <SectionHeader
          title={t('signalRecords.activeCommitments')}
          subtitle={t('signalRecords.activeSubtitle')}
        />
        <div className="space-y-0">
          {activeRows.map((row, idx) => (
            <div key={row.id}>
              <div className="py-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto] gap-4 items-center">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{row.taskName}</p>
                  <p className="text-[11px] text-muted-foreground/70 mt-1">{t('signalRecords.issuedBy')} {row.agentName}</p>
                  <span className="inline-flex mt-2 text-[10px] font-mono px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(10,255,255,0.08)', color: 'rgba(10,255,255,0.78)' }}>
                    {row.scope}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={usageBarStyle(row.usage)} />
                  </div>
                  <p className="text-[11px] text-muted-foreground/70 mt-2">{t('signalRecords.remainingQuota')}: {row.usage}</p>
                </div>
                <div className="justify-self-start lg:justify-self-end text-left lg:text-right">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_STYLE[row.status]}`}>{t('records.active')}</span>
                  <p className="text-[11px] text-muted-foreground/70 mt-2">{t('signalRecords.expiry')} {row.expiryDate}</p>
                  <div className="flex gap-3 lg:justify-end mt-2">
                    <button className="text-[11px] text-foreground/70 hover:text-foreground transition-colors">{t('records.viewDetails')}</button>
                    <button className="text-[11px] text-rose-300/80 hover:text-rose-200 transition-colors">{t('records.revoke')}</button>
                  </div>
                </div>
              </div>
              {idx < activeRows.length - 1 && <ThinDivider />}
            </div>
          ))}
        </div>

        <ThinDivider />

        <SectionHeader
          title={t('signalRecords.completedRecords')}
          subtitle={t('signalRecords.completedSubtitle')}
        />
        <div className="space-y-0">
          {completedRows.map((row, idx) => (
            <div key={row.id}>
              <div className="py-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] gap-4 items-center">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{row.taskName}</p>
                  <p className="text-[11px] text-muted-foreground/70 mt-1">{row.agentName}</p>
                </div>
                <div className="text-[11px] text-muted-foreground/70 space-y-1">
                  <p>{t('signalRecords.scopeUsed')}: <span className="text-foreground/80 font-mono">{row.scope}</span></p>
                  <p>{t('signalRecords.totalUsage')}: <span className="text-foreground/80">{row.usage}</span></p>
                  <p>{t('signalRecords.completedDate')}: <span className="text-foreground/80">{row.completedDate}</span></p>
                </div>
                <div className="justify-self-start lg:justify-self-end text-left lg:text-right">
                  <p className="text-sm text-foreground/85">{row.rewardUsdt} USDT</p>
                  <span className={`inline-flex mt-1 text-[10px] px-2 py-0.5 rounded-full ${STATUS_STYLE[row.status]}`}>{t('signalRecords.completed')}</span>
                </div>
              </div>
              {idx < completedRows.length - 1 && <ThinDivider />}
            </div>
          ))}
        </div>

        <ThinDivider />

        <SectionHeader
          title={t('signalRecords.expiredDeclined')}
          subtitle={t('signalRecords.endedSubtitle')}
        />
        <div className="space-y-0">
          {endedRows.map((row, idx) => (
            <div key={row.id}>
              <div className="py-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] gap-4 items-center">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{row.taskName}</p>
                  <p className="text-[11px] text-muted-foreground/70 mt-1">{row.agentName}</p>
                </div>
                <div className="text-[11px] text-muted-foreground/70 space-y-1">
                  <p>{t('signalRecords.scopeUsed')}: <span className="text-foreground/80 font-mono">{row.scope}</span></p>
                  <p>{row.status === 'expired' ? t('signalRecords.expiryDate') : t('signalRecords.declineDate')}: <span className="text-foreground/80">{row.expiryDate}</span></p>
                  <button className="text-[11px] text-foreground/70 hover:text-foreground transition-colors p-0">
                    {row.status === 'expired' ? t('records.renew') : t('signalRecords.openTelegram')}
                  </button>
                </div>
                <div className="justify-self-start lg:justify-self-end text-left lg:text-right">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_STYLE[row.status]}`}>
                    {row.status === 'expired' ? t('records.expired') : t('signalRecords.declined')}
                  </span>
                  <p className="text-[11px] text-muted-foreground/70 mt-2">{t('signalRecords.expiryDate')} {row.expiryDate}</p>
                  {row.status === 'expired' && (
                    <button className="text-[11px] text-foreground/70 hover:text-foreground transition-colors mt-2">
                      {t('records.renew')}
                    </button>
                  )}
                </div>
              </div>
              {idx < endedRows.length - 1 && <ThinDivider />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
import { useI18n } from '@/lib/i18n';
