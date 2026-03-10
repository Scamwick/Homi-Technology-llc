import React from 'react'
import { View, ViewStyle, StyleSheet } from 'react-native'
import { colors, spacing, radius } from '@/theme'

interface Props {
  children: React.ReactNode
  style?: ViewStyle
  accent?: string
}

export function HomiCard({ children, style, accent }: Props) {
  return (
    <View style={[styles.card, accent ? { borderLeftWidth: 3, borderLeftColor: accent } : null, style]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
})
