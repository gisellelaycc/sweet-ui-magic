import { useEffect, useRef, useCallback } from 'react';

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
    radius: 120 + Math.random() * 500,
    size: 0.8 + Math.random() * 2,
    baseOpacity: 0.08 + Math.random() * 0.25,
    speed: 0.0001 + Math.random() * 0.0004,
    phase: Math.random() * Math.PI * 2,
    jitter: 0.5 + Math.random() * 2,
  }));

/**
 * Global ambient particle background that renders on every page.
 * 256 cyan particles in a wide, breathing elliptical orbit.
 */
export const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef(createParticles(256));
  const raf = useRef(0);

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
    const cy = h / 2;

    for (const p of particles.current) {
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
    raf.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    raf.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf.current);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
};
