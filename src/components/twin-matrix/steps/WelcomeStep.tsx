import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRight } from 'lucide-react';
import logo from '@/assets/twin3-logo.svg';
import { StepLayout, StepContent } from '../StepLayout';
import { useI18n } from '@/lib/i18n';

interface Props {
  username: string;
  onUpdateUsername: (name: string) => void;
  onNext: () => void;
}

/* ── Glowing divider line (white, shimmering) ── */
const GlowLine = () => (
  <div className="relative w-full h-px mt-1 mb-6">
    <div className="absolute inset-0 bg-foreground/10" />
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute top-0 h-full w-[60px]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent)',
          animation: 'divider-trace-welcome 6s linear infinite',
        }}
      />
    </div>
  </div>
);

/* ── Particle-to-text sampler ── */
interface TextParticle {
  x: number; y: number;
  tx: number; ty: number;
  ox: number; oy: number;
  size: number;
  phase: number;
}

const sampleText = (text: string, fontSize: number, maxW: number): { x: number; y: number }[] => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const dpr = 2;
  canvas.width = maxW * dpr;
  canvas.height = fontSize * 2 * dpr;
  ctx.scale(dpr, dpr);
  ctx.font = `bold ${fontSize}px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif`;
  ctx.fillStyle = '#fff';
  ctx.textBaseline = 'top';
  const tw = ctx.measureText(text).width;
  const ox = (maxW - tw) / 2;
  ctx.fillText(text, ox, fontSize * 0.15);
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pts: { x: number; y: number }[] = [];
  const step = 3;
  for (let y = 0; y < canvas.height; y += step * dpr) {
    for (let x = 0; x < canvas.width; x += step * dpr) {
      if (img.data[(y * canvas.width + x) * 4 + 3] > 128) {
        pts.push({ x: x / dpr, y: y / dpr });
      }
    }
  }
  return pts;
};

/* ── ParticleTitle: particles scatter → converge → reveal HTML text ── */
const ParticleTitle = ({ text, visible, onFormed }: { text: string; visible: boolean; onFormed: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const particles = useRef<TextParticle[]>([]);
  const raf = useRef(0);
  const startTime = useRef(0);
  const [formed, setFormed] = useState(false);
  const formedFlag = useRef(false);
  const onFormedRef = useRef(onFormed);
  onFormedRef.current = onFormed;

  // Determine responsive font size
  const getFontSize = useCallback(() => {
    const w = window.innerWidth;
    if (w < 640) return 32;
    if (w < 768) return 40;
    return 52;
  }, []);

  const init = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const w = container.offsetWidth;
    const fs = getFontSize();
    const h = fs * 2;
    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    canvas.width = w * dpr;
    canvas.height = h * dpr;

    const pts = sampleText(text, fs, w);
    particles.current = pts.map(p => ({
      x: Math.random() * w, y: Math.random() * h,
      tx: p.x, ty: p.y,
      ox: Math.random() * w, oy: Math.random() * h,
      size: 1.0 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
    }));
    startTime.current = performance.now() + 300; // small initial delay
    formedFlag.current = false;
    setFormed(false);
  }, [text, getFontSize]);

  const draw = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio, 2);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const elapsed = Math.max(0, time - startTime.current);
    const GATHER_MS = 2000;
    const progress = Math.min(1, elapsed / GATHER_MS);
    const ease = 1 - Math.pow(1 - progress, 3);

    for (const p of particles.current) {
      p.x = p.ox + (p.tx - p.ox) * ease;
      p.y = p.oy + (p.ty - p.oy) * ease;
      const jitter = (1 - ease) * 4;
      const jx = Math.sin(time * 0.003 + p.phase) * jitter;
      const jy = Math.cos(time * 0.004 + p.phase * 1.5) * jitter;
      const alpha = 0.25 + ease * 0.75;
      ctx.beginPath();
      ctx.arc(p.x + jx, p.y + jy, p.size * (0.5 + ease * 0.5), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(10, 255, 255, ${alpha})`;
      ctx.fill();
    }

    if (progress >= 1 && !formedFlag.current) {
      formedFlag.current = true;
      setTimeout(() => {
        setFormed(true);
        onFormedRef.current();
      }, 300);
    }

    if (!formedFlag.current) {
      raf.current = requestAnimationFrame(draw);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    init();
    raf.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf.current);
  }, [visible, init, draw]);

  const fs = getFontSize();

  return (
    <div ref={containerRef} className="relative w-full" style={{ minHeight: fs * 2 }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: formed ? 0 : 1,
          transition: 'opacity 600ms ease-out',
        }}
      />
      <h1
        className="text-4xl sm:text-5xl md:text-[3.5rem] font-bold tracking-tight leading-[1.15] whitespace-nowrap text-center"
        style={{
          opacity: formed ? 1 : 0,
          transition: 'opacity 600ms ease-out',
        }}
      >
        <span className="scan-text-base">{text}</span>
        <span className="scan-text-glow" aria-hidden="true">{text}</span>
      </h1>
    </div>
  );
};

/* ── Particle subtitle (smaller text, same effect) ── */
const ParticleSubtitle = ({ text, visible, onFormed }: { text: string; visible: boolean; onFormed: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const particles = useRef<TextParticle[]>([]);
  const raf = useRef(0);
  const startTime = useRef(0);
  const [formed, setFormed] = useState(false);
  const formedFlag = useRef(false);
  const onFormedRef = useRef(onFormed);
  onFormedRef.current = onFormed;

  const getFontSize = useCallback(() => {
    const w = window.innerWidth;
    if (w < 768) return 16;
    return 20;
  }, []);

  const init = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const w = container.offsetWidth;
    const fs = getFontSize();
    const h = fs * 3;
    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    canvas.width = w * dpr;
    canvas.height = h * dpr;

    const pts = sampleText(text, fs, w);
    particles.current = pts.map(p => ({
      x: Math.random() * w, y: Math.random() * h,
      tx: p.x, ty: p.y,
      ox: Math.random() * w, oy: Math.random() * h,
      size: 0.8 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
    }));
    startTime.current = performance.now() + 200;
    formedFlag.current = false;
    setFormed(false);
  }, [text, getFontSize]);

  const draw = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio, 2);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const elapsed = Math.max(0, time - startTime.current);
    const GATHER_MS = 1600;
    const progress = Math.min(1, elapsed / GATHER_MS);
    const ease = 1 - Math.pow(1 - progress, 3);

    for (const p of particles.current) {
      p.x = p.ox + (p.tx - p.ox) * ease;
      p.y = p.oy + (p.ty - p.oy) * ease;
      const jitter = (1 - ease) * 3;
      const jx = Math.sin(time * 0.003 + p.phase) * jitter;
      const jy = Math.cos(time * 0.004 + p.phase * 1.5) * jitter;
      const alpha = 0.2 + ease * 0.6;
      ctx.beginPath();
      ctx.arc(p.x + jx, p.y + jy, p.size * (0.4 + ease * 0.6), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(10, 255, 255, ${alpha})`;
      ctx.fill();
    }

    if (progress >= 1 && !formedFlag.current) {
      formedFlag.current = true;
      setTimeout(() => {
        setFormed(true);
        onFormedRef.current();
      }, 200);
    }

    if (!formedFlag.current) {
      raf.current = requestAnimationFrame(draw);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    init();
    raf.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf.current);
  }, [visible, init, draw]);

  const fs = getFontSize();

  return (
    <div ref={containerRef} className="relative w-full max-w-md mx-auto" style={{ minHeight: fs * 3 }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: formed ? 0 : 1,
          transition: 'opacity 500ms ease-out',
        }}
      />
      <p
        className="text-muted-foreground text-lg md:text-xl leading-relaxed text-center"
        style={{
          opacity: formed ? 1 : 0,
          transition: 'opacity 500ms ease-out',
        }}
      >
        {text}
      </p>
    </div>
  );
};

export const WelcomeStep = ({ username, onUpdateUsername, onNext }: Props) => {
  const { t } = useI18n();
  const [value, setValue] = useState(username);
  const isValid = value.trim().length > 0;

  const [titleStarted, setTitleStarted] = useState(false);
  const [titleFormed, setTitleFormed] = useState(false);
  const [subtitleStarted, setSubtitleStarted] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [logoVisible, setLogoVisible] = useState(false);

  useEffect(() => {
    const t0 = setTimeout(() => setLogoVisible(true), 200);
    const t1 = setTimeout(() => setTitleStarted(true), 600);
    return () => { clearTimeout(t0); clearTimeout(t1); };
  }, []);

  const handleTitleFormed = useCallback(() => {
    setTitleFormed(true);
    setSubtitleStarted(true);
  }, []);

  const handleSubtitleFormed = useCallback(() => {
    setContentVisible(true);
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
          <div className="relative z-10 flex flex-col items-center w-full max-w-lg">
            <img
              src={logo}
              alt="Twin Matrix"
              className="w-12 h-12 mb-8"
              style={{
                opacity: logoVisible ? 1 : 0,
                transition: 'opacity 600ms ease-out',
              }}
            />

            <ParticleTitle
              text={t('welcome.title')}
              visible={titleStarted}
              onFormed={handleTitleFormed}
            />

            <div className="mt-5 w-full">
              <ParticleSubtitle
                text={t('welcome.subtitle')}
                visible={subtitleStarted}
                onFormed={handleSubtitleFormed}
              />
            </div>

            <div
              className="mt-10 w-full max-w-sm mx-auto"
              style={{
                opacity: contentVisible ? 1 : 0,
                transform: contentVisible ? 'translateY(0)' : 'translateY(16px)',
                transition: 'opacity 600ms ease-out, transform 600ms ease-out',
              }}
            >
              <div className="relative flex items-center pb-0">
                <input
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleConfirm()}
                  placeholder={t('welcome.placeholder')}
                  className="flex-1 bg-transparent border-none px-0 py-1 text-xl text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
                />
                <button
                  onClick={handleConfirm}
                  disabled={!isValid}
                  className={`ml-2 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                    isValid
                      ? 'text-foreground hover:bg-foreground/10'
                      : 'text-muted-foreground/30 cursor-not-allowed'
                  }`}
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <GlowLine />

              <p className="text-muted-foreground/50 text-xs text-center -mt-3">
                {t('welcome.hint')}
              </p>
            </div>
          </div>
        </div>
      </StepContent>
    </StepLayout>
  );
};
