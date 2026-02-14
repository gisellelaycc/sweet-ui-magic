import { useEffect, useState } from 'react';

interface AnimatedTitleProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
}

/**
 * Word-by-word stagger reveal for step titles.
 * Each word slides up 20px and fades in with a 60ms stagger.
 * Subtitle fades in after the title finishes.
 */
export const AnimatedTitle = ({ title, subtitle, align = 'left' }: AnimatedTitleProps) => {
  const [visible, setVisible] = useState(false);
  const words = title.split(' ');

  useEffect(() => {
    // Trigger on mount after a micro-delay for the DOM to settle
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const totalTitleDuration = words.length * 60 + 400; // last word delay + animation duration

  return (
    <div className={align === 'center' ? 'text-center' : 'text-left'}>
      <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-2 overflow-hidden">
        {words.map((word, i) => (
          <span
            key={i}
            className="inline-block mr-[0.3em] last:mr-0"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(24px)',
              transition: `opacity 450ms ease-out ${i * 60}ms, transform 450ms ease-out ${i * 60}ms`,
            }}
          >
            {word}
          </span>
        ))}
      </h2>
      {subtitle && (
        <p
          className="text-muted-foreground text-sm"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(12px)',
            transition: `opacity 500ms ease-out ${totalTitleDuration}ms, transform 500ms ease-out ${totalTitleDuration}ms`,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};
