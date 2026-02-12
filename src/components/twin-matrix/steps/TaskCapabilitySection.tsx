import { Checkbox } from '@/components/ui/checkbox';

const CAPABILITIES: Record<string, string[]> = {
  Discovery: ['Event', 'Competition', 'Limited Drop', 'New Release', 'Nearby Experience', 'Early Access Opportunity', 'Beta Opportunity', 'Sponsored Opportunity'],
  Commerce: ['Product Purchase', 'Discount Match', 'Bundle Offer', 'Subscription', 'Trial Offer', 'Marketplace Bid', 'NFT / Digital Asset Purchase', 'Ticket Purchase'],
  Participation: ['Campaign Enrollment', 'Challenge Participation', 'Marathon Registration', 'Brand Activation', 'Community Event', 'Referral Program', 'Loyalty Program'],
  Contribution: ['Review Submission', 'Survey Completion', 'Content Post', 'Social Amplification', 'Beta Feedback', 'UGC Creation', 'Data Contribution'],
  Access: ['Membership Access', 'VIP Invite', 'Token-Gated Entry', 'Location Unlock', 'Ticket Claim', 'Private Event Access', 'Digital Collectible Claim'],
  Intelligence: ['Market Trend', 'Price Alert', 'Brand Activity', 'Competitor Watch', 'Community Sentiment', 'Signal Analytics'],
};

interface Props {
  capabilities: Record<string, string[]>;
  onUpdate: (caps: Record<string, string[]>) => void;
}

export const TaskCapabilitySection = ({ capabilities, onUpdate }: Props) => {
  const togglePrimary = (cap: string) => {
    const next = { ...capabilities };
    if (next[cap]) {
      delete next[cap];
    } else {
      next[cap] = [];
    }
    onUpdate(next);
  };

  const toggleSub = (cap: string, sub: string) => {
    const current = capabilities[cap] || [];
    const next = current.includes(sub)
      ? current.filter(s => s !== sub)
      : [...current, sub];
    onUpdate({ ...capabilities, [cap]: next });
  };

  return (
    <div className="glass-card space-y-4">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Task Capability</h3>

      <div className="space-y-2">
        {Object.keys(CAPABILITIES).map(cap => {
          const isActive = cap in capabilities;
          return (
            <div key={cap}>
              <button
                onClick={() => togglePrimary(cap)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all ${
                  isActive
                    ? 'bg-foreground/12 border border-foreground/15 text-foreground'
                    : 'bg-foreground/4 border border-foreground/6 text-muted-foreground hover:border-foreground/12 hover:bg-foreground/6'
                }`}
              >
                <div className={`w-2 h-2 rounded-full transition-all ${
                  isActive ? 'bg-[rgba(40,180,160,0.7)] shadow-[0_0_6px_rgba(40,180,160,0.4)]' : 'bg-foreground/15'
                }`} />
                <span className="font-medium">{cap}</span>
              </button>

              {isActive && (
                <div className="mt-1.5 ml-4 flex flex-wrap gap-1.5 animate-fade-in pb-1">
                  {CAPABILITIES[cap].map(sub => {
                    const selected = (capabilities[cap] || []).includes(sub);
                    return (
                      <button
                        key={sub}
                        onClick={() => toggleSub(cap, sub)}
                        className={`text-[10px] px-2.5 py-1 rounded-lg transition-all ${
                          selected
                            ? 'bg-foreground/15 text-foreground border border-foreground/18'
                            : 'bg-foreground/4 text-muted-foreground border border-foreground/6 hover:border-foreground/12'
                        }`}
                      >
                        {sub}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
