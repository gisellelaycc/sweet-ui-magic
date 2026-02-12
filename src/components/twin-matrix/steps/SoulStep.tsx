import { useState, useCallback, useEffect, useRef } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
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
    // Pick defaults based on sentence hash
    const hash = sentence.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const start = hash % DEFAULT_TAGS.length;
    return [
      DEFAULT_TAGS[start % DEFAULT_TAGS.length],
      DEFAULT_TAGS[(start + 1) % DEFAULT_TAGS.length],
      DEFAULT_TAGS[(start + 2) % DEFAULT_TAGS.length],
    ];
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
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const generateTags = useCallback((sentence: string) => {
    const tags = extractTags(sentence);
    const next = { ...soul, sentence, tags, confirmed: true };
    setSoul(next);
    onUpdate(next);
  }, [soul, onUpdate]);

  const updateSentence = (s: string) => {
    const next = { ...soul, sentence: s, tags: [], confirmed: false };
    setSoul(next);
    onUpdate(next);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && soul.sentence.trim().length > 5) {
      e.preventDefault();
      if (debounceRef.current) clearTimeout(debounceRef.current);
      generateTags(soul.sentence);
    }
  };

  const removeTag = (t: string) => {
    const next = { ...soul, tags: soul.tags.filter(x => x !== t), confirmed: false };
    setSoul(next);
    onUpdate(next);
  };

  const regenerate = () => {
    // Shuffle defaults differently
    const shuffled = [...DEFAULT_TAGS].sort(() => Math.random() - 0.5).slice(0, 3);
    const keywordTags = extractTags(soul.sentence);
    const tags = keywordTags.length > 0 && keywordTags[0] !== DEFAULT_TAGS[0] ? keywordTags : shuffled;
    const next = { ...soul, tags, confirmed: false };
    setSoul(next);
    onUpdate(next);
  };

  const confirmTags = () => {
    const next = { ...soul, confirmed: true };
    setSoul(next);
    onUpdate(next);
  };

  const canConfirm = soul.tags.length > 0 && !soul.confirmed;
  const canProceed = soul.confirmed && soul.tags.length > 0;
  const showEnterHint = soul.sentence.trim().length > 5 && soul.tags.length === 0;

  return (
    <div className="animate-fade-in space-y-6 max-w-lg mx-auto">
      <div>
        <h2 className="text-2xl font-bold mb-1">Define Your Motivation</h2>
        <p className="text-muted-foreground text-sm">Describe in one sentence why you do this.</p>
      </div>

      <div className="glass-card space-y-5">
        <div className="space-y-3">
          <label className="text-sm text-muted-foreground">Your motivation in one sentence</label>
          <div className="relative">
            <input
              type="text"
              value={soul.sentence}
              onChange={e => updateSentence(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. I run to become a better version of myself"
              maxLength={120}
              className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3.5 pr-14 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/25 transition-colors text-sm"
            />
            <button
              onClick={() => { if (soul.sentence.trim().length > 5) { if (debounceRef.current) clearTimeout(debounceRef.current); generateTags(soul.sentence); } }}
              disabled={soul.sentence.trim().length <= 5}
              className={`absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                soul.sentence.trim().length > 5
                  ? 'bg-foreground/15 text-foreground hover:bg-foreground/25 cursor-pointer'
                  : 'text-muted-foreground/20 cursor-not-allowed'
              }`}
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <span className="text-[10px] text-muted-foreground/40 block text-right">{soul.sentence.length}/120</span>
        </div>

        {soul.tags.length > 0 && (
          <div className="space-y-3 animate-fade-in">
            <label className="text-sm text-muted-foreground">Your tags — tap to remove</label>
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
            <button onClick={regenerate} className="btn-twin btn-twin-ghost w-full py-2 text-xs">
              Regenerate
            </button>
          </div>
        )}
      </div>

      <button onClick={onNext} disabled={!canProceed} className={`btn-twin btn-twin-primary w-full py-3 disabled:opacity-30 disabled:cursor-not-allowed ${canProceed ? 'btn-glow' : ''}`}>
        Mint My Identity
      </button>
    </div>
  );
};
