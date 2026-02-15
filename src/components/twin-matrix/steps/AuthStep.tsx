import { useState, useEffect, useRef, useCallback } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';
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
  [3,0],[13,0],[2,1],[14,1],[1,2],[15,2],
  [2,3],[3,3],[4,3],[1,4],[2,4],[4,4],[5,4],[1,5],[2,5],[3,5],[5,5],
  [12,3],[13,3],[14,3],[11,4],[12,4],[14,4],[15,4],[11,5],[13,5],[14,5],[15,5],
  [6,3],[7,3],[8,3],[9,3],[10,3],[6,4],[7,4],[8,4],[9,4],[10,4],
  [5,5],[6,5],[7,5],[8,5],[9,5],[10,5],[11,5],
  [5,6],[6,6],[7,6],[8,6],[9,6],[10,6],[11,6],[6,7],[7,7],[8,7],[9,7],[10,7],
  [5,8],[6,8],[7,8],[8,8],[9,8],[10,8],[11,8],[6,9],[7,9],[8,9],[9,9],[10,9],
  [5,10],[6,10],[7,10],[8,10],[9,10],[10,10],[11,10],[6,11],[7,11],[8,11],[9,11],[10,11],
  [3,7],[4,7],[3,9],[4,9],[3,11],[4,11],[12,7],[13,7],[12,9],[13,9],[12,11],[13,11],
  [6,12],[7,12],[8,12],[9,12],[10,12],[7,13],[8,13],[9,13],
  [6,14],[7,14],[8,14],[9,14],[10,14],[5,15],[7,15],[8,15],[9,15],[11,15]
];

interface Particle { x:number;y:number;tx:number;ty:number;ox:number;oy:number;size:number;opacity:number; }

const CORNERS = [
  { xr: 0.02, yr: 0.02 }, { xr: 0.82, yr: 0.02 },
  { xr: 0.02, yr: 0.72 }, { xr: 0.82, yr: 0.72 }
];

const ParticleCanvas = ({ width, height }: { width: number; height: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const timerRef = useRef(0);
  const cornerIdxRef = useRef(Math.floor(Math.random() * 4));

  const setTargetsToCorner = useCallback((particles: Particle[], ci: number) => {
    const scale = Math.min(width, height) * 0.016;
    const cx = width * CORNERS[ci].xr;
    const cy = height * CORNERS[ci].yr;
    particles.forEach((p, i) => {
      if (i < LOBSTER_PIXELS.length) {
        p.tx = cx + LOBSTER_PIXELS[i][0] * scale;
        p.ty = cy + LOBSTER_PIXELS[i][1] * scale;
      }
    });
  }, [width, height]);

  const initParticles = useCallback(() => {
    const scale = Math.min(width, height) * 0.016;
    const ci = cornerIdxRef.current;
    const cx = width * CORNERS[ci].xr;
    const cy = height * CORNERS[ci].yr;
    const particles: Particle[] = LOBSTER_PIXELS.map(([px, py]) => ({
      x: Math.random() * width, y: Math.random() * height,
      tx: cx + px * scale, ty: cy + py * scale,
      ox: Math.random() * width, oy: Math.random() * height,
      size: 2.5 + Math.random() * 2, opacity: 0.08 + Math.random() * 0.14
    }));
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * width; const y = Math.random() * height;
      particles.push({ x, y, tx: x, ty: y, ox: x, oy: y, size: 1.5 + Math.random() * 2, opacity: 0.02 + Math.random() * 0.05 });
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
      if (t === 0) {
        cornerIdxRef.current = (cornerIdxRef.current + 1) % 4;
        setTargetsToCorner(particlesRef.current, cornerIdxRef.current);
        for (const p of particlesRef.current) { p.ox = p.x; p.oy = p.y; }
      }
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
        }
        const phase = t < GATHER ? 'gather' : t < GATHER + HOLD ? 'hold' : 'scatter';
        const glowOpacity = phase === 'hold' ? p.opacity * 1.2 : p.opacity;
        const s = p.size;
        ctx.fillStyle = `rgba(242, 68, 85, ${glowOpacity})`;
        ctx.fillRect(Math.round(p.x - s / 2), Math.round(p.y - s / 2), s, s);
        if (phase === 'hold') {
          ctx.fillStyle = `rgba(242, 68, 85, ${glowOpacity * 0.1})`;
          ctx.fillRect(Math.round(p.x - s * 1.5), Math.round(p.y - s * 1.5), s * 3, s * 3);
        }
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [width, height, initParticles, setTargetsToCorner]);

  return <canvas ref={canvasRef} width={width} height={height} className="absolute inset-0 pointer-events-none" style={{ opacity: 0.35 }} />;
};

/* ── Thin Divider ── */
const ThinDivider = () => (
  <div className="w-full h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />
);

/* ── Constants ── */
const MATCH_STRATEGIES = ['Based on Skill', 'Based on Brand', 'Based on Soul', 'Based on Core'];
const IDENTITY_SCOPES = ['Core', 'Skill', 'Soul'];
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
  maxPerTask: '', dailyCap: '', weeklyCap: '', spendResetPolicy: [], taskTypeBound: false, brandRestriction: false
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
    arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];

  const handleCreateAgent = () => {
    if (!agentName.trim()) return;
    const id = generateId();
    const newAgent: SavedAgent = {
      id, name: agentName.trim(), status: 'DRAFT',
      agent: { ...defaultAgent, name: agentName.trim() },
      permission: { ...defaultPermission, identityScopes: ['Core'] },
      telegramConnected: false
    };
    setSavedAgents((prev) => [...prev, newAgent]);
    setCurrentAgentId(id);
    setAgent({ ...defaultAgent, name: agentName.trim() });
    setPermission({ ...defaultPermission, identityScopes: ['Core'] });
    setFullAutoConfirm(false);
    setTelegramConnected(false);
    setSubStep('config');
  };

  const handleSaveDraft = () => {
    if (!currentAgentId) return;
    setSavedAgents((prev) => prev.map((a) =>
      a.id === currentAgentId ? { ...a, agent: { ...agent }, permission: { ...permission }, status: 'DRAFT' } : a
    ));
    onUpdate({ agent, permission });
    setSubStep('list');
  };

  const handleSaveConfig = () => {
    if (!currentAgentId) return;
    setSavedAgents((prev) => prev.map((a) =>
      a.id === currentAgentId ? { ...a, agent: { ...agent }, permission: { ...permission } } : a
    ));
    onUpdate({ agent, permission });
    setSubStep('telegram');
  };

  const handleConnectTelegram = () => {
    setTelegramConnected(true);
    if (currentAgentId) {
      setSavedAgents((prev) => prev.map((a) =>
        a.id === currentAgentId ? { ...a, status: 'ACTIVE', telegramConnected: true } : a
      ));
    }
    setTimeout(() => setSubStep('activated'), 600);
  };

  const handleCreateAnother = () => {
    setAgentName('');
    setCurrentAgentId(null);
    setViewingAgentId(null);
    setSubStep('list');
  };

  const currentSavedAgent = currentAgentId ? savedAgents.find((a) => a.id === currentAgentId) : null;
  const viewingAgent = viewingAgentId ? savedAgents.find((a) => a.id === viewingAgentId) : null;

  return (
    <div ref={containerRef} className="relative h-full">

      <div className="relative z-10 h-full overflow-y-auto scrollbar-hide">
        <div className="max-w-lg mx-auto px-6 py-10 space-y-0">

          {/* ═══ Sub-step: LIST ═══ */}
          {subStep === 'list' && (
            <div className="animate-fade-in space-y-0">
              <div className="text-center pb-6">
                <h2 className="text-2xl font-bold mb-1">Your Agents</h2>
                <p className="text-sm text-muted-foreground">Manage and create agents.</p>
              </div>

              <ThinDivider />

              {savedAgents.length > 0 && savedAgents.map((sa) => (
                <div key={sa.id}>
                  <div
                    className="py-4 flex items-center justify-between cursor-pointer hover:bg-foreground/[0.02] transition-colors"
                    onClick={() => setViewingAgentId(viewingAgentId === sa.id ? null : sa.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{
                          background: sa.status === 'ACTIVE' ? '#F24455' : 'rgba(255,255,255,0.2)',
                          boxShadow: sa.status === 'ACTIVE' ? '0 0 6px rgba(242,68,85,0.4)' : 'none',
                        }}
                      />
                      <div>
                        <p className="text-sm font-medium">{sa.name}</p>
                        <p className="text-[10px] text-muted-foreground/50">{sa.id.slice(0, 16)}…</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-medium ${sa.status === 'ACTIVE' ? 'text-[#F24455]' : 'text-muted-foreground/50'}`}>
                      {sa.status}
                    </span>
                  </div>

                  {viewingAgentId === sa.id && viewingAgent && (
                    <div className="pb-4 space-y-2 text-[11px] animate-fade-in">
                      <div className="flex justify-between"><span className="text-muted-foreground">Behavior</span><span className="text-foreground/70">{viewingAgent.agent.behaviorMode}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Autonomy</span><span className="text-foreground/70">{viewingAgent.permission.tradingAuthority}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Scope</span><span className="text-foreground/70">{(viewingAgent.permission.identityScopes || []).join(', ')}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Telegram</span><span className={viewingAgent.telegramConnected ? 'text-[#F24455]' : 'text-muted-foreground/40'}>{viewingAgent.telegramConnected ? '✓ Connected' : 'Not connected'}</span></div>
                    </div>
                  )}

                  <ThinDivider />
                </div>
              ))}

              <div className="pt-6">
                <button onClick={() => { setAgentName(''); setSubStep('create'); }} className="btn-twin btn-twin-primary btn-glow w-full py-3">
                  <Plus className="w-4 h-4" /> Create New Agent
                </button>
              </div>
            </div>
          )}

          {/* ═══ Sub-step A+B: CREATE & CONFIG (single continuous page) ═══ */}
          {(subStep === 'create' || subStep === 'config') && (
            <div className="animate-fade-in space-y-0">
              {savedAgents.length > 0 && !currentAgentId && (
                <div className="pb-4">
                  <button onClick={() => setSubStep('list')} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    ← View existing agents ({savedAgents.length})
                  </button>
                </div>
              )}

              <div className="text-center pb-8">
                <h2 className="text-2xl font-bold mb-1">Activate Your Agent</h2>
                <p className="text-sm text-muted-foreground">Let this identity act on your behalf.</p>
              </div>

              <ThinDivider />

              {/* Agent Name — editable when not yet created, read-only after */}
              {!currentAgentId ? (
                <div className="py-6 space-y-4">
                  <label className="text-xs text-muted-foreground uppercase tracking-widest">Agent Name</label>
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateAgent()}
                    placeholder="e.g. Brand Tracker"
                    className="w-full bg-transparent border-b border-foreground/10 px-0 py-2 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-foreground/30 transition-colors"
                  />
                  <div className="pt-2">
                    <button
                      onClick={handleCreateAgent}
                      disabled={!agentName.trim()}
                      className={`btn-twin btn-twin-primary w-full py-3 disabled:opacity-30 disabled:cursor-not-allowed ${agentName.trim() ? 'btn-glow' : ''}`}
                    >
                      Create Agent
                    </button>
                  </div>
                </div>
              ) : (
                <>

                  {/* Agent Name (read-only) */}
                  <div className="py-5 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground uppercase tracking-widest">Agent</span>
                    <span className="text-sm text-foreground/80 flex items-center gap-2">
                      <img src={lobsterIcon} alt="" className="w-4 h-4" style={{ filter: 'drop-shadow(0 0 4px rgba(242,68,85,0.4))', opacity: 0.8 }} />
                      {agent.name}
                    </span>
                  </div>

                  <ThinDivider />

                  {/* ── Config section (appears inline after agent created) ── */}
                  <div className="animate-fade-in">
                    {/* Behavior */}
                    <div className="py-5 space-y-3">
                      <label className="text-xs text-muted-foreground uppercase tracking-widest">Behavior</label>
                      <div className="space-y-2">
                        {['Active search', 'Passive receive only'].map((mode) => (
                          <div key={mode} className="flex items-center gap-3 cursor-pointer" onClick={() => setAgent((a) => ({ ...a, behaviorMode: mode }))}>
                            <span className="w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0"
                              style={{ borderColor: agent.behaviorMode === mode ? '#F24455' : 'rgba(255,255,255,0.15)' }}>
                              {agent.behaviorMode === mode && <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#F24455' }} />}
                            </span>
                            <span className="text-sm text-foreground/80">{mode === 'Active search' ? 'Active' : 'Passive'}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <ThinDivider />

                    {/* Matching Strategy */}
                    <div className="py-5 space-y-3">
                      <label className="text-xs text-muted-foreground uppercase tracking-widest">Matching Strategy</label>
                      <div className="flex gap-2 flex-nowrap overflow-x-auto scrollbar-hide">
                        {MATCH_STRATEGIES.map((s) => {
                          const selected = agent.matchingStrategy.includes(s);
                          return (
                            <button key={s} onClick={() => setAgent((a) => ({ ...a, matchingStrategy: toggleArrayItem(a.matchingStrategy, s) }))}
                              className={`text-xs px-4 py-1.5 rounded-full transition-all ${selected ? 'text-foreground border' : 'text-muted-foreground/50 border border-foreground/10 hover:border-foreground/20'}`}
                              style={selected ? { borderColor: 'rgba(242,68,85,0.4)', background: 'rgba(242,68,85,0.08)', color: 'rgba(242,68,85,0.9)' } : {}}>
                              {s}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <ThinDivider />

                    {/* Scope */}
                    <div className="py-5 space-y-3">
                      <label className="text-xs text-muted-foreground uppercase tracking-widest">Scope</label>
                      <p className="text-[10px] text-muted-foreground/50">Grants structured summary access only — no raw values exposed.</p>
                      <div className="flex gap-2">
                        {IDENTITY_SCOPES.map((s) => {
                          const scopes = permission.identityScopes || ['Core'];
                          const selected = scopes.includes(s);
                          return (
                            <button key={s} onClick={() => {
                                const next = selected ? scopes.filter((x) => x !== s) : [...scopes, s];
                                setPermission((p) => ({ ...p, identityScopes: next, identityScope: next[0] || '' }));
                              }}
                              className={`text-xs px-4 py-1.5 rounded-full transition-all ${selected ? 'text-foreground border' : 'text-muted-foreground/50 border border-foreground/10 hover:border-foreground/20'}`}
                              style={selected ? { borderColor: 'rgba(242,68,85,0.4)', background: 'rgba(242,68,85,0.08)', color: 'rgba(242,68,85,0.9)' } : {}}>
                              {s}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <ThinDivider />

                    {/* Trading Authority */}
                    <div className="py-5 space-y-3">
                      <label className="text-xs text-muted-foreground uppercase tracking-widest">Trading Authority</label>
                      <div className="space-y-2">
                        {TRADING_OPTIONS.map((mode) => (
                          <div key={mode} className="flex items-center gap-3 cursor-pointer" onClick={() => { setPermission((p) => ({ ...p, tradingAuthority: mode })); if (mode !== 'Full Auto') setFullAutoConfirm(false); }}>
                            <span className="w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0"
                              style={{ borderColor: permission.tradingAuthority === mode ? '#F24455' : 'rgba(255,255,255,0.15)' }}>
                              {permission.tradingAuthority === mode && <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#F24455' }} />}
                            </span>
                            <span className="text-sm text-foreground/80">{mode}</span>
                          </div>
                        ))}
                      </div>
                      {permission.tradingAuthority === 'Auto-Approve under threshold' && (
                        <div className="animate-fade-in pt-2 space-y-3">
                          <p className="text-[10px] text-muted-foreground/50">Set spend limits for auto-approved tasks.</p>
                          {(['maxPerTask', 'dailyCap', 'weeklyCap'] as const).map((field) => (
                            <div key={field} className="flex items-center gap-3">
                              <span className="text-[11px] text-muted-foreground w-20">{field === 'maxPerTask' ? 'Max / task' : field === 'dailyCap' ? 'Daily cap' : 'Weekly cap'}</span>
                              <input type="text" value={permission[field]}
                                onChange={(e) => setPermission((p) => ({ ...p, [field]: e.target.value }))}
                                placeholder="$"
                                className="flex-1 bg-transparent border-b border-foreground/10 px-0 py-1.5 text-xs text-foreground focus:outline-none focus:border-foreground/30 transition-colors" />
                            </div>
                          ))}
                        </div>
                      )}
                      {permission.tradingAuthority === 'Full Auto' && (
                        <div className="animate-fade-in pt-1">
                          <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <Checkbox checked={fullAutoConfirm} onCheckedChange={() => setFullAutoConfirm(!fullAutoConfirm)} />
                            <span className="text-muted-foreground">⚠ I understand Full Auto grants unrestricted trading authority</span>
                          </label>
                        </div>
                      )}
                    </div>

                    <ThinDivider />

                    {/* Authorization Duration */}
                    <div className="py-5 space-y-3">
                      <label className="text-xs text-muted-foreground uppercase tracking-widest">Authorization Duration</label>
                      <div className="space-y-2">
                        {DURATION_OPTIONS.map((d) => (
                          <div key={d} className="flex items-center gap-3 cursor-pointer" onClick={() => setPermission((p) => ({ ...p, authorizationDuration: d, customDurationDays: d === 'Custom' ? p.customDurationDays : '' }))}>
                            <span className="w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0"
                              style={{ borderColor: permission.authorizationDuration === d ? '#F24455' : 'rgba(255,255,255,0.15)' }}>
                              {permission.authorizationDuration === d && <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#F24455' }} />}
                            </span>
                            <span className="text-sm text-foreground/80">{d}</span>
                          </div>
                        ))}
                      </div>
                      {permission.authorizationDuration === 'Custom' && (
                        <div className="animate-fade-in flex items-center gap-2 pt-1">
                          <span className="text-[11px] text-muted-foreground">Days:</span>
                          <input type="number" min="1" value={permission.customDurationDays}
                            onChange={(e) => setPermission((p) => ({ ...p, customDurationDays: e.target.value.replace(/[^0-9]/g, '') }))}
                            placeholder="e.g. 14"
                            className="flex-1 bg-transparent border-b border-foreground/10 px-0 py-1.5 text-xs text-foreground focus:outline-none focus:border-foreground/30 transition-colors" />
                        </div>
                      )}
                    </div>

                    <ThinDivider />
                    <div className="py-5 space-y-3">
                      <label className="text-xs text-muted-foreground uppercase tracking-widest">Risk Controls</label>
                      <p className="text-[10px] text-muted-foreground/50">Reduce financial and operational exposure.</p>
                      <div className="space-y-2">
                        {RISK_CONTROLS.map((rc) => {
                          const checked = permission.spendResetPolicy.includes(rc.key);
                          return (
                            <label key={rc.key} className="flex items-center gap-3 text-[11px] cursor-pointer">
                              <Checkbox checked={checked} onCheckedChange={() => setPermission((p) => ({ ...p, spendResetPolicy: toggleArrayItem(p.spendResetPolicy, rc.key) }))} />
                              <span className="text-foreground/70">{rc.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <ThinDivider />

                    {/* Actions */}
                    <div className="pt-6 space-y-3">
                      <button onClick={handleSaveConfig}
                        disabled={permission.tradingAuthority === 'Full Auto' && !fullAutoConfirm}
                        className={`btn-twin btn-twin-primary w-full py-3 disabled:opacity-30 disabled:cursor-not-allowed ${!(permission.tradingAuthority === 'Full Auto' && !fullAutoConfirm) ? 'btn-glow' : ''}`}>
                        Save Configuration →
                      </button>
                      <button onClick={handleSaveDraft}
                        className="w-full py-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                        Save to Draft
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ═══ Sub-step C: TELEGRAM ═══ */}
          {subStep === 'telegram' && (
            <div className="animate-fade-in space-y-0">
              <div className="text-center pb-8">
                <h2 className="text-2xl font-bold mb-1">Connect Channel</h2>
                <p className="text-sm text-muted-foreground">Link Telegram to activate your agent.</p>
              </div>

              <ThinDivider />

              <div className="py-6 text-center space-y-4">
                <img src={lobsterIcon} alt="" className="w-12 h-12 mx-auto" style={{ filter: 'drop-shadow(0 0 8px rgba(242,68,85,0.5))', opacity: 0.8 }} />
                <div>
                  <p className="text-sm font-medium">{currentSavedAgent?.name || agent.name}</p>
                  <p className="text-[10px] text-muted-foreground/50 mt-1">Status: DRAFT — Connect Telegram to activate.</p>
                </div>
              </div>

              <ThinDivider />

              <div className="pt-6">
                {!telegramConnected ? (
                  <button onClick={handleConnectTelegram} className="btn-twin btn-twin-primary btn-glow w-full py-3">
                    🔗 Connect Telegram
                  </button>
                ) : (
                  <p className="text-sm text-center" style={{ color: '#F24455' }}>✓ Telegram Connected</p>
                )}
                <p className="text-[9px] text-muted-foreground/40 text-center mt-3">Required for agent notifications and task dispatch.</p>
              </div>
            </div>
          )}

          {/* ═══ Sub-step D: ACTIVATED ═══ */}
          {subStep === 'activated' && (
            <div className="animate-fade-in space-y-0">
              <div className="text-center pb-8">
                <h2 className="text-2xl font-bold mb-1">Agent Activated</h2>
                <p className="text-sm text-muted-foreground">Your agent is now operating under your committed identity.</p>
              </div>

              <ThinDivider />

              <div className="py-6">
                <RedFlashLobster />
              </div>

              <ThinDivider />

              <div className="py-4 space-y-2 text-[11px]">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Agent</span>
                  <span className="text-foreground/80 flex items-center gap-1.5">
                    <img src={lobsterIcon} alt="" className="w-3.5 h-3.5" style={{ filter: 'drop-shadow(0 0 4px rgba(242,68,85,0.4))', opacity: 0.8 }} />
                    {currentSavedAgent?.name || agent.name}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium" style={{ color: '#F24455' }}>● Active</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Telegram</span>
                  <span style={{ color: '#F24455' }}>✓ Connected</span>
                </div>
              </div>

              <ThinDivider />

              <div className="pt-6 space-y-3">
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
    </div>
  );
};

/* ── Red Flash Lobster Animation ── */
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
        <img src={lobsterIcon} alt="" className="w-16 h-16 mx-auto" style={{ filter: 'drop-shadow(0 0 12px rgba(242,68,85,0.5))', opacity: 0.9 }} />
      </div>
    );
  }

  return (
    <div className="transition-all duration-500" style={{ opacity: faded ? 0 : 1, transform: faded ? 'scale(1.3)' : 'scale(1)' }}>
      <img src={lobsterIcon} alt="" className="w-16 h-16 mx-auto" style={{ filter: 'drop-shadow(0 0 16px rgba(255,60,60,0.7))' }} />
    </div>
  );
}
