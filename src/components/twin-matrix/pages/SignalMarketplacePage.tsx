import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, DollarSign, Clock } from 'lucide-react';

const DEMO_SIGNALS = [
  {
    id: '1',
    type: 'passive' as const,
    brand: 'Nike Running',
    brandInitial: 'N',
    agentId: 'nike-run-0x3f',
    title: 'New Pegasus 42 release + City Marathon registration open',
    matchReasons: ['Running affinity: High', 'Performance orientation'],
    scope: 'soul.sports.running',
    quota: 12,
    validDays: 30,
    layer: 'Soul',
  },
  {
    id: '2',
    type: 'task' as const,
    brand: 'Adidas Training',
    brandInitial: 'A',
    agentId: 'adidas-train-0xa1',
    title: '7-day training feedback task for Ultraboost GTX prototype',
    reward: '85 USDT',
    deadline: 'Feb 28, 2026',
    matchReasons: ['Gym affinity: High', 'Discipline motivation'],
    scope: 'skill.sports.gym',
    quota: 1,
    validDays: 14,
    layer: 'Skill',
  },
  {
    id: '3',
    type: 'passive' as const,
    brand: 'Spotify',
    brandInitial: 'S',
    agentId: 'spotify-disc-0x7b',
    title: 'Curated workout playlist based on your rhythm profile',
    matchReasons: ['Music affinity: Medium', 'High-tempo preference'],
    scope: 'soul.music.listening',
    quota: 8,
    validDays: 30,
    layer: 'Soul',
  },
  {
    id: '4',
    type: 'passive' as const,
    brand: 'Under Armour',
    brandInitial: 'U',
    agentId: 'ua-fit-0xc2',
    title: 'Recovery tracker integration for post-workout analysis',
    matchReasons: ['Fitness tracking: High', 'Recovery focus'],
    scope: 'core.health.recovery',
    quota: 5,
    validDays: 60,
    layer: 'Physical',
  },
];

type Tab = 'all' | 'passive' | 'task' | 'rewards';
type LayerFilter = 'all' | 'Physical' | 'Soul' | 'Skill' | 'Core';

const TABS: { id: Tab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'passive', label: 'Passive' },
  { id: 'task', label: 'Tasks' },
  { id: 'rewards', label: 'Rewards' },
];

const LAYERS: { id: LayerFilter; label: string }[] = [
  { id: 'all', label: 'All Layers' },
  { id: 'Physical', label: 'Physical' },
  { id: 'Soul', label: 'Soul' },
  { id: 'Skill', label: 'Skill' },
  { id: 'Core', label: 'Core' },
];

const ThinDivider = () => (
  <div className="w-full h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />
);

const typeColor: Record<string, string> = {
  passive: 'rgba(10, 255, 255, 0.7)',
  task: 'rgba(255, 180, 40, 0.8)',
};

export const SignalMarketplacePage = () => {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [activeLayer, setActiveLayer] = useState<LayerFilter>('all');
  const scrollRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="animate-fade-in h-full overflow-y-auto scrollbar-hide">
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold mb-1">Signal Marketplace</h2>
          <p className="text-muted-foreground text-sm">Scoped access requests matched to your identity.</p>
        </div>

        <ThinDivider />

        {/* Stats */}
        <div className="flex items-center gap-6 text-xs text-muted-foreground/70">
          <span>
            <span style={{ color: 'rgba(10, 255, 255, 0.8)' }}>Active Signals:</span>{' '}
            <span className="text-foreground/80">{DEMO_SIGNALS.length}</span>
          </span>
          <span>·</span>
          <span>
            Available Quota:{' '}
            <span className="text-foreground/80">{totalQuota} remaining</span>
          </span>
          <span>·</span>
          <span>
            Earned:{' '}
            <span className="text-foreground/80">{totalEarned} USDT</span>
          </span>
        </div>

        <ThinDivider />

        {/* Tabs + Layer Filter */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2 text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
                <span
                  className={`absolute bottom-0 left-0 right-0 h-px transition-opacity ${
                    activeTab === tab.id ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }}
                />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            {LAYERS.map(layer => (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={`px-3 py-1 text-[11px] rounded-full transition-colors ${
                  activeLayer === layer.id
                    ? 'bg-foreground/10 text-foreground'
                    : 'text-muted-foreground/60 hover:text-muted-foreground'
                }`}
              >
                {layer.label}
              </button>
            ))}
          </div>
        </div>

        <ThinDivider />

        {/* Horizontal scroll cards */}
        <div className="relative">
          {/* Left arrow */}
          <button
            onClick={() => scroll('left')}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/80 border border-foreground/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors backdrop-blur-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Right arrow */}
          <button
            onClick={() => scroll('right')}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/80 border border-foreground/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors backdrop-blur-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto scrollbar-hide scroll-smooth px-1 py-1"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground/50 py-12 text-center w-full">No signals match this filter.</p>
            )}

            {filtered.map(signal => (
              <div
                key={signal.id}
                className="flex-shrink-0 w-[calc(33.333%-14px)] min-w-[280px] py-5 space-y-4"
                style={{ scrollSnapAlign: 'start' }}
              >
                {/* Brand + Type */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-foreground/8 flex items-center justify-center text-sm font-semibold text-foreground/60">
                      {signal.brandInitial}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{signal.brand}</p>
                      <p className="text-[10px] text-muted-foreground/50">Verified Agent · {signal.agentId}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium" style={{ color: typeColor[signal.type] }}>
                    {signal.type === 'task' ? 'Paid Task' : 'Passive Signal'}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-foreground/80 leading-relaxed">{signal.title}</p>

                {/* Task reward + deadline */}
                {signal.type === 'task' && (
                  <div className="flex gap-3">
                    <span className="inline-flex items-center gap-1.5 text-xs text-foreground/70">
                      <DollarSign className="w-3 h-3 text-muted-foreground" />
                      {signal.reward}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-foreground/70">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      {signal.deadline}
                    </span>
                  </div>
                )}

                {/* Why this matches */}
                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Why this matches you</p>
                  <div className="space-y-1">
                    {signal.matchReasons.map(r => (
                      <p key={r} className="text-xs text-foreground/60">• {r}</p>
                    ))}
                  </div>
                </div>

                {/* Scope chip + quota */}
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-mono px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(10,255,255,0.08)', color: 'rgba(10,255,255,0.7)' }}
                  >
                    {signal.scope}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {signal.quota} uses · {signal.validDays}d
                  </span>
                </div>

                {/* Thin separator before actions */}
                <div className="h-px" style={{ background: 'rgba(255,255,255,0.04)' }} />

                {/* Actions */}
                <div className="flex items-center gap-3">
                  {signal.type === 'passive' ? (
                    <>
                      <button className="text-xs text-foreground/70 hover:text-foreground transition-colors">View</button>
                      <button className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors">Dismiss</button>
                    </>
                  ) : (
                    <>
                      <button className="text-xs text-foreground/70 hover:text-foreground transition-colors">Review Details</button>
                      <button className="text-xs text-foreground/70 hover:text-foreground transition-colors">Accept</button>
                      <button className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors">Decline</button>
                    </>
                  )}
                </div>

                <p className="text-[9px] text-muted-foreground/30">
                  {signal.type === 'passive'
                    ? 'View consumes 1 usage · Dismiss is free'
                    : 'Accept locks 1 quota · Payment on completion'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
