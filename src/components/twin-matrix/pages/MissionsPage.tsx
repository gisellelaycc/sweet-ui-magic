import { Eye, X, Heart, FileText, DollarSign, Clock } from 'lucide-react';

const DEMO_MISSIONS = [
  {
    id: '1',
    type: 'passive' as const,
    brand: 'Nike Running',
    brandInitial: 'N',
    agentId: 'agent:nike-run-0x3f',
    title: 'New Pegasus 42 release + City Marathon registration open',
    whyMe: ['Running affinity: high', 'Performance oriented'],
    token: { module: 'soul.sports.running', remaining: 12, validDays: 30 },
  },
  {
    id: '2',
    type: 'task' as const,
    brand: 'Adidas Training',
    brandInitial: 'A',
    agentId: 'agent:adidas-train-0xa1',
    title: '7-day training feedback task for Ultraboost GTX prototype',
    reward: '85 USDT',
    deadline: 'Feb 28, 2026',
    whyMe: ['Gym affinity: high', 'Discipline motivation'],
    token: { module: 'skill.sports.gym', remaining: 1, validDays: 14 },
  },
  {
    id: '3',
    type: 'passive' as const,
    brand: 'Spotify',
    brandInitial: 'S',
    agentId: 'agent:spotify-disc-0x7b',
    title: 'Curated workout playlist based on your rhythm profile',
    whyMe: ['Music affinity: medium', 'High-tempo preference'],
    token: { module: 'soul.music.listening', remaining: 8, validDays: 30 },
  },
];

export const MissionsPage = () => {
  return (
    <div className="animate-fade-in h-full overflow-y-auto scrollbar-hide">
      <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Signal Requests</h2>
        <p className="text-muted-foreground text-sm">Scoped opportunities from brands & agents</p>
      </div>

      <div className="space-y-4">
        {DEMO_MISSIONS.map(mission => (
          <div key={mission.id} className="glass-card space-y-5">
            {/* Header with avatar */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-foreground/8 flex items-center justify-center text-sm font-semibold text-foreground/60">
                  {mission.brandInitial}
                </div>
                <div>
                  <p className="font-semibold">{mission.brand}</p>
                  <p className="text-xs text-muted-foreground font-mono">{mission.agentId}</p>
                </div>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full border ${
                mission.type === 'task'
                  ? 'border-amber-400/30 text-amber-400'
                  : 'border-foreground/10 text-muted-foreground'
              }`}>
                {mission.type === 'task' ? 'Task' : 'Passive'}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-foreground/90">{mission.title}</p>

            {/* Task reward & deadline pills */}
            {mission.type === 'task' && (
              <div className="flex gap-3">
                <span className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-foreground/5">
                  <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="font-medium">{mission.reward}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-foreground/5">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{mission.deadline}</span>
                </span>
              </div>
            )}

            {/* WHY ME */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Signal Match</p>
              <div className="flex flex-wrap gap-2">
                {mission.whyMe.map(reason => (
                  <span key={reason} className="text-xs px-3 py-1.5 rounded-full bg-foreground/5 text-foreground/70">{reason}</span>
                ))}
              </div>
            </div>

            {/* Token bar */}
            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-foreground/[0.03]">
              <span className="text-xs text-muted-foreground font-mono">Scope: {mission.token.module}</span>
              <span className="text-xs text-muted-foreground">{mission.token.remaining} uses · {mission.token.validDays}d</span>
            </div>

            {/* Actions with icons */}
            <div className="flex items-center gap-4">
              {mission.type === 'passive' ? (
                <>
                  <button className="btn-twin btn-twin-primary inline-flex items-center gap-2 py-2.5 px-5 text-sm">
                    <Eye className="w-4 h-4" /> View
                  </button>
                  <button className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <X className="w-4 h-4" /> Dismiss
                  </button>
                  <button className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <Heart className="w-4 h-4" /> More like this
                  </button>
                </>
              ) : (
                <>
                  <button className="btn-twin btn-twin-primary inline-flex items-center gap-2 py-2.5 px-5 text-sm">
                    <FileText className="w-4 h-4" /> Review details
                  </button>
                  <button className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <X className="w-4 h-4" /> Decline
                  </button>
                </>
              )}
            </div>

            {/* Usage hint */}
            <p className="text-xs text-muted-foreground/40">
              {mission.type === 'passive'
                ? 'View consumes 1 usage quota · Dismiss is free'
                : 'Accept locks 1 usage quota · Payment releases on completion'}
            </p>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
};
