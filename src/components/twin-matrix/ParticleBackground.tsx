import { useEffect, useRef, useCallback } from 'react';

/* ── Lobster silhouette (16×16 grid) ── */
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

const CORNERS = [
  { xr: 0.12, yr: 0.10 },
  { xr: 0.72, yr: 0.08 },
  { xr: 0.10, yr: 0.62 },
  { xr: 0.72, yr: 0.60 },
];

interface CyanParticle {
  angle: number;
  radius: number;
  size: number;
  baseOpacity: number;
  speed: number;
  phase: number;
  jitter: number;
}

interface RedParticle {
  x: number; y: number;
  tx: number; ty: number;
  ox: number; oy: number;
  size: number;
  baseOpacity: number;
  phase: number;
  isLobster: boolean;
  // for floating
  speed: number;
  angle: number;
  radius: number;
  jitter: number;
}

const createCyanParticles = (count: number): CyanParticle[] =>
  Array.from({ length: count }, (_, i) => ({
    angle: (i / count) * Math.PI * 2 + Math.random() * 0.4,
    radius: 120 + Math.random() * 500,
    size: 0.8 + Math.random() * 2,
    baseOpacity: 0.08 + Math.random() * 0.25,
    speed: 0.0001 + Math.random() * 0.0004,
    phase: Math.random() * Math.PI * 2,
    jitter: 0.5 + Math.random() * 2,
  }));

interface ParticleBackgroundProps {
  color?: 'cyan' | 'red';
}

export const ParticleBackground = ({ color = 'cyan' }: ParticleBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cyanParticles = useRef(createCyanParticles(256));
  const redParticles = useRef<RedParticle[]>([]);
  const raf = useRef(0);
  const colorRef = useRef(color);
  const timerRef = useRef(0);
  const cornerIdxRef = useRef(Math.floor(Math.random() * 4));
  const redInitedRef = useRef(false);
  colorRef.current = color;

  const initRedParticles = useCallback((w: number, h: number) => {
    const scale = Math.min(w, h) * 0.022;
    const ci = cornerIdxRef.current;
    const cx = w * CORNERS[ci].xr;
    const cy = h * CORNERS[ci].yr;

    const particles: RedParticle[] = [];

    // Lobster formation particles
    for (const [px, py] of LOBSTER_PIXELS) {
      particles.push({
        x: Math.random() * w, y: Math.random() * h,
        tx: cx + px * scale, ty: cy + py * scale,
        ox: Math.random() * w, oy: Math.random() * h,
        size: 3 + Math.random() * 2.5,
        baseOpacity: 0.35 + Math.random() * 0.35,
        phase: Math.random() * Math.PI * 2,
        isLobster: true,
        speed: 0, angle: 0, radius: 0, jitter: 0,
      });
    }

    // Floating ambient particles
    for (let i = 0; i < 160; i++) {
      particles.push({
        x: Math.random() * w, y: Math.random() * h,
        tx: 0, ty: 0, ox: 0, oy: 0,
        size: 1 + Math.random() * 2.2,
        baseOpacity: 0.12 + Math.random() * 0.22,
        phase: Math.random() * Math.PI * 2,
        isLobster: false,
        speed: 0.0001 + Math.random() * 0.0004,
        angle: Math.random() * Math.PI * 2,
        radius: 100 + Math.random() * 450,
        jitter: 0.5 + Math.random() * 2,
      });
    }

    redParticles.current = particles;
    timerRef.current = 0;
    redInitedRef.current = true;
  }, []);

  const setLobsterTargets = useCallback((w: number, h: number, ci: number) => {
    const scale = Math.min(w, h) * 0.022;
    const cx = w * CORNERS[ci].xr;
    const cy = h * CORNERS[ci].yr;
    for (const p of redParticles.current) {
      if (!p.isLobster) continue;
      const idx = redParticles.current.filter(pp => pp.isLobster).indexOf(p);
      if (idx >= 0 && idx < LOBSTER_PIXELS.length) {
        p.ox = p.x; p.oy = p.y;
        p.tx = cx + LOBSTER_PIXELS[idx][0] * scale;
        p.ty = cy + LOBSTER_PIXELS[idx][1] * scale;
      }
    }
  }, []);

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

    if (colorRef.current === 'cyan') {
      // ── Cyan orbital mode ──
      const cx = w / 2;
      const cy = h / 2;
      for (const p of cyanParticles.current) {
        p.angle += p.speed;
        const breathe = Math.sin(time * 0.0005 + p.phase) * 0.15 + 1;
        const r = p.radius * breathe;
        const jx = Math.sin(time * 0.0015 + p.phase * 3) * p.jitter;
        const jy = Math.cos(time * 0.001 + p.phase * 2) * p.jitter;
        const px = cx + Math.cos(p.angle) * r + jx;
        const py = cy + Math.sin(p.angle) * r * 0.6 + jy;
        const alpha = p.baseOpacity * (0.4 + 0.6 * Math.sin(time * 0.0008 + p.phase));
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(10, 255, 255, ${alpha})`;
        ctx.fill();
      }
    } else {
      // ── Red: floating + lobster gathering ──
      if (!redInitedRef.current) initRedParticles(w, h);

      timerRef.current++;
      const GATHER = 240, HOLD = 150, SCATTER = 240;
      const TOTAL = GATHER + HOLD + SCATTER;
      const t = timerRef.current % TOTAL;

      // Rotate corner on cycle reset
      if (t === 0) {
        cornerIdxRef.current = (cornerIdxRef.current + 1) % 4;
        setLobsterTargets(w, h, cornerIdxRef.current);
      }

      const cx = w / 2;
      const cy = h / 2;

      for (const p of redParticles.current) {
        if (p.isLobster) {
          // Lobster gathering behavior
          if (t < GATHER) {
            const ease = (t / GATHER) ** 2 * (3 - 2 * (t / GATHER));
            p.x = p.ox + (p.tx - p.ox) * ease;
            p.y = p.oy + (p.ty - p.oy) * ease;
          } else if (t < GATHER + HOLD) {
            p.x = p.tx + Math.sin(timerRef.current * 0.02 + p.phase) * 0.6;
            p.y = p.ty + Math.cos(timerRef.current * 0.02 + p.phase) * 0.6;
          } else {
            const progress = ((t - GATHER - HOLD) / SCATTER) ** 2;
            const nx = p.ox + (Math.random() - 0.5) * 60;
            const ny = p.oy + (Math.random() - 0.5) * 60;
            p.x = p.tx + (nx - p.tx) * progress;
            p.y = p.ty + (ny - p.ty) * progress;
            if (t === TOTAL - 1) { p.ox = p.x; p.oy = p.y; }
          }

          const phase = t < GATHER ? 'gather' : t < GATHER + HOLD ? 'hold' : 'scatter';
          const glowOpacity = phase === 'hold' ? p.baseOpacity * 1.4 : p.baseOpacity;
          const s = p.size;

          // Square pixel-block rendering
          ctx.fillStyle = `rgba(242, 68, 85, ${glowOpacity})`;
          ctx.fillRect(Math.round(p.x - s / 2), Math.round(p.y - s / 2), s, s);
          if (phase === 'hold') {
            ctx.fillStyle = `rgba(242, 68, 85, ${glowOpacity * 0.12})`;
            ctx.fillRect(Math.round(p.x - s * 1.5), Math.round(p.y - s * 1.5), s * 3, s * 3);
          }
        } else {
          // Floating ambient particles
          p.angle += p.speed;
          const breathe = Math.sin(time * 0.0005 + p.phase) * 0.15 + 1;
          const r = p.radius * breathe;
          const jx = Math.sin(time * 0.0015 + p.phase * 3) * p.jitter;
          const jy = Math.cos(time * 0.001 + p.phase * 2) * p.jitter;
          const px = cx + Math.cos(p.angle) * r + jx;
          const py = cy + Math.sin(p.angle) * r * 0.6 + jy;
          const alpha = p.baseOpacity * (0.4 + 0.6 * Math.sin(time * 0.0008 + p.phase));
          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(242, 68, 85, ${alpha})`;
          ctx.fill();
        }
      }
    }

    raf.current = requestAnimationFrame(draw);
  }, [initRedParticles, setLobsterTargets]);

  useEffect(() => {
    raf.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf.current);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.85, zIndex: 0 }}
    />
  );
};
