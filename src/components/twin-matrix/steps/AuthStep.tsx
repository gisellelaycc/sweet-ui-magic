import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import type { AgentSetup, AgentDefinition, AgentPermission } from '@/types/twin-matrix';
import { TaskCapabilitySection } from './TaskCapabilitySection';

const MATCH_STRATEGIES = ['Based on Skill', 'Based on Brand', 'Based on Soul', 'Based on Core'];
const BEHAVIOR_MODES = [
  { value: 'Active search', desc: 'Agent actively searches for matching tasks' },
  { value: 'Passive receive only', desc: 'Only receives system-dispatched tasks' },
  { value: 'High-value only', desc: 'Only processes high-value tasks' },
];
const IDENTITY_SCOPES = ['Core', 'Skill', 'Soul', 'Full Identity'];
const TRADING_OPTIONS = ['Manual Only', 'Auto-Approve under threshold', 'Full Auto'];
const DURATION_OPTIONS = ['7 days', '30 days', 'Custom'];
const RISK_CONTROLS = [
  { key: 'pauseCap', label: 'Pause when daily cap reached' },
  { key: 'switchManual', label: 'Switch to Manual after cap reached' },
  { key: 'restrictTask', label: 'Restrict to selected task types' },
  { key: 'restrictBrand', label: 'Restrict to approved brands' },
];

const defaultAgent: AgentDefinition = { name: '', taskTypes: [], matchingStrategy: [], behaviorMode: 'Active search', capabilities: {} };
const defaultPermission: AgentPermission = {
  identityScope: 'Core', identityScopes: ['Core'], tradingAuthority: 'Manual Only',
  authorizationDuration: '', customDurationDays: '',
  maxPerTask: '', dailyCap: '', weeklyCap: '', spendResetPolicy: [], taskTypeBound: false, brandRestriction: false,
};

interface AgentCard {
  id: number;
  agent: AgentDefinition;
  permission: AgentPermission;
  saved: boolean;
  collapsed: boolean;
  fullAutoConfirm: boolean;
}

interface Props {
  data: AgentSetup;
  onUpdate: (d: AgentSetup) => void;
  onNext: () => void;
}

export const AuthStep = ({ data, onUpdate, onNext }: Props) => {
  const [agents, setAgents] = useState<AgentCard[]>([
    { id: 1, agent: data.agent, permission: data.permission, saved: false, collapsed: false, fullAutoConfirm: false },
  ]);
  const [nextId, setNextId] = useState(2);

  const updateAgent = (id: number, patch: Partial<AgentCard>) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, ...patch, saved: false } : a));
  };

  const saveAgent = (card: AgentCard) => {
    setAgents(prev => prev.map(a => a.id === card.id ? { ...a, saved: true } : a));
    if (card.id === agents[0]?.id) {
      onUpdate({ agent: card.agent, permission: card.permission });
    }
  };

  const addAgent = () => {
    setAgents(prev => [...prev, { id: nextId, agent: { ...defaultAgent }, permission: { ...defaultPermission, identityScopes: ['Core'] }, saved: false, collapsed: false, fullAutoConfirm: false }]);
    setNextId(n => n + 1);
  };

  const removeAgent = (id: number) => {
    if (agents.length <= 1) return;
    setAgents(prev => prev.filter(a => a.id !== id));
  };

  const toggleArrayItem = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];

  const allSaved = agents.every(a => a.saved);

  const handleSkip = () => {
    // Skip without validation — agent not configured
    onNext();
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-3xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-1">Agent Studio</h2>
        <p className="text-muted-foreground text-sm">Define your agent's behavior and permissions.</p>
      </div>

      <button onClick={addAgent} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <Plus className="w-3.5 h-3.5" /> Add Agent
      </button>

      {agents.map(card => {
        const needsThreshold = card.permission.tradingAuthority === 'Auto-Approve under threshold';
        const isFullAuto = card.permission.tradingAuthority === 'Full Auto';
        const canSave = card.agent.name.trim().length > 0 && (!isFullAuto || card.fullAutoConfirm);
        const isCustomDuration = card.permission.authorizationDuration === 'Custom';

        return (
          <div key={card.id} className="glass-card space-y-4">
            {/* Card Header */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => updateAgent(card.id, { collapsed: !card.collapsed })}
                className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                {card.collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                {card.agent.name || `Agent #${card.id}`}
                {card.saved && <span className="text-[9px] text-green-400 ml-1">● Saved</span>}
              </button>
              {agents.length > 1 && (
                <button onClick={() => removeAgent(card.id)} className="text-muted-foreground/50 hover:text-destructive transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {!card.collapsed && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* LEFT — Behavior Builder */}
                <div className="space-y-4">
                  <div className="space-y-5">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Behavior Builder</h3>

                    {/* Agent Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">Agent Name</label>
                      <input
                        type="text"
                        value={card.agent.name}
                        onChange={e => updateAgent(card.id, { agent: { ...card.agent, name: e.target.value } })}
                        placeholder="e.g. Sport Product Scout"
                        className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/25 transition-colors"
                      />
                    </div>

                    {/* Behavior Mode */}
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Behavior Mode</label>
                      <div className="space-y-1.5">
                        {BEHAVIOR_MODES.map(m => (
                          <label key={m.value} className="flex items-start gap-2 text-sm cursor-pointer">
                            <input
                              type="radio"
                              name={`behavior-${card.id}`}
                              checked={card.agent.behaviorMode === m.value}
                              onChange={() => updateAgent(card.id, { agent: { ...card.agent, behaviorMode: m.value } })}
                              className="accent-foreground mt-0.5"
                            />
                            <div>
                              <span className="text-foreground/80">{m.value}</span>
                              <p className="text-[10px] text-muted-foreground/50">{m.desc}</p>
                            </div>
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
                              checked={card.agent.matchingStrategy.includes(s)}
                              onCheckedChange={() => updateAgent(card.id, { agent: { ...card.agent, matchingStrategy: toggleArrayItem(card.agent.matchingStrategy, s) } })}
                            />
                            <span className="text-foreground/80">{s}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Task Capability */}
                  <TaskCapabilitySection
                    capabilities={card.agent.capabilities || {}}
                    onUpdate={(caps) => updateAgent(card.id, { agent: { ...card.agent, capabilities: caps } })}
                  />

                  <p className="text-[10px] text-muted-foreground/40 leading-relaxed">
                    + You can create multiple agents for different responsibilities. Each agent can specialize in a different capability scope.
                  </p>
                </div>

                {/* RIGHT — Permission & Autonomy */}
                <div className="space-y-5">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Permission & Autonomy</h3>

                  {/* Identity Scope — Multi-select */}
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Identity Scope</label>
                    <p className="text-[10px] text-muted-foreground/50">Grants structured summary access only — no raw values exposed.</p>
                    <div className="flex flex-wrap gap-1.5">
                      {IDENTITY_SCOPES.map(s => {
                        const scopes = card.permission.identityScopes || [card.permission.identityScope];
                        const selected = scopes.includes(s);
                        return (
                          <button
                            key={s}
                            onClick={() => {
                              const next = selected ? scopes.filter(x => x !== s) : [...scopes, s];
                              updateAgent(card.id, { permission: { ...card.permission, identityScopes: next, identityScope: next[0] || '' } });
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
                            name={`trading-${card.id}`}
                            checked={card.permission.tradingAuthority === t}
                            onChange={() => {
                              updateAgent(card.id, {
                                permission: { ...card.permission, tradingAuthority: t },
                                fullAutoConfirm: t === 'Full Auto' ? false : card.fullAutoConfirm,
                              });
                            }}
                            className="accent-foreground"
                          />
                          <span className="text-foreground/80">{t}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Authorization Duration */}
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Authorization Duration</label>
                    <div className="space-y-1.5">
                      {DURATION_OPTIONS.map(d => (
                        <label key={d} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="radio"
                            name={`duration-${card.id}`}
                            checked={card.permission.authorizationDuration === d}
                            onChange={() => updateAgent(card.id, { permission: { ...card.permission, authorizationDuration: d, customDurationDays: d === 'Custom' ? card.permission.customDurationDays : '' } })}
                            className="accent-foreground"
                          />
                          <span className="text-foreground/80">{d}</span>
                        </label>
                      ))}
                    </div>
                    {isCustomDuration && (
                      <div className="animate-fade-in flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-muted-foreground w-24">Duration (days)</span>
                        <input
                          type="number"
                          min="1"
                          value={card.permission.customDurationDays}
                          onChange={e => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            updateAgent(card.id, { permission: { ...card.permission, customDurationDays: val } });
                          }}
                          placeholder="Enter number of days"
                          className="flex-1 bg-foreground/5 border border-foreground/10 rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-foreground/25"
                        />
                      </div>
                    )}
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
                            value={card.permission[field]}
                            onChange={e => updateAgent(card.id, { permission: { ...card.permission, [field]: e.target.value } })}
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
                        <Checkbox checked={card.fullAutoConfirm} onCheckedChange={() => updateAgent(card.id, { fullAutoConfirm: !card.fullAutoConfirm })} />
                        <span className="text-foreground/80">I understand the risk</span>
                      </label>
                    </div>
                  )}

                  {/* Risk Controls */}
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Risk Controls</label>
                    <p className="text-[10px] text-muted-foreground/50">These controls help reduce financial and operational exposure.</p>
                    <div className="space-y-1.5">
                      {RISK_CONTROLS.map(rc => {
                        const checked = card.permission.spendResetPolicy.includes(rc.key);
                        return (
                          <label key={rc.key} className="flex items-center gap-2 text-[11px] cursor-pointer">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={() => updateAgent(card.id, { permission: { ...card.permission, spendResetPolicy: toggleArrayItem(card.permission.spendResetPolicy, rc.key) } })}
                            />
                            <span className="text-foreground/70">{rc.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save / Skip */}
            {!card.collapsed && (
              <div className="flex gap-2">
                <button
                  onClick={() => saveAgent(card)}
                  disabled={!canSave}
                  className={`flex-1 py-2.5 text-sm rounded-xl transition-all ${
                    card.saved
                      ? 'bg-foreground/5 text-green-400 border border-green-400/20'
                      : 'btn-twin btn-twin-primary btn-glow disabled:opacity-30 disabled:cursor-not-allowed'
                  }`}
                >
                  {card.saved ? 'Agent Saved ✓' : 'Save Agent'}
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Bottom Actions */}
      <div className="flex gap-3">
        <button onClick={handleSkip} className="btn-twin btn-twin-ghost flex-1 py-3">
          Skip for now
        </button>
        {allSaved && agents.length > 0 && (
          <button onClick={onNext} className="btn-twin btn-twin-primary flex-1 py-3 btn-glow animate-fade-in">
            Continue →
          </button>
        )}
      </div>
    </div>
  );
};
