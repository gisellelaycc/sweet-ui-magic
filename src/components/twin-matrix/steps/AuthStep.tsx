import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import type { AgentSetup } from '@/types/twin-matrix';
import { TaskCapabilitySection } from './TaskCapabilitySection';

const TASK_TYPES = ['Campaign', 'Product', 'Marathon', 'Location', 'Task'];
const MATCH_STRATEGIES = ['Based on Skill', 'Based on Brand', 'Based on Soul', 'Based on Core'];
const BEHAVIOR_MODES = ['Active search', 'Passive receive only', 'High-value only'];
const IDENTITY_SCOPES = ['Core', 'Skill', 'Soul', 'Full Identity'];
const TRADING_OPTIONS = ['Manual Only', 'Auto-Approve under threshold', 'Full Auto'];
const SPEND_RESET_OPTIONS = ['Pause when daily cap reached', 'Auto-switch to Manual Mode'];

interface Props {
  data: AgentSetup;
  onUpdate: (d: AgentSetup) => void;
  onNext: () => void;
}

export const AuthStep = ({ data, onUpdate, onNext }: Props) => {
  const [setup, setSetup] = useState<AgentSetup>(data);
  const [confirmed, setConfirmed] = useState(false);
  const [fullAutoConfirm, setFullAutoConfirm] = useState(false);

  const update = (next: AgentSetup) => {
    setSetup(next);
    onUpdate(next);
    setConfirmed(false);
  };

  const toggleArrayItem = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];

  const needsThreshold = setup.permission.tradingAuthority === 'Auto-Approve under threshold';
  const isFullAuto = setup.permission.tradingAuthority === 'Full Auto';
  const canConfirm = setup.agent.name.trim().length > 0 && setup.agent.taskTypes.length > 0;

  return (
    <div className="animate-fade-in space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-1">Agent Studio</h2>
        <p className="text-muted-foreground text-sm">Define your agent's behavior and permissions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* LEFT — Agent Definition */}
        <div className="space-y-4">
          <div className="glass-card space-y-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Behavior Builder</h3>

            {/* Agent Name */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Agent Name</label>
              <input
                type="text"
                value={setup.agent.name}
                onChange={e => update({ ...setup, agent: { ...setup.agent, name: e.target.value } })}
                placeholder="e.g. Sport Product Scout"
                className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/25 transition-colors"
              />
            </div>

            {/* Task Types */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Task Types</label>
              <div className="space-y-1.5">
                {TASK_TYPES.map(t => (
                  <label key={t} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={setup.agent.taskTypes.includes(t)}
                      onCheckedChange={() => update({ ...setup, agent: { ...setup.agent, taskTypes: toggleArrayItem(setup.agent.taskTypes, t) } })}
                    />
                    <span className="text-foreground/80">{t}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Matching Strategy */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Matching Strategy</label>
              <div className="space-y-1.5">
                {MATCH_STRATEGIES.map(s => (
                  <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={setup.agent.matchingStrategy.includes(s)}
                      onCheckedChange={() => update({ ...setup, agent: { ...setup.agent, matchingStrategy: toggleArrayItem(setup.agent.matchingStrategy, s) } })}
                    />
                    <span className="text-foreground/80">{s}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Behavior Mode */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Behavior Mode</label>
              <div className="space-y-1.5">
                {BEHAVIOR_MODES.map(m => (
                  <label key={m} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="behavior"
                      checked={setup.agent.behaviorMode === m}
                      onChange={() => update({ ...setup, agent: { ...setup.agent, behaviorMode: m } })}
                      className="accent-foreground"
                    />
                    <span className="text-foreground/80">{m}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Task Capability */}
          <TaskCapabilitySection
            capabilities={setup.agent.capabilities || {}}
            onUpdate={(caps) => update({ ...setup, agent: { ...setup.agent, capabilities: caps } })}
          />
        </div>

        {/* RIGHT — Permission + Autonomy */}
        <div className="glass-card space-y-5">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Permission & Autonomy</h3>

          {/* Identity Scope — Multi-select */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Identity Scope</label>
            <p className="text-[10px] text-muted-foreground/50">Grants structured summary access only — no raw values exposed.</p>
            <div className="flex flex-wrap gap-1.5">
              {IDENTITY_SCOPES.map(s => {
                const selected = (setup.permission.identityScopes || [setup.permission.identityScope]).includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => {
                      const current = setup.permission.identityScopes || [setup.permission.identityScope];
                      const next = selected ? current.filter(x => x !== s) : [...current, s];
                      update({ ...setup, permission: { ...setup.permission, identityScopes: next, identityScope: next[0] || '' } });
                    }}
                    className={`text-[11px] px-3 py-1.5 rounded-lg transition-all ${
                      selected
                        ? 'bg-foreground/20 text-foreground border border-foreground/20'
                        : 'bg-foreground/5 text-muted-foreground border border-foreground/5 hover:border-foreground/15'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Trading Authority */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Trading Authority</label>
            <div className="space-y-1.5">
              {TRADING_OPTIONS.map(t => (
                <label key={t} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="trading"
                    checked={setup.permission.tradingAuthority === t}
                    onChange={() => {
                      const next = { ...setup, permission: { ...setup.permission, tradingAuthority: t } };
                      if (t !== 'Full Auto') setFullAutoConfirm(false);
                      update(next);
                    }}
                    className="accent-foreground"
                  />
                  <span className="text-foreground/80">{t}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Threshold inputs */}
          {needsThreshold && (
            <div className="space-y-2 animate-fade-in">
              {(['maxPerTask', 'dailyCap', 'weeklyCap'] as const).map(field => (
                <div key={field} className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground w-24">
                    {field === 'maxPerTask' ? 'Max/task' : field === 'dailyCap' ? 'Daily cap' : 'Weekly cap'}
                  </span>
                  <input
                    type="text"
                    value={setup.permission[field]}
                    onChange={e => update({ ...setup, permission: { ...setup.permission, [field]: e.target.value } })}
                    placeholder="$"
                    className="flex-1 bg-foreground/5 border border-foreground/10 rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-foreground/25"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Full Auto confirmation */}
          {isFullAuto && (
            <div className="animate-fade-in p-3 rounded-xl border border-destructive/30 bg-destructive/5 space-y-2">
              <p className="text-xs text-destructive">⚠ Full Auto grants unrestricted trading authority. Confirm to proceed.</p>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <Checkbox checked={fullAutoConfirm} onCheckedChange={() => setFullAutoConfirm(!fullAutoConfirm)} />
                <span className="text-foreground/80">I understand the risk</span>
              </label>
            </div>
          )}

          {/* Risk Controls */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Risk Controls</label>
            <div className="space-y-1.5">
              {SPEND_RESET_OPTIONS.map(o => (
                <label key={o} className="flex items-center gap-2 text-[11px] cursor-pointer">
                  <Checkbox
                    checked={setup.permission.spendResetPolicy.includes(o)}
                    onCheckedChange={() => update({ ...setup, permission: { ...setup.permission, spendResetPolicy: toggleArrayItem(setup.permission.spendResetPolicy, o) } })}
                  />
                  <span className="text-foreground/70">{o}</span>
                </label>
              ))}
              <label className="flex items-center gap-2 text-[11px] cursor-pointer">
                <Checkbox
                  checked={setup.permission.taskTypeBound}
                  onCheckedChange={() => update({ ...setup, permission: { ...setup.permission, taskTypeBound: !setup.permission.taskTypeBound } })}
                />
                <span className="text-foreground/70">Task-Type Bound Autonomy</span>
              </label>
              <label className="flex items-center gap-2 text-[11px] cursor-pointer">
                <Checkbox
                  checked={setup.permission.brandRestriction}
                  onCheckedChange={() => update({ ...setup, permission: { ...setup.permission, brandRestriction: !setup.permission.brandRestriction } })}
                />
                <span className="text-foreground/70">Brand Restriction</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {!confirmed ? (
        <button
          onClick={() => { onUpdate(setup); setConfirmed(true); }}
          disabled={!canConfirm || (isFullAuto && !fullAutoConfirm)}
          className="btn-twin btn-twin-primary w-full py-3 btn-glow disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Mint Agent ✓
        </button>
      ) : (
        <button onClick={onNext} className="btn-twin btn-twin-primary w-full py-3 btn-glow animate-fade-in">
          Continue →
        </button>
      )}
    </div>
  );
};
