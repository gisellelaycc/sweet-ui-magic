import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRight } from 'lucide-react';
import logo from '@/assets/twin3-logo.svg';
import { StepLayout, StepContent } from '../StepLayout';

interface Props {
  username: string;
  onUpdateUsername: (name: string) => void;
  onNext: () => void;
}

/* ── 256 Particles ── */
interface Particle {
  x: number; y: number;
  angle: number; radius: number;
  size: number; opacity: number;
  speed: number; phase: number;
}

const createParticles = (count: number): Particle[] =>
  Array.from({ length: count }, (_, i) => ({
    x: 0, y: 0,
    angle: (i / count) * Math.PI * 2 + Math.random() * 0.3,
    radius: 120 + Math.random() * 260,
    size: 1 + Math.random() * 2,
    opacity: 0.15 + Math.random() * 0.4,
    speed: 0.0003 + Math.random() * 0.0006,
    phase: Math.random() * Math.PI * 2,
  }));

const ParticleField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef(createParticles(256));
  const raf = useRef(0);

  const draw = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width = canvas.offsetWidth * 2;
    const h = canvas.height = canvas.offsetHeight * 2;
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2;

    for (const p of particles.current) {
      p.angle += p.speed;
      const breathe = Math.sin(time * 0.0008 + p.phase) * 0.15 + 1;
      const r = p.radius * breathe;
      const px = cx + Math.cos(p.angle) * r;
      const py = cy + Math.sin(p.angle) * r * 0.65; // ellipse
      const alpha = p.opacity * (0.6 + 0.4 * Math.sin(time * 0.001 + p.phase));

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
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.7 }}
    />
  );
};

/* ── Dimension Scan Title ── */
const ScanTitle = ({ text }: { text: string }) => {
  const words = text.split(' ');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] relative scan-title">
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block mr-[0.3em] last:mr-0"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(32px)',
            transition: `opacity 500ms ease-out ${i * 70}ms, transform 500ms ease-out ${i * 70}ms`,
          }}
        >
          {word}
        </span>
      ))}
      {/* Scan line overlay */}
      <span className="scan-line" />
    </h1>
  );
};

export const WelcomeStep = ({ username, onUpdateUsername, onNext }: Props) => {
  const [value, setValue] = useState(username);
  const isValid = value.trim().length > 0;
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 100);
    return () => clearTimeout(t);
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
          {/* 256 Particle field */}
          <ParticleField />

          {/* Main content */}
          <div
            className="relative z-10 flex flex-col items-center"
            style={{
              opacity: entered ? 1 : 0,
              transform: entered ? 'translateY(0)' : 'translateY(24px)',
              transition: 'opacity 700ms ease-out, transform 700ms ease-out',
            }}
          >
            <div className="mb-8">
              <div
                className="w-16 h-16 mx-auto mb-8 rounded-2xl bg-foreground/5 flex items-center justify-center"
                style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.05) inset' }}
              >
                <img src={logo} alt="Twin Matrix" className="w-10 h-10" />
              </div>

              <ScanTitle text="Bring your 256D self to life." />

              <p
                className="text-muted-foreground text-lg md:text-xl max-w-md mx-auto leading-relaxed mt-5"
                style={{
                  opacity: entered ? 1 : 0,
                  transform: entered ? 'translateY(0)' : 'translateY(16px)',
                  transition: 'opacity 600ms ease-out 500ms, transform 600ms ease-out 500ms',
                }}
              >
                Build an OpenClaw agent that thinks like you.
              </p>
            </div>

            {/* Input */}
            <div
              className="w-full max-w-xs mx-auto mb-5"
              style={{
                opacity: entered ? 1 : 0,
                transform: entered ? 'translateY(0)' : 'translateY(16px)',
                transition: 'opacity 600ms ease-out 700ms, transform 600ms ease-out 700ms',
              }}
            >
              <div className="relative glass-card !p-0 !rounded-xl">
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
            </div>

            {/* CTA */}
            <div
              className="w-full max-w-xs mx-auto"
              style={{
                opacity: entered ? 1 : 0,
                transform: entered ? 'translateY(0)' : 'translateY(16px)',
                transition: 'opacity 600ms ease-out 900ms, transform 600ms ease-out 900ms',
              }}
            >
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
