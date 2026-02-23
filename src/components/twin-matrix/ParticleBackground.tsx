import { useEffect, useRef, useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

/* ── Lobster/shrimp silhouette (20×24 grid, more detailed) ── */
const LOBSTER_PIXELS = [
  // Antennae (long, thin)
  [3,0],[2,1],[1,2],[17,0],[18,1],[19,2],
  [4,1],[3,2],[16,1],[17,2],
  // Head
  [8,3],[9,3],[10,3],[11,3],[12,3],
  [7,4],[8,4],[9,4],[10,4],[11,4],[12,4],[13,4],
  [7,5],[8,5],[9,5],[10,5],[11,5],[12,5],[13,5],
  // Claws (left)
  [4,5],[5,5],[3,6],[4,6],[5,6],[6,6],
  [3,7],[4,7],[5,7],
  // Claws (right)
  [15,5],[16,5],[14,6],[15,6],[16,6],[17,6],
  [15,7],[16,7],[17,7],
  // Body segments
  [7,6],[8,6],[9,6],[10,6],[11,6],[12,6],[13,6],
  [7,7],[8,7],[9,7],[10,7],[11,7],[12,7],[13,7],
  [8,8],[9,8],[10,8],[11,8],[12,8],
  [8,9],[9,9],[10,9],[11,9],[12,9],
  [8,10],[9,10],[10,10],[11,10],[12,10],
  [9,11],[10,11],[11,11],
  [9,12],[10,12],[11,12],
  // Tail segments
  [9,13],[10,13],[11,13],
  [8,14],[9,14],[10,14],[11,14],[12,14],
  // Tail fan
  [7,15],[8,15],[9,15],[10,15],[11,15],[12,15],[13,15],
  [6,16],[7,16],[9,16],[10,16],[11,16],[13,16],[14,16],
  // Legs (small, subtle)
  [7,8],[13,8],[6,9],[14,9],[6,10],[14,10],[7,11],[13,11],
];

/* ── Random position avoiding center content zone ── */
const pickLobsterPosition = (w: number, h: number) => {
  // Avoid center band (30%-70% x, 10%-60% y) where content sits
  const zones = [
    { xMin: 0.02, xMax: 0.25, yMin: 0.05, yMax: 0.85 },  // left edge
    { xMin: 0.75, xMax: 0.95, yMin: 0.05, yMax: 0.85 },  // right edge
    { xMin: 0.02, xMax: 0.95, yMin: 0.65, yMax: 0.90 },  // bottom
    { xMin: 0.02, xMax: 0.95, yMin: 0.02, yMax: 0.08 },  // top edge
  ];
  const zone = zones[Math.floor(Math.random() * zones.length)];
  return {
    x: w * (zone.xMin + Math.random() * (zone.xMax - zone.xMin)),
    y: h * (zone.yMin + Math.random() * (zone.yMax - zone.yMin)),
  };
};

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
  const { colorMode } = useTheme();
  const cyanParticles = useRef(createCyanParticles(256));
  const redParticles = useRef<RedParticle[]>([]);
  const raf = useRef(0);
  const colorRef = useRef(color);
  const timerRef = useRef(0);
  const redInitedRef = useRef(false);
  const themeRef = useRef(colorMode);
  colorRef.current = color;
  themeRef.current = colorMode;

  const initRedParticles = useCallback((w: number, h: number) => {
    const scale = Math.min(w, h) * 0.018;
    const pos = pickLobsterPosition(w, h);

    const particles: RedParticle[] = [];

    // Lobster formation particles — subtle, ghostly
    for (const [px, py] of LOBSTER_PIXELS) {
      particles.push({
        x: Math.random() * w, y: Math.random() * h,
        tx: pos.x + px * scale, ty: pos.y + py * scale,
        ox: Math.random() * w, oy: Math.random() * h,
        size: 2 + Math.random() * 1.5,
        baseOpacity: 0.08 + Math.random() * 0.12,
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
        baseOpacity: 0.10 + Math.random() * 0.18,
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

  const setLobsterTargets = useCallback((w: number, h: number) => {
    const scale = Math.min(w, h) * 0.018;
    const pos = pickLobsterPosition(w, h);
    const lobsters = redParticles.current.filter(pp => pp.isLobster);
    for (let i = 0; i < lobsters.length && i < LOBSTER_PIXELS.length; i++) {
      lobsters[i].ox = lobsters[i].x;
      lobsters[i].oy = lobsters[i].y;
      lobsters[i].tx = pos.x + LOBSTER_PIXELS[i][0] * scale;
      lobsters[i].ty = pos.y + LOBSTER_PIXELS[i][1] * scale;
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
      const isLight = themeRef.current !== 'dark';
      const opacityMul = isLight ? 2.5 : 1;
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
        const alpha = Math.min(1, p.baseOpacity * (0.4 + 0.6 * Math.sin(time * 0.0008 + p.phase)) * opacityMul);
        const particleColor = isLight ? `rgba(0, 180, 180, ${alpha})` : `rgba(10, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, p.size * (isLight ? 1.3 : 1), 0, Math.PI * 2);
        ctx.fillStyle = particleColor;
        ctx.fill();
      }
    } else {
      // ── Red: floating + lobster gathering ──
      if (!redInitedRef.current) initRedParticles(w, h);

      timerRef.current++;
      const GATHER = 420, HOLD = 200, SCATTER = 400;
      const TOTAL = GATHER + HOLD + SCATTER;
      const t = timerRef.current % TOTAL;

      // Pick new random position on cycle reset
      if (t === 0) {
        setLobsterTargets(w, h);
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
          const glowOpacity = phase === 'hold' ? p.baseOpacity * 1.1 : p.baseOpacity;
          const s = p.size;

          // Square pixel-block rendering
          ctx.fillStyle = `rgba(242, 68, 85, ${glowOpacity})`;
          ctx.fillRect(Math.round(p.x - s / 2), Math.round(p.y - s / 2), s, s);
          if (phase === 'hold') {
            ctx.fillStyle = `rgba(242, 68, 85, ${glowOpacity * 0.06})`;
            ctx.fillRect(Math.round(p.x - s * 1.2), Math.round(p.y - s * 1.2), s * 2.4, s * 2.4);
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
