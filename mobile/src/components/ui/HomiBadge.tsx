import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, spacing, radius, font } from '@/theme'

type Variant = 'emerald' | 'yellow' | 'cyan' | 'red' | 'default'

const variantStyles: Record<Variant, { bg: string; text: string; border: string }> = {
  emerald: { bg: 'rgba(52,211,153,0.10)', text: colors.emerald, border: 'rgba(52,211,153,0.25)' },
  yellow:  { bg: 'rgba(250,204,21,0.10)', text: colors.yellow,  border: 'rgba(250,204,21,0.25)' },
  cyan:    { bg: 'rgba(34,211,238,0.10)', text: colors.cyan,    border: 'rgba(34,211,238,0.25)' },
  red:     { bg: 'rgba(242,72,34,0.10)',  text: colors.crimson, border: 'rgba(242,72,34,0.25)'  },
  default: { bg: colors.bg2,             text: colors.text2,   border: colors.border            },
}

interface Props {
  children: React.ReactNode
  variant?: Variant
}

export function HomiBadge({ children, variant = 'default' }: Props) {
  const s = variantStyles[variant]
  return (
    <View style={[styles.badge, { backgroundColor: s.bg, borderColor: s.border }]}>
      <Text style={[styles.text, { color: s.text }]}>{children}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: font.sizes.xs,
    fontWeight: font.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
})
