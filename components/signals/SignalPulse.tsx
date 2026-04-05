'use client';

// ---------------------------------------------------------------------------
// SignalPulse — ambient background glow (CSS-only, GPU-accelerated)
//
// Renders a radial gradient circle that pulses in the given color. Designed
// to sit behind a ScoreOrb or on results pages for an atmospheric effect.
// Uses pure CSS animations (no JS animation loop) so it's composited on
// the GPU via `will-change: opacity`.
// ---------------------------------------------------------------------------

export interface SignalPulseProps {
  color: string;
  intensity?: number;   // 0-1, maps to max opacity
  speed?: 'slow' | 'medium' | 'fast';
  className?: string;
}

// ---------------------------------------------------------------------------
// Speed → CSS animation duration
// ---------------------------------------------------------------------------

const SPEED_MAP = {
  slow: '4s',
  medium: '2.5s',
  fast: '1.4s',
} as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SignalPulse({
  color,
  intensity = 0.5,
  speed = 'medium',
  className = '',
}: SignalPulseProps) {
  const clampedIntensity = Math.max(0, Math.min(1, intensity));
  const duration = SPEED_MAP[speed];

  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <div
        className="signal-pulse-glow absolute inset-0 rounded-full"
        style={
          {
            background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)`,
            willChange: 'opacity',
            '--pulse-max': clampedIntensity,
            '--pulse-min': clampedIntensity * 0.25,
            '--pulse-duration': duration,
          } as React.CSSProperties
        }
      />
      {/* Inline keyframes — self-contained, no global CSS needed */}
      <style>{`
        .signal-pulse-glow {
          animation: signalPulseBreath var(--pulse-duration) ease-in-out infinite;
        }
        @keyframes signalPulseBreath {
          0%, 100% { opacity: var(--pulse-min); }
          50%      { opacity: var(--pulse-max); }
        }
      `}</style>
    </div>
  );
}
