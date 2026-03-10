import React from 'react'
import { Text, TextStyle, StyleSheet } from 'react-native'
import { colors, font } from '@/theme'

type Variant = 'h1' | 'h2' | 'h3' | 'body' | 'sm' | 'xs' | 'mono'

interface Props {
  children: React.ReactNode
  variant?: Variant
  color?: string
  bold?: boolean
  style?: TextStyle
}

const variants: Record<Variant, TextStyle> = {
  h1:   { fontSize: font.sizes.xxxl, fontWeight: font.weights.bold,    color: colors.text1 },
  h2:   { fontSize: font.sizes.xxl,  fontWeight: font.weights.bold,    color: colors.text1 },
  h3:   { fontSize: font.sizes.xl,   fontWeight: font.weights.semibold, color: colors.text1 },
  body: { fontSize: font.sizes.base, fontWeight: font.weights.normal,  color: colors.text2 },
  sm:   { fontSize: font.sizes.sm,   fontWeight: font.weights.normal,  color: colors.text2 },
  xs:   { fontSize: font.sizes.xs,   fontWeight: font.weights.normal,  color: colors.text3 },
  mono: { fontSize: font.sizes.xs,   fontWeight: font.weights.normal,  color: colors.text3, fontFamily: 'monospace' },
}

export function HomiText({ children, variant = 'body', color, bold, style }: Props) {
  return (
    <Text style={[variants[variant], color ? { color } : null, bold ? { fontWeight: font.weights.bold } : null, style]}>
      {children}
    </Text>
  )
}
