import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface SignalDetail {
  taskDescription?: string;
  whatYoullDo?: string[];
  supportedData?: string[];
  fileNote?: string;
  passiveDescription?: string;
  features?: string[];
}

interface Signal {
  id: string;
  type: 'passive' | 'task';
  brand: string;
  brandInitial: string;
  agentId: string;
  title: string;
  reward?: string;
  deadline?: string;
  matchReasons: string[];
  scope: string;
  quota: number;
  validDays: number;
  layer: string;
  detail: SignalDetail;
}

const DEMO_SIGNALS: Signal[] = [
  {
    id: '1',
    type: 'task',
    brand: 'Nike Running',
    brandInitial: 'N',
    agentId: 'nike-run-0x3f',
    title: 'Upload Smartwatch Activity Records (1 month)',
    reward: '3 USDT',
    deadline: 'March 14, 2026',
    matchReasons: ['Running affinity: High', 'Performance-oriented training style', 'Consistent activity patterns'],
    scope: 'skill.sports.running',
    quota: 12,
    validDays: 30,
    layer: 'Skill',
    detail: {
      taskDescription: `We're collecting real-world running activity records to evaluate training patterns and product fit for upcoming Nike Running initiatives.\n\nIf you regularly run with a smartwatch or fitness tracker, this task invites you to securely upload a short window of your recent activity history. Your data will be used in aggregate for internal research and will never be sold or shared externally.`,
      whatYoullDo: ['Upload 7 days of running activity records from your smartwatch or fitness tracker'],
      supportedData: ['Distance', 'Duration', 'Pace', 'Heart rate (optional)', 'Timestamp (date-level, no exact location required)'],
      fileNote: 'Raw files (e.g. GPX / FIT / CSV) are accepted.\nExact routes or GPS traces are not required.',
    },
  },
  {
    id: '2',
    type: 'task',
    brand: 'Adidas Training',
    brandInitial: 'A',
    agentId: 'adidas-train-0xa1',
    title: '7-day training feedback task for Ultraboost GTX prototype',
    reward: '2 USDT',
    deadline: 'Feb 28, 2026',
    matchReasons: ['Gym affinity: High', 'Discipline motivation'],
    scope: 'skill.sports.gym',
    quota: 1,
    validDays: 14,
    layer: 'Skill',
    detail: {
      taskDescription: `Adidas is looking for dedicated gym-goers to test and provide structured feedback on the upcoming Ultraboost GTX prototype. Your training insights will directly shape the next generation of performance footwear.\n\nAll feedback is collected anonymously and used solely for product development.`,
      whatYoullDo: [
        'Wear the Ultraboost GTX prototype during 7 consecutive training sessions',
        'Complete a daily feedback form rating comfort, support, and performance',
        'Submit a final summary with overall impressions and improvement suggestions',
      ],
    },
  },
  {
    id: '3',
    type: 'passive',
    brand: 'Spotify',
    brandInitial: 'S',
    agentId: 'spotify-disc-0x7b',
    title: 'Curated workout playlist based on your rhythm profile',
    matchReasons: ['Music affinity: Medium', 'High-tempo preference'],
    scope: 'soul.music.listening',
    quota: 8,
    validDays: 30,
    layer: 'Soul',
    detail: {
      passiveDescription: `Based on your soul profile's music and rhythm preferences, Spotify has generated a personalized workout playlist optimized for your training intensity and tempo preferences.\n\nThis is a passive signal — no action is required. Viewing this signal lets Spotify's agent access your rhythm profile within the authorized scope to curate better recommendations over time.`,
      features: [
        'Personalized BPM matching for your workout intensity',
        'Genre mix based on your soul music affinity scores',
        'Weekly auto-refresh based on listening patterns',
        'No personal data leaves the authorized scope',
      ],
    },
  },
  {
    id: '4',
    type: 'passive',
    brand: 'Under Armour',
    brandInitial: 'U',
    agentId: 'ua-fit-0xc2',
    title: 'Recovery tracker integration for post-workout analysis',
    matchReasons: ['Fitness tracking: High', 'Recovery focus'],
    scope: 'core.health.recovery',
    quota: 5,
    validDays: 60,
    layer: 'Physical',
    detail: {
      passiveDescription: `Under Armour's recovery agent uses your physical profile to provide personalized post-workout recovery insights. This includes sleep quality correlation, muscle group recovery estimates, and optimal rest period suggestions.\n\nAll analysis happens within the scoped authorization. Your raw health data is never exported or stored externally.`,
      features: [
        'Post-workout muscle recovery timeline',
        'Sleep quality impact on performance',
        'Personalized rest day recommendations',
        'Integration with existing fitness trackers',
      ],
    },
  },
];

type Tab = 'all' | 'passive' | 'task' | 'rewards';
type LayerFilter = 'all' | 'Physical' | 'Soul' | 'Skill' | 'Core';

const typeColor: Record<string, string> = {
  passive: 'rgba(10, 255, 255, 0.7)',
  task: 'rgba(255, 180, 40, 0.8)',
};

const ThinDivider = () => (
  <div className="w-full h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />
);

export const SignalMarketplacePage = () => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [activeLayer, setActiveLayer] = useState<LayerFilter>('all');
  const [viewSignal, setViewSignal] = useState<Signal | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const TABS: { id: Tab; label: string }[] = [
    { id: 'all', label: t('marketplace.all') },
    { id: 'passive', label: t('marketplace.passive') },
    { id: 'task', label: t('marketplace.tasks') },
    { id: 'rewards', label: t('marketplace.rewards') },
  ];

  const LAYERS: { id: LayerFilter; label: string }[] = [
    { id: 'all', label: t('marketplace.allLayers') },
    { id: 'Physical', label: t('common.physical') },
    { id: 'Soul', label: t('common.soul') },
    { id: 'Skill', label: 'Skill' },
    { id: 'Core', label: t('common.core') },
  ];

  const filtered = DEMO_SIGNALS.filter(s => {
    if (activeTab !== 'all' && activeTab !== 'rewards' && s.type !== activeTab) return false;
    if (activeTab === 'rewards' && s.type !== 'task') return false;
    if (activeLayer !== 'all' && s.layer !== activeLayer) return false;
    return true;
  });

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.offsetWidth * 0.8;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  const totalQuota = DEMO_SIGNALS.reduce((sum, s) => sum + s.quota, 0);
  const totalEarned = 85;

  const glassDialogStyle: React.CSSProperties = {
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid var(--glass-border)',
    boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.3)',
  };

  return (
    <div className="animate-fade-in h-full overflow-y-auto scrollbar-hide">
      <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">{t('marketplace.title')}</h2>
          <p className="text-muted-foreground text-sm">{t('marketplace.subtitle')}</p>
        </div>

        <ThinDivider />

        <div className="flex items-center gap-6 text-xs text-muted-foreground/70">
          <span>
            <span style={{ color: 'rgba(10, 255, 255, 0.8)' }}>{t('marketplace.activeSignals')}</span>{' '}
            <span className="text-foreground/80">{DEMO_SIGNALS.length}</span>
          </span>
          <span>·</span>
          <span>
            {t('marketplace.availableQuota')}{' '}
            <span className="text-foreground/80">{totalQuota} {t('marketplace.remaining')}</span>
          </span>
          <span>·</span>
          <span>
            {t('marketplace.earned')}{' '}
            <span className="text-foreground/80">{totalEarned} USDT</span>
          </span>
        </div>

        <ThinDivider />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2 text-sm transition-colors ${activeTab === tab.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                {tab.label}
                <span className={`absolute bottom-0 left-0 right-0 h-px transition-opacity ${activeTab === tab.id ? 'opacity-100' : 'opacity-0'}`}
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }} />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            {LAYERS.map(layer => (
              <button key={layer.id} onClick={() => setActiveLayer(layer.id)}
                className={`px-3 py-1 text-[11px] rounded-full transition-colors ${activeLayer === layer.id ? 'bg-foreground/10 text-foreground' : 'text-muted-foreground/60 hover:text-muted-foreground'}`}>
                {layer.label}
              </button>
            ))}
          </div>
        </div>

        <ThinDivider />

        <div className="relative">
          <button onClick={() => scroll('left')}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/80 border border-foreground/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors backdrop-blur-sm">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => scroll('right')}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/80 border border-foreground/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors backdrop-blur-sm">
            <ChevronRight className="w-4 h-4" />
          </button>

          <div ref={scrollRef} className="flex gap-5 overflow-x-auto scrollbar-hide scroll-smooth px-1 py-1" style={{ scrollSnapType: 'x mandatory' }}>
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground/50 py-12 text-center w-full">{t('marketplace.noSignals')}</p>
            )}
            {filtered.map(signal => (
              <div key={signal.id} className="flex-shrink-0 w-[calc(33.333%-14px)] min-w-[280px] py-5 space-y-4" style={{ scrollSnapAlign: 'start' }}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-foreground/8 flex items-center justify-center text-sm font-semibold text-foreground/60">{signal.brandInitial}</div>
                    <div>
                      <p className="font-semibold text-sm">{signal.brand}</p>
                      <p className="text-[10px] text-muted-foreground/50">{t('marketplace.verifiedAgent')} · {signal.agentId}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium" style={{ color: typeColor[signal.type] }}>
                    {signal.type === 'task' ? t('marketplace.paidTask') : t('marketplace.passiveSignal')}
                  </span>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{signal.title}</p>
                {signal.type === 'task' && (
                  <>
                    <div className="space-y-2">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Reward</p>
                      <p className="text-sm text-foreground/80">{signal.reward}</p>
                      <p className="text-[10px] text-muted-foreground/50">Payment is released upon successful review and task completion.</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Deadline</p>
                      <p className="text-sm text-foreground/80">{signal.deadline}</p>
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{t('marketplace.whyMatch')}</p>
                  <div className="space-y-1">
                    {signal.matchReasons.map(r => (<p key={r} className="text-xs text-foreground/60">• {r}</p>))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Authorized Scope</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full" style={{ background: 'rgba(10,255,255,0.08)', color: 'rgba(10,255,255,0.7)' }}>{signal.scope}</span>
                    <span className="text-[10px] text-muted-foreground">{signal.quota} {t('marketplace.uses')} · {signal.validDays}d</span>
                  </div>
                  <p className="text-[9px] text-muted-foreground/40">(Access limited to this scope only)</p>
                </div>
                <div className="h-px" style={{ background: 'rgba(255,255,255,0.04)' }} />
                <div className="flex items-center gap-3">
                  {signal.type === 'passive' ? (
                    <>
                      <button onClick={() => setViewSignal(signal)} className="text-xs text-foreground/70 hover:text-foreground transition-colors">{t('marketplace.view')}</button>
                      <button className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors">{t('marketplace.dismiss')}</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setViewSignal(signal)} className="text-xs text-foreground/70 hover:text-foreground transition-colors">{t('marketplace.reviewDetails')}</button>
                      <button className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors">{t('marketplace.decline')}</button>
                    </>
                  )}
                </div>
                <p className="text-[9px] text-muted-foreground/30">
                  {signal.type === 'passive' ? t('marketplace.viewConsumes') : 'Accept locks 1 quota · Payment on completion'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Signal Detail Dialog */}
      {viewSignal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setViewSignal(null)} />
          <div
            className="relative z-10 w-full max-w-lg max-h-[80vh] overflow-y-auto scrollbar-hide rounded-[20px] p-8 space-y-5 mx-4"
            style={glassDialogStyle}
          >
            {/* Close */}
            <button onClick={() => setViewSignal(null)} className="absolute right-5 top-5 text-muted-foreground/60 hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-foreground/8 flex items-center justify-center text-sm font-semibold text-foreground/60">{viewSignal.brandInitial}</div>
              <div>
                <p className="font-semibold">{viewSignal.brand}</p>
                <p className="text-[10px] text-muted-foreground/50">{t('marketplace.verifiedAgent')} · {viewSignal.agentId}</p>
              </div>
            </div>

            <ThinDivider />

            {/* Title */}
            <p className="text-sm font-medium text-foreground/90">{viewSignal.title}</p>

            {/* Task-specific: reward + deadline */}
            {viewSignal.type === 'task' && viewSignal.reward && (
              <div className="flex gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Reward</p>
                  <p className="text-sm text-foreground/80">{viewSignal.reward}</p>
                </div>
                {viewSignal.deadline && (
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Deadline</p>
                    <p className="text-sm text-foreground/80">{viewSignal.deadline}</p>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            {viewSignal.detail.taskDescription && (
              <div className="space-y-2">
                <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold">Task Description</p>
                <p className="text-sm text-foreground/70 leading-relaxed whitespace-pre-line">{viewSignal.detail.taskDescription}</p>
              </div>
            )}
            {viewSignal.detail.passiveDescription && (
              <div className="space-y-2">
                <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold">About This Signal</p>
                <p className="text-sm text-foreground/70 leading-relaxed whitespace-pre-line">{viewSignal.detail.passiveDescription}</p>
              </div>
            )}

            {/* What You'll Do */}
            {viewSignal.detail.whatYoullDo && (
              <div className="space-y-2">
                <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold">What You'll Do</p>
                <ul className="space-y-1">
                  {viewSignal.detail.whatYoullDo.map((item, i) => (
                    <li key={i} className="text-sm text-foreground/70">• {item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Features (passive) */}
            {viewSignal.detail.features && (
              <div className="space-y-2">
                <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold">What's Included</p>
                <ul className="space-y-1">
                  {viewSignal.detail.features.map((item, i) => (
                    <li key={i} className="text-sm text-foreground/70">• {item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Supported data types */}
            {viewSignal.detail.supportedData && (
              <div className="space-y-2">
                <p className="text-[11px] text-muted-foreground/60">Supported data types include:</p>
                <ul className="space-y-0.5 pl-4">
                  {viewSignal.detail.supportedData.map((item, i) => (
                    <li key={i} className="text-xs text-foreground/50">• {item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* File note */}
            {viewSignal.detail.fileNote && (
              <p className="text-xs text-muted-foreground/40 whitespace-pre-line">{viewSignal.detail.fileNote}</p>
            )}

            {/* Scope */}
            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <span className="text-[10px] font-mono" style={{ color: 'rgba(10,255,255,0.7)' }}>{viewSignal.scope}</span>
              <span className="text-[10px] text-muted-foreground">{viewSignal.quota} uses · {viewSignal.validDays}d</span>
            </div>

            <ThinDivider />

            {/* Actions: task = Accept + Decline CTA, passive = no CTA */}
            {viewSignal.type === 'task' && (
              <div className="flex items-center gap-3 pt-1">
                <button className="btn-twin btn-twin-primary btn-glow py-2.5 px-5 text-sm flex-1">
                  Accept (locks quota · payment on completion)
                </button>
                <button onClick={() => setViewSignal(null)} className="text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
                  Decline (free)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
