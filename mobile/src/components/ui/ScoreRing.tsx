import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import { colors, font } from '@/theme'

type Color = 'cyan' | 'emerald' | 'yellow' | 'amber' | 'crimson'

const colorMap: Record<Color, string> = {
  cyan:    colors.cyan,
  emerald: colors.emerald,
  yellow:  colors.yellow,
  amber:   colors.amber,
  crimson: colors.crimson,
}

interface Props {
  value: number
  size?: number
  color?: Color
  label?: string
}

export function ScoreRing({ value, size = 80, color = 'cyan', label }: Props) {
  const stroke     = colorMap[color]
  const strokeW    = size * 0.1
  const r          = (size - strokeW) / 2
  const circ       = 2 * Math.PI * r
  const offset     = circ - (Math.min(100, Math.max(0, value)) / 100) * circ

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={colors.bg2} strokeWidth={strokeW} fill="none"
        />
        <Circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={stroke} strokeWidth={strokeW} fill="none"
          strokeDasharray={`${circ} ${circ}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={{ fontSize: size * 0.26, fontWeight: font.weights.bold, color: stroke }}>{value}</Text>
      {label && <Text style={{ fontSize: size * 0.13, color: colors.text3, marginTop: 1 }}>{label}</Text>}
    </View>
  )
}
