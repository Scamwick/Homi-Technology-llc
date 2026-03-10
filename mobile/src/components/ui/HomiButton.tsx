import React from 'react'
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native'
import { colors, spacing, radius, font } from '@/theme'

type Variant = 'primary' | 'outline' | 'ghost'

interface Props {
  children: React.ReactNode
  onPress?: () => void
  variant?: Variant
  disabled?: boolean
  style?: ViewStyle
}

export function HomiButton({ children, onPress, variant = 'primary', disabled, style }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[styles.base, styles[variant], disabled && styles.disabled, style]}
    >
      <Text style={[styles.text, variant === 'primary' ? styles.textPrimary : styles.textOutline]}>
        {children}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.cyan,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.4,
  },
  text: {
    fontSize: font.sizes.base,
    fontWeight: font.weights.semibold,
  },
  textPrimary: {
    color: colors.bg0,
  },
  textOutline: {
    color: colors.text1,
  },
})
