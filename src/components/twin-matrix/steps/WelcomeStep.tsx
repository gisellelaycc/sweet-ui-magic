import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRight } from 'lucide-react';
import logo from '@/assets/twin3-logo.svg';
import { StepLayout, StepContent } from '../StepLayout';

interface Props {
  username: string;
  onUpdateUsername: (name: string) => void;
  onNext: () => void;
}

/* ── Particle Field (background after title reveal) ── */
interface Particle {
  angle: number;
  radius: number;
  size: number;
  baseOpacity: number;
  speed: number;
  phase: number;
  jitter: number;
}

const createParticles = (count: number): Particle[] =>
  Array.from({ length: count }, (_, i) => ({
    angle: (i / count) * Math.PI * 2 + Math.random() * 0.4,
    radius: 80 + Math.random() * 380,
    size: 0.8 + Math.random() * 2,
    baseOpacity: 0.1 + Math.random() * 0.35,
    speed: 0.0002 + Math.random() * 0.0005,
    phase: Math.random() * Math.PI * 2,
    jitter: 0.5 + Math.random() * 1.5,
  }));

const ParticleCanvas = ({ phase }: { phase: 'scatter' | 'converge' | 'bg' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef(createParticles(256));
  const raf = useRef(0);
  const startTime = useRef(Date.now());

  const draw = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio, 2);
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2;
    const cy = h / 2 - 30;

    const elapsed = time - startTime.current;

    for (const p of particles.current) {
      p.angle += p.speed;

      let r = p.radius;
      let alpha = p.baseOpacity;

      if (phase === 'converge') {
        // Shrink radius toward center over ~1.5s
        const progress = Math.min(elapsed / 1500, 1);
        const ease = progress * progress * (3 - 2 * progress); // smoothstep
        r = p.radius * (1 - ease * 0.85);
        alpha = p.baseOpacity * (1 - ease * 0.6);
      } else if (phase === 'bg') {
        // Background: gentle breathing, wide spread
        const breathe = Math.sin(time * 0.0006 + p.phase) * 0.12 + 1;
        r = p.radius * breathe;
        // Add jitter
        const jx = Math.sin(time * 0.002 + p.phase * 3) * p.jitter;
        const jy = Math.cos(time * 0.0015 + p.phase * 2) * p.jitter;
        const px = cx + Math.cos(p.angle) * r + jx;
        const py = cy + Math.sin(p.angle) * r * 0.55 + jy;
        alpha = p.baseOpacity * (0.5 + 0.5 * Math.sin(time * 0.001 + p.phase));

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(242, 68, 85, ${alpha})`;
        ctx.fill();
        raf.current = requestAnimationFrame(draw);
        return; // handled individually in bg
      }

      const px = cx + Math.cos(p.angle) * r;
      const py = cy + Math.sin(p.angle) * r * 0.55;

      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(242, 68, 85, ${alpha})`;
      ctx.fill();
    }

    raf.current = requestAnimationFrame(draw);
  }, [phase]);

  // Fix: for 'bg' phase, need to draw all particles, not return after first
  const drawBg = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio, 2);
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2;
    const cy = h / 2 - 30;

    for (const p of particles.current) {
      p.angle += p.speed;
      const breathe = Math.sin(time * 0.0006 + p.phase) * 0.12 + 1;
      const r = p.radius * breathe;
      const jx = Math.sin(time * 0.002 + p.phase * 3) * p.jitter;
      const jy = Math.cos(time * 0.0015 + p.phase * 2) * p.jitter;
      const px = cx + Math.cos(p.angle) * r + jx;
      const py = cy + Math.sin(p.angle) * r * 0.55 + jy;
      const alpha = p.baseOpacity * (0.5 + 0.5 * Math.sin(time * 0.001 + p.phase));

      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(242, 68, 85, ${alpha})`;
      ctx.fill();
    }
    raf.current = requestAnimationFrame(drawBg);
  }, []);

  useEffect(() => {
    startTime.current = performance.now();
    const fn = phase === 'bg' ? drawBg : draw;
    raf.current = requestAnimationFrame(fn);
    return () => cancelAnimationFrame(raf.current);
  }, [phase, draw, drawBg]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: phase === 'converge' ? 0.9 : 0.6 }}
    />
  );
};

/* ── Scan Glow Title: text itself glows as scan passes ── */
const ScanGlowTitle = ({ text, visible }: { text: string; visible: boolean }) => (
  <h1
    className="text-4xl sm:text-5xl md:text-[3.5rem] font-bold tracking-tight leading-[1.15] whitespace-nowrap relative"
    style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'scale(1)' : 'scale(0.92)',
      transition: 'opacity 800ms ease-out, transform 800ms ease-out',
    }}
  >
    <span className="scan-text-base">{text}</span>
    <span className="scan-text-glow" aria-hidden="true">{text}</span>
  </h1>
);

export const WelcomeStep = ({ username, onUpdateUsername, onNext }: Props) => {
  const [value, setValue] = useState(username);
  const isValid = value.trim().length > 0;

  // Animation phases: scatter → converge → reveal
  const [phase, setPhase] = useState<'scatter' | 'converge' | 'bg'>('scatter');
  const [titleVisible, setTitleVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    // Phase 1: particles scatter for 800ms
    const t1 = setTimeout(() => setPhase('converge'), 800);
    // Phase 2: converge for 1.5s, then reveal title
    const t2 = setTimeout(() => {
      setPhase('bg');
      setTitleVisible(true);
    }, 2300);
    // Phase 3: show rest of content
    const t3 = setTimeout(() => setContentVisible(true), 2900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const handleConfirm = () => {
    if (!isValid) return;
    onUpdateUsername(value.trim());
    onNext();
  };

  return (
    <StepLayout>
      <StepContent>
        <div className="relative flex flex-col items-center justify-center text-center min-h-[70vh] px-4">
          <ParticleCanvas phase={phase} />

          <div className="relative z-10 flex flex-col items-center">
            {/* Logo — no box */}
            <img
              src={logo}
              alt="Twin Matrix"
              className="w-12 h-12 mb-8"
              style={{
                opacity: titleVisible ? 1 : 0,
                transition: 'opacity 600ms ease-out',
              }}
            />

            <ScanGlowTitle text="Bring your 256D self to life." visible={titleVisible} />

            <p
              className="text-muted-foreground text-lg md:text-xl max-w-md mx-auto leading-relaxed mt-5"
              style={{
                opacity: titleVisible ? 1 : 0,
                transform: titleVisible ? 'translateY(0)' : 'translateY(12px)',
                transition: 'opacity 600ms ease-out 400ms, transform 600ms ease-out 400ms',
              }}
            >
              Build an OpenClaw agent that thinks like you.
            </p>

            {/* Input + CTA */}
            <div
              className="mt-10 w-full max-w-xs mx-auto"
              style={{
                opacity: contentVisible ? 1 : 0,
                transform: contentVisible ? 'translateY(0)' : 'translateY(16px)',
                transition: 'opacity 600ms ease-out, transform 600ms ease-out',
              }}
            >
              <div className="relative glass-card !p-0 !rounded-xl mb-4">
                <input
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleConfirm()}
                  placeholder="your name"
                  className="w-full bg-transparent border-none rounded-xl px-4 py-3 text-center text-base text-foreground placeholder:text-muted-foreground/40 focus:outline-none transition-colors pr-12 relative z-10"
                />
                <button
                  onClick={handleConfirm}
                  disabled={!isValid}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all z-10 ${
                    isValid
                      ? 'text-foreground bg-foreground/10 hover:bg-foreground/15'
                      : 'text-muted-foreground/30 cursor-not-allowed'
                  }`}
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleConfirm}
                disabled={!isValid}
                className={`btn-twin btn-twin-primary text-sm px-8 py-2.5 w-full disabled:opacity-30 disabled:cursor-not-allowed ${isValid ? 'btn-glow' : ''}`}
              >
                Enter the Space →
              </button>
              <p className="text-muted-foreground/50 text-[10px] mt-2 text-center">Takes about 2 minutes</p>
            </div>
          </div>
        </div>
      </StepContent>
    </StepLayout>
  );
};
