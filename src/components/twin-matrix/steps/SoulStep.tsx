import { useState, useCallback } from 'react';
import type { SoulData } from '@/types/twin-matrix';

const MOTIVATION_KEYWORDS: Record<string, string[]> = {
  'better': ['Self-improvement', 'Growth'],
  'strong': ['Strength', 'Resilience'],
  'stress': ['Stress Relief', 'Balance'],
  'free': ['Freedom', 'Liberation'],
  'fun': ['Joy', 'Playfulness'],
  'health': ['Wellness', 'Longevity'],
  'compete': ['Competition', 'Achievement'],
  'team': ['Community', 'Connection'],
  'peace': ['Mindfulness', 'Calm'],
  'push': ['Discipline', 'Perseverance'],
  'challenge': ['Adventure', 'Breakthrough'],
  'focus': ['Clarity', 'Concentration'],
};

const DEFAULT_TAGS = ['Discipline', 'Growth', 'Balance', 'Passion', 'Healing', 'Adventure', 'Perseverance', 'Freedom'];

function extractTags(sentence: string): string[] {
  const lower = sentence.toLowerCase();
  const found = new Set<string>();
  for (const [keyword, tags] of Object.entries(MOTIVATION_KEYWORDS)) {
    if (lower.includes(keyword)) {
      tags.forEach(t => found.add(t));
    }
  }
  if (found.size === 0) {
    // Return some defaults based on sentence length
    return DEFAULT_TAGS.slice(0, 3);
  }
  return Array.from(found).slice(0, 6);
}

interface Props {
  data: SoulData;
  onUpdate: (d: SoulData) => void;
  onNext: () => void;
}

export const SoulStep = ({ data, onUpdate, onNext }: Props) => {
  const [soul, setSoul] = useState(data);
  const [generated, setGenerated] = useState(false);

  const updateSentence = (s: string) => {
    const next = { ...soul, sentence: s, confirmed: false };
    setSoul(next);
    onUpdate(next);
    setGenerated(false);
  };

  const generateTags = useCallback(() => {
    const tags = extractTags(soul.sentence);
    const next = { ...soul, tags, confirmed: false };
    setSoul(next);
    onUpdate(next);
    setGenerated(true);
  }, [soul, onUpdate]);

  const removeTag = (t: string) => {
    const next = { ...soul, tags: soul.tags.filter(x => x !== t), confirmed: false };
    setSoul(next);
    onUpdate(next);
  };

  const confirmTags = () => {
    const next = { ...soul, confirmed: true };
    setSoul(next);
    onUpdate(next);
  };

  const canGenerate = soul.sentence.trim().length > 5;
  const canConfirm = soul.tags.length > 0 && !soul.confirmed;
  const canProceed = soul.confirmed && soul.tags.length > 0;

  return (
    <div className="animate-fade-in space-y-6 max-w-lg mx-auto">
      <div>
        <h2 className="text-2xl font-bold mb-1">Define Your Motivation</h2>
        <p className="text-muted-foreground text-sm">Describe in one sentence why you do this.</p>
      </div>

      <div className="glass-card space-y-5">
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Your motivation in one sentence</label>
          <textarea
            value={soul.sentence}
            onChange={e => updateSentence(e.target.value)}
            placeholder="e.g. I run to become a better version of myself"
            maxLength={120}
            rows={3}
            className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/25 transition-colors resize-none"
          />
          <p className="text-xs text-muted-foreground/50 text-right">{soul.sentence.length}/120</p>
        </div>

        {canGenerate && !generated && (
          <button onClick={generateTags} className="btn-twin btn-twin-ghost w-full py-2.5 text-sm">
            Extract Motivation Tags
          </button>
        )}

        {generated && soul.tags.length > 0 && (
          <div className="space-y-3 animate-fade-in">
            <label className="text-sm text-muted-foreground">Extracted Tags — remove any that don't fit</label>
            <div className="flex flex-wrap gap-2">
              {soul.tags.map(t => (
                <button
                  key={t}
                  onClick={() => removeTag(t)}
                  className="chip text-sm !bg-foreground/15 !border-foreground/30 !text-foreground group"
                >
                  #{t}
                  <span className="ml-1 text-xs opacity-50 group-hover:opacity-100">×</span>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={generateTags} className="btn-twin btn-twin-ghost flex-1 py-2 text-xs">
                Regenerate
              </button>
              {canConfirm && (
                <button onClick={confirmTags} className="btn-twin btn-twin-primary flex-1 py-2 text-xs">
                  Confirm Tags ✓
                </button>
              )}
            </div>
            {soul.confirmed && (
              <p className="text-xs text-green-400 text-center">✓ Tags confirmed</p>
            )}
          </div>
        )}
      </div>

      <button onClick={onNext} disabled={!canProceed} className="btn-twin btn-twin-primary w-full py-3 disabled:opacity-30 disabled:cursor-not-allowed">
        Forge My Identity
      </button>
    </div>
  );
};
