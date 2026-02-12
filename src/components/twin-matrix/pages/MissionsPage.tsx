const DEMO_MISSIONS = [
  {
    id: '1',
    type: 'passive' as const,
    brand: 'Nike',
    agentId: 'nike-running-01',
    title: 'New Pegasus 42 release + City Marathon registration open',
    whyMe: ['Running affinity: high', 'Performance oriented'],
    token: { module: 'soul.sports.running', remaining: 12, validDays: 28 },
  },
  {
    id: '2',
    type: 'task' as const,
    brand: 'Adidas',
    agentId: 'adidas-feedback-03',
    title: '7-day training feedback task',
    reward: '15 USDT',
    deadline: '2025-03-01',
    whyMe: ['Sport module active', 'Consistent training pattern'],
    token: { module: 'soul.sports.general', remaining: 5, validDays: 14 },
  },
  {
    id: '3',
    type: 'passive' as const,
    brand: 'Spotify',
    agentId: 'spotify-discovery-07',
    title: 'Curated workout playlist based on your rhythm profile',
    whyMe: ['Music affinity: medium', 'High-tempo preference'],
    token: { module: 'soul.music.listening', remaining: 8, validDays: 30 },
  },
];

export const MissionsPage = () => {
  return (
    <div className="animate-fade-in space-y-6 max-w-lg mx-auto">
      <div>
        <h2 className="text-2xl font-bold mb-1">Missions</h2>
        <p className="text-muted-foreground text-sm">Recommendations and tasks from brands & agents</p>
      </div>

      <div className="space-y-3">
        {DEMO_MISSIONS.map(mission => (
          <div key={mission.id} className="glass-card space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-sm">{mission.brand}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{mission.agentId}</p>
              </div>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full ${
                mission.type === 'task' 
                  ? 'bg-amber-400/10 text-amber-400' 
                  : 'bg-foreground/5 text-muted-foreground'
              }`}>
                {mission.type === 'task' ? 'Task' : 'Passive'}
              </span>
            </div>

            {/* Content */}
            <p className="text-sm text-foreground/90">{mission.title}</p>

            {/* Task-specific info */}
            {mission.type === 'task' && (
              <div className="flex gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground">Reward</span>
                  <p className="text-foreground font-medium">{mission.reward}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Deadline</span>
                  <p className="text-foreground font-medium">{mission.deadline}</p>
                </div>
              </div>
            )}

            {/* WHY ME */}
            <div className="space-y-1.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Why Me</p>
              <div className="flex flex-wrap gap-1.5">
                {mission.whyMe.map(reason => (
                  <span key={reason} className="text-[11px] px-2.5 py-1 rounded-lg bg-foreground/5 text-foreground/60">{reason}</span>
                ))}
              </div>
            </div>

            {/* Token */}
            <div className="space-y-1 pt-2 border-t border-foreground/5">
              <p className="text-[10px] text-muted-foreground font-mono">{mission.token.module}</p>
              <div className="flex gap-3 text-[10px] text-muted-foreground">
                <span>{mission.token.remaining} uses left</span>
                <span>·</span>
                <span>{mission.token.validDays}d valid</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {mission.type === 'passive' ? (
                <>
                  <button className="btn-twin btn-twin-primary flex-1 py-2 text-xs">View</button>
                  <button className="btn-twin btn-twin-ghost flex-1 py-2 text-xs">Dismiss</button>
                  <button className="btn-twin btn-twin-ghost py-2 px-3 text-xs">More like this</button>
                </>
              ) : (
                <>
                  <button className="btn-twin btn-twin-primary flex-1 py-2 text-xs">Review Details</button>
                  <button className="btn-twin btn-twin-ghost flex-1 py-2 text-xs">Decline</button>
                </>
              )}
            </div>

            {/* Usage hint */}
            <p className="text-[9px] text-muted-foreground/40 text-center">
              {mission.type === 'passive' ? 'View consumes 1 usage' : 'Accept locks 1 usage'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
