import React from 'react'
import { View, StyleSheet } from 'react-native'
import { colors, radius } from '@/theme'

type Color = 'cyan' | 'emerald' | 'yellow'

const colorMap: Record<Color, string> = {
  cyan:    colors.cyan,
  emerald: colors.emerald,
  yellow:  colors.yellow,
}

interface Props {
  value: number
  color?: Color
  height?: number
}

export function ProgressBar({ value, color = 'cyan', height = 6 }: Props) {
  const pct = `${Math.min(100, Math.max(0, value))}%` as `${number}%`
  return (
    <View style={[styles.track, { height }]}>
      <View style={[styles.fill, { width: pct, backgroundColor: colorMap[color], height }]} />
    </View>
  )
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.bg2,
    borderRadius: radius.full,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: radius.full,
  },
})
