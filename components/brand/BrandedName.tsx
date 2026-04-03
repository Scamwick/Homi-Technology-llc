'use client';

/**
 * BrandedName — Renders "HōMI" with per-letter brand colors inline.
 *
 * Brand spec: H=#22d3ee (cyan), ō=#34d399 (emerald), M=#facc15 (yellow), I=#22d3ee (cyan)
 * Use this in headlines and prominent display text. For body copy, plain text "HōMI" is fine.
 */
export function BrandedName({ className }: { className?: string }) {
  return (
    <span className={className} aria-label="HōMI">
      <span style={{ color: '#22d3ee' }}>H</span>
      <span style={{ color: '#34d399' }}>ō</span>
      <span style={{ color: '#facc15' }}>M</span>
      <span style={{ color: '#22d3ee' }}>I</span>
    </span>
  );
}
