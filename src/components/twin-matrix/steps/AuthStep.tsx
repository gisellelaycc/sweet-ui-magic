import { useState, useEffect, useRef, useCallback } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import type { AgentSetup, AgentDefinition, AgentPermission } from '@/types/twin-matrix';
import { TaskCapabilitySection } from './TaskCapabilitySection';
import lobsterIcon from '@/assets/lobster-icon.png';

/* ── Saved Agent Record ── */
interface SavedAgent {
  id: string;
  name: string;
  status: 'DRAFT' | 'ACTIVE';
  agent: AgentDefinition;
  permission: AgentPermission;
  telegramConnected: boolean;
}

/* ── Particle Canvas (lobster silhouette) ── */
const LOBSTER_PIXELS = [
  [6,1],[7,1],[9,1],[10,1],
  [5,2],[6,2],[8,2],[9,2],[10,2],[11,2],
  [4,3],[5,3],[6,3],[7,3],[8,3],[9,3],[10,3],[11,3],
  [3,4],[4,4],[5,4],[6,4],[7,4],[8,4],[9,4],[10,4],[11,4],[12,4],
  [4,5],[5,5],[6,5],[7,5],[8,5],[9,5],[10,5],[11,5],
  [5,6],[6,6],[7,6],[8,6],[9,6],[10,6],
  [4,7],[5,7],[6,7],[7,7],[8,7],[9,7],[10,7],[11,7],
  [3,8],[4,8],[5,8],[6,8],[7,8],[8,8],[9,8],[10,8],[11,8],[12,8],
  [2,9],[3,9],[5,9],[6,9],[7,9],[8,9],[9,9],[10,9],[12,9],[13,9],
  [1,10],[2,10],[6,10],[7,10],[8,10],[9,10],[13,10],[14,10],
  [5,11],[6,11],[7,11],[8,11],[9,11],[10,11],
  [4,12],[5,12],[7,12],[8,12],[10,12],[11,12],
  [3,13],[4,13],[11,13],[12,13],
];

interface Particle {
  x: number; y: number;
  tx: number; ty: number;
  ox: number; oy: number;
  size: number;
  opacity: number;
}

const ParticleCanvas = ({ width, height }: { width: number; height: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const timerRef = useRef(0);

  const initParticles = useCallback(() => {
    const scale = Math.min(width, height) * 0.018;
    // Random corner for gathering
    const corners = [
      { x: width * 0.15, y: height * 0.15 },
      { x: width * 0.8, y: height * 0.15 },
      { x: width * 0.15, y: height * 0.8 },
      { x: width * 0.8, y: height * 0.75 },
    ];
    const corner = corners[Math.floor(Math.random() * corners.length)];

    const particles: Particle[] = LOBSTER_PIXELS.map(([px, py]) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      tx: corner.x + px * scale,
      ty: corner.y + py * scale,
      ox: Math.random() * width,
      oy: Math.random() * height,
      size: 1.2 + Math.random() * 1.2,
      opacity: 0.15 + Math.random() * 0.25,
    }));

    for (let i = 0; i < 40; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      particles.push({ x, y, tx: x, ty: y, ox: x, oy: y, size: 0.5 + Math.random() * 0.8, opacity: 0.05 + Math.random() * 0.1 });
    }

    particlesRef.current = particles;
    timerRef.current = 0;
  }, [width, height]);

  useEffect(() => {
    if (!width || !height) return;
    initParticles();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    const GATHER = 180, HOLD = 120, SCATTER = 180;
    const TOTAL = GATHER + HOLD + SCATTER;

    const animate = () => {
      timerRef.current++;
      const t = timerRef.current % TOTAL;
      ctx.clearRect(0, 0, width, height);

      for (const p of particlesRef.current) {
        if (t < GATHER) {
          const ease = (t / GATHER) ** 2 * (3 - 2 * (t / GATHER));
          p.x = p.ox + (p.tx - p.ox) * ease;
          p.y = p.oy + (p.ty - p.oy) * ease;
        } else if (t < GATHER + HOLD) {
          p.x = p.tx + Math.sin(timerRef.current * 0.02 + p.tx) * 0.5;
          p.y = p.ty + Math.cos(timerRef.current * 0.02 + p.ty) * 0.5;
        } else {
          const progress = ((t - GATHER - HOLD) / SCATTER) ** 2;
          const nx = p.ox + (Math.random() - 0.5) * 40;
          const ny = p.oy + (Math.random() - 0.5) * 40;
          p.x = p.tx + (nx - p.tx) * progress;
          p.y = p.ty + (ny - p.ty) * progress;
          if (t === TOTAL - 1) { p.ox = p.x; p.oy = p.y; }
        }

        const phase = t < GATHER ? 'gather' : t < GATHER + HOLD ? 'hold' : 'scatter';
        const glowOpacity = phase === 'hold' ? p.opacity * 1.5 : p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(54, 230, 255, ${glowOpacity})`;
        ctx.fill();
        if (phase === 'hold') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(54, 230, 255, ${glowOpacity * 0.15})`;
          ctx.fill();
        }
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [width, height, initParticles]);

  return <canvas ref={canvasRef} width={width} height={height} className="absolute inset-0 pointer-events-none" style={{ opacity: 0.5 }} />;
};

/* ── Constants ── */
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

type SubStep = 'list' | 'create' | 'config' | 'telegram' | 'activated';

interface Props {
  data: AgentSetup;
  onUpdate: (d: AgentSetup) => void;
  onNext: () => void;
  onDashboard: () => void;
}

export const AuthStep = ({ data, onUpdate, onNext, onDashboard }: Props) => {
  const [savedAgents, setSavedAgents] = useState<SavedAgent[]>([]);
  const [subStep, setSubStep] = useState<SubStep>('create');
  const [agentName, setAgentName] = useState('');
  const [currentAgentId, setCurrentAgentId] = useState<string | null>(null);
  const [agent, setAgent] = useState<AgentDefinition>({ ...defaultAgent });
  const [permission, setPermission] = useState<AgentPermission>({ ...defaultPermission, identityScopes: ['Core'] });
  const [fullAutoConfirm, setFullAutoConfirm] = useState(false);
  const [telegramConnected, setTelegramConnected] = useState(false);
  const [viewingAgentId, setViewingAgentId] = useState<string | null>(null);

  // Particle canvas dimensions
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setDims({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const generateId = () => `agent-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const toggleArrayItem = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];

  /* ── Step A: Create Agent ── */
  const handleCreateAgent = () => {
    if (!agentName.trim()) return;
    const id = generateId();
    const newAgent: SavedAgent = {
      id, name: agentName.trim(), status: 'DRAFT',
      agent: { ...defaultAgent, name: agentName.trim() },
      permission: { ...defaultPermission, identityScopes: ['Core'] },
      telegramConnected: false,
    };
    setSavedAgents(prev => [...prev, newAgent]);
    setCurrentAgentId(id);
    setAgent({ ...defaultAgent, name: agentName.trim() });
    setPermission({ ...defaultPermission, identityScopes: ['Core'] });
    setFullAutoConfirm(false);
    setTelegramConnected(false);
    setSubStep('config');
  };

  /* ── Step B: Save Config ── */
  const handleSaveConfig = () => {
    if (!currentAgentId) return;
    setSavedAgents(prev => prev.map(a =>
      a.id === currentAgentId ? { ...a, agent: { ...agent }, permission: { ...permission } } : a
    ));
    onUpdate({ agent, permission });
    setSubStep('telegram');
  };

  /* ── Step C: Connect Telegram ── */
  const handleConnectTelegram = () => {
    setTelegramConnected(true);
    if (currentAgentId) {
      setSavedAgents(prev => prev.map(a =>
        a.id === currentAgentId ? { ...a, status: 'ACTIVE', telegramConnected: true } : a
      ));
    }
    setTimeout(() => setSubStep('activated'), 600);
  };

  /* ── Step D: Activated → actions ── */
  const handleCreateAnother = () => {
    setAgentName('');
    setCurrentAgentId(null);
    setViewingAgentId(null);
    setSubStep('list');
  };

  const currentSavedAgent = currentAgentId ? savedAgents.find(a => a.id === currentAgentId) : null;
  const viewingAgent = viewingAgentId ? savedAgents.find(a => a.id === viewingAgentId) : null;

  const needsThreshold = permission.tradingAuthority === 'Auto-Approve under threshold';
  const isFullAuto = permission.tradingAuthority === 'Full Auto';
  const canSaveConfig = agent.name.trim().length > 0 && (!isFullAuto || fullAutoConfirm);
  const isCustomDuration = permission.authorizationDuration === 'Custom';

  return (
    <div ref={containerRef} className="relative animate-fade-in overflow-hidden min-h-[70vh]">
      {/* Particle lobster background */}
      {dims.w > 0 && <ParticleCanvas width={dims.w} height={dims.h} />}

      <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
        {/* Header — always visible */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-1">Activate an Agent</h2>
          <p className="text-muted-foreground text-sm">Let this identity act on your behalf.</p>
        </div>

        {/* ═══ Sub-step: LIST (shows saved agents + create new) ═══ */}
        {subStep === 'list' && (
          <div className="space-y-4 animate-fade-in">
            {savedAgents.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Your Agents</h3>
                {savedAgents.map(sa => (
                  <div key={sa.id} className="glass-card !p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={lobsterIcon} alt="" className="w-6 h-6" style={{
                        filter: 'brightness(0) saturate(100%) invert(78%) sepia(60%) saturate(1000%) hue-rotate(145deg) brightness(1.1)',
                        opacity: 0.6,
                      }} />
                      <div>
                        <p className="text-sm font-medium text-foreground">{sa.name}</p>
                        <p className="text-[10px] text-muted-foreground">ID: {sa.id.slice(0, 16)}…</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-medium ${sa.status === 'ACTIVE' ? 'text-[#36E6FF]' : 'text-muted-foreground'}`}>
                        ● {sa.status}
                      </span>
                      <button
                        onClick={() => setViewingAgentId(viewingAgentId === sa.id ? null : sa.id)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {viewingAgentId === sa.id ? 'Hide' : 'View'}
                      </button>
                    </div>
                  </div>
                ))}

                {/* Expanded view of selected agent */}
                {viewingAgent && (
                  <div className="glass-card !p-5 space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-foreground">{viewingAgent.name}</h4>
                      <span className={`text-[10px] ${viewingAgent.status === 'ACTIVE' ? 'text-[#36E6FF]' : 'text-muted-foreground'}`}>
                        ● {viewingAgent.status}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Behavior Mode</span>
                        <span className="text-foreground/70">{viewingAgent.agent.behaviorMode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Trading Authority</span>
                        <span className="text-foreground/70">{viewingAgent.permission.tradingAuthority}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Identity Scope</span>
                        <span className="text-foreground/70">{(viewingAgent.permission.identityScopes || [viewingAgent.permission.identityScope]).join(', ')}</span>
                      </div>
                      {viewingAgent.agent.matchingStrategy.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Matching</span>
                          <span className="text-foreground/70">{viewingAgent.agent.matchingStrategy.join(', ')}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Telegram</span>
                        <span className={viewingAgent.telegramConnected ? 'text-[#36E6FF]' : 'text-muted-foreground'}>
                          {viewingAgent.telegramConnected ? '✓ Connected' : 'Not connected'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => { setAgentName(''); setSubStep('create'); }}
              className="btn-twin btn-twin-primary btn-glow w-full py-3"
            >
              <Plus className="w-4 h-4" /> Create New Agent
            </button>
          </div>
        )}

        {/* ═══ Sub-step A: CREATE (name input) ═══ */}
        {subStep === 'create' && (
          <div className="space-y-6 animate-fade-in max-w-md mx-auto">
            {savedAgents.length > 0 && (
              <button
                onClick={() => setSubStep('list')}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                ← View existing agents ({savedAgents.length})
              </button>
            )}

            <div className="glass-card space-y-5">
              <div className="flex items-center gap-3">
                <img src={lobsterIcon} alt="" className="w-10 h-10" style={{
                  filter: 'brightness(0) saturate(100%) invert(78%) sepia(60%) saturate(1000%) hue-rotate(145deg) brightness(1.1)',
                  opacity: 0.5,
                }} />
                <div>
                  <h3 className="text-sm font-semibold">Name your agent</h3>
                  <p className="text-[10px] text-muted-foreground">Give your agent an identity.</p>
                </div>
              </div>

              <input
                type="text"
                value={agentName}
                onChange={e => setAgentName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateAgent()}
                placeholder="e.g. Lobster-01"
                className="w-full bg-foreground/5 border-none rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none transition-colors"
                style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.06) inset' }}
              />

              <button
                onClick={handleCreateAgent}
                disabled={!agentName.trim()}
                className={`btn-twin btn-twin-primary w-full py-3 disabled:opacity-30 disabled:cursor-not-allowed ${agentName.trim() ? 'btn-glow' : ''}`}
              >
                Create Agent
              </button>
            </div>
          </div>
        )}

        {/* ═══ Sub-step B: CONFIG ═══ */}
        {subStep === 'config' && (
          <div className="space-y-4 animate-fade-in">
            <div className="glass-card">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* LEFT — Behavior Builder */}
                <div className="space-y-5">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Behavior Builder</h3>

                  {/* Agent Name (readonly) */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Agent Name</label>
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-foreground/5 text-sm text-foreground" style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.06) inset' }}>
                      <img src={lobsterIcon} alt="" className="w-4 h-4" style={{ filter: 'brightness(0) saturate(100%) invert(78%) sepia(60%) saturate(1000%) hue-rotate(145deg) brightness(1.1)', opacity: 0.6 }} />
                      {agent.name}
                    </div>
                  </div>

                  {/* Behavior Mode */}
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Behavior Mode</label>
                    <div className="space-y-1.5">
                      {BEHAVIOR_MODES.map(m => (
                        <label key={m.value} className="flex items-start gap-2 text-sm cursor-pointer">
                          <input type="radio" checked={agent.behaviorMode === m.value} onChange={() => setAgent(a => ({ ...a, behaviorMode: m.value }))} className="accent-foreground mt-0.5" />
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
                    <div className="flex flex-wrap gap-1.5">
                      {MATCH_STRATEGIES.map(s => {
                        const selected = agent.matchingStrategy.includes(s);
                        return (
                          <button key={s} onClick={() => setAgent(a => ({ ...a, matchingStrategy: toggleArrayItem(a.matchingStrategy, s) }))}
                            className={`text-[11px] px-3 py-1.5 rounded-lg transition-all ${selected ? 'bg-foreground/20 text-foreground border border-foreground/20' : 'bg-foreground/5 text-muted-foreground border border-foreground/5 hover:border-foreground/15'}`}
                          >{s}</button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Task Capability */}
                  <TaskCapabilitySection capabilities={agent.capabilities || {}} onUpdate={caps => setAgent(a => ({ ...a, capabilities: caps }))} />
                </div>

                {/* RIGHT — Permission & Autonomy */}
                <div className="space-y-5">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Permission & Autonomy</h3>

                  {/* Identity Scope */}
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Identity Scope</label>
                    <p className="text-[10px] text-muted-foreground/50">Grants structured summary access only — no raw values exposed.</p>
                    <div className="flex flex-wrap gap-1.5">
                      {IDENTITY_SCOPES.map(s => {
                        const scopes = permission.identityScopes || [permission.identityScope];
                        const selected = scopes.includes(s);
                        return (
                          <button key={s} onClick={() => {
                            const next = selected ? scopes.filter(x => x !== s) : [...scopes, s];
                            setPermission(p => ({ ...p, identityScopes: next, identityScope: next[0] || '' }));
                          }}
                            className={`text-[11px] px-3 py-1.5 rounded-lg transition-all ${selected ? 'bg-foreground/20 text-foreground border border-foreground/20' : 'bg-foreground/5 text-muted-foreground border border-foreground/5 hover:border-foreground/15'}`}
                          >{s}</button>
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
                          <input type="radio" checked={permission.tradingAuthority === t} onChange={() => { setPermission(p => ({ ...p, tradingAuthority: t })); if (t !== 'Full Auto') setFullAutoConfirm(false); }} className="accent-foreground" />
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
                          <input type="radio" checked={permission.authorizationDuration === d} onChange={() => setPermission(p => ({ ...p, authorizationDuration: d, customDurationDays: d === 'Custom' ? p.customDurationDays : '' }))} className="accent-foreground" />
                          <span className="text-foreground/80">{d}</span>
                        </label>
                      ))}
                    </div>
                    {isCustomDuration && (
                      <div className="animate-fade-in flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-muted-foreground w-24">Duration (days)</span>
                        <input type="number" min="1" value={permission.customDurationDays}
                          onChange={e => setPermission(p => ({ ...p, customDurationDays: e.target.value.replace(/[^0-9]/g, '') }))}
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
                          <input type="text" value={permission[field]}
                            onChange={e => setPermission(p => ({ ...p, [field]: e.target.value }))}
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
                    <p className="text-[10px] text-muted-foreground/50">These controls help reduce financial and operational exposure.</p>
                    <div className="space-y-1.5">
                      {RISK_CONTROLS.map(rc => {
                        const checked = permission.spendResetPolicy.includes(rc.key);
                        return (
                          <label key={rc.key} className="flex items-center gap-2 text-[11px] cursor-pointer">
                            <Checkbox checked={checked} onCheckedChange={() => setPermission(p => ({ ...p, spendResetPolicy: toggleArrayItem(p.spendResetPolicy, rc.key) }))} />
                            <span className="text-foreground/70">{rc.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button onClick={handleSaveConfig} disabled={!canSaveConfig}
              className={`btn-twin btn-twin-primary w-full py-3 disabled:opacity-30 disabled:cursor-not-allowed ${canSaveConfig ? 'btn-glow' : ''}`}>
              Save Configuration
            </button>
          </div>
        )}

        {/* ═══ Sub-step C: TELEGRAM ═══ */}
        {subStep === 'telegram' && (
          <div className="space-y-6 animate-fade-in max-w-md mx-auto">
            <div className="glass-card space-y-5 text-center">
              <img src={lobsterIcon} alt="" className="w-14 h-14 mx-auto" style={{
                filter: 'brightness(0) saturate(100%) invert(78%) sepia(60%) saturate(1000%) hue-rotate(145deg) brightness(1.1)',
                opacity: 0.6,
              }} />
              <div>
                <h3 className="text-lg font-semibold mb-1">{currentSavedAgent?.name || agent.name}</h3>
                <p className="text-[10px] text-muted-foreground">Status: DRAFT — Connect Telegram to activate.</p>
              </div>

              {!telegramConnected ? (
                <button onClick={handleConnectTelegram} className="btn-twin btn-twin-primary btn-glow w-full py-3">
                  🔗 Connect Telegram
                </button>
              ) : (
                <p className="text-sm" style={{ color: '#36E6FF' }}>✓ Telegram Connected</p>
              )}
              <p className="text-[9px] text-muted-foreground/50">Required for agent notifications and task dispatch.</p>
            </div>
          </div>
        )}

        {/* ═══ Sub-step D: ACTIVATED ═══ */}
        {subStep === 'activated' && (
          <div className="space-y-6 animate-fade-in max-w-md mx-auto text-center">
            {/* Red flash → cyan lobster */}
            <RedFlashLobster />

            <h2 className="text-3xl font-bold">Agent Activated</h2>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Your agent is now operating under your committed identity.
            </p>

            <div className="glass-card space-y-3 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Agent</span>
                <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <img src={lobsterIcon} alt="" className="w-4 h-4" style={{ filter: 'brightness(0) saturate(100%) invert(78%) sepia(60%) saturate(1000%) hue-rotate(145deg) brightness(1.1)', opacity: 0.6 }} />
                  {currentSavedAgent?.name || agent.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Status</span>
                <span className="text-xs font-medium" style={{ color: '#36E6FF' }}>● Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Telegram</span>
                <span className="text-xs" style={{ color: '#36E6FF' }}>✓ Connected</span>
              </div>
            </div>

            <div className="space-y-3">
              <button onClick={onDashboard} className="btn-twin btn-twin-primary btn-glow w-full py-3">
                Return to Dashboard
              </button>
              <button onClick={handleCreateAnother} className="btn-twin btn-twin-ghost w-full py-2.5 text-sm">
                Create Another Agent
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Red Flash Lobster Animation (0.6s red → cyan) ── */
function RedFlashLobster() {
  const [showRed, setShowRed] = useState(true);
  const [faded, setFaded] = useState(false);

  useEffect(() => {
    const fadeT = setTimeout(() => setFaded(true), 600);
    const hideT = setTimeout(() => setShowRed(false), 1200);
    return () => { clearTimeout(fadeT); clearTimeout(hideT); };
  }, []);

  if (!showRed) {
    return (
      <div className="animate-fade-in">
        <img src={lobsterIcon} alt="" className="w-16 h-16 mx-auto" style={{
          filter: 'brightness(0) saturate(100%) invert(78%) sepia(60%) saturate(1000%) hue-rotate(145deg) brightness(1.1)',
          opacity: 0.7,
        }} />
      </div>
    );
  }

  return (
    <div className="transition-all duration-500" style={{ opacity: faded ? 0 : 1, transform: faded ? 'scale(1.3)' : 'scale(1)' }}>
      <img src={lobsterIcon} alt="" className="w-16 h-16 mx-auto" style={{ filter: 'drop-shadow(0 0 16px rgba(255, 60, 60, 0.7))' }} />
    </div>
  );
}
