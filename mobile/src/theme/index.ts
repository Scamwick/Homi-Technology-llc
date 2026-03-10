export const colors = {
  // Backgrounds
  bg0:     '#0a1628',  // deepest navy
  bg1:     '#0f1f3d',  // surface-1
  bg2:     '#1a2d4a',  // surface-2
  bg3:     '#1e3256',  // surface-3
  border:  '#1e3a5f',  // surface-3

  // Brand
  cyan:    '#22d3ee',
  emerald: '#34d399',
  yellow:  '#facc15',
  amber:   '#fab633',
  crimson: '#f24822',

  // Text
  text1:   '#f1f5f9',  // primary
  text2:   '#94a3b8',  // secondary
  text3:   '#64748b',  // tertiary
  text4:   '#334155',  // muted

  // Glows
  cyanGlow:    'rgba(34, 211, 238, 0.08)',
  emeraldGlow: 'rgba(52, 211, 153, 0.08)',
  yellowGlow:  'rgba(250, 204, 21, 0.08)',
  amberGlow:   'rgba(250, 182, 51, 0.08)',
}

export const spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  xxl: 32,
  xxxl: 48,
}

export const radius = {
  sm:   8,
  md:   12,
  lg:   16,
  full: 9999,
}

export const font = {
  sizes: {
    xs:   11,
    sm:   12,
    base: 14,
    md:   16,
    lg:   18,
    xl:   20,
    xxl:  24,
    xxxl: 30,
  },
  weights: {
    normal:    '400' as const,
    medium:    '500' as const,
    semibold:  '600' as const,
    bold:      '700' as const,
  },
}
