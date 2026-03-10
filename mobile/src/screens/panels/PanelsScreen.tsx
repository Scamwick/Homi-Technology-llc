import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { colors, spacing, radius, font } from '@/theme'
import { HomiText } from '@/components/ui'

const PANELS = [
  { id: 'strategy', label: 'Strategy',  desc: 'Signal, Monte Carlo, Temporal Twin, Trinity',   accent: colors.cyan,    url: '/panels/strategy' },
  { id: 'mindful',  label: 'Mindful',   desc: 'Behavioral Genome, Emotional History',          accent: colors.emerald, url: '/panels/mindful'  },
  { id: 'command',  label: 'Command',   desc: 'Blind Budget, Certainty, Permissions, Reputation', accent: colors.yellow,  url: '/panels/command'  },
  { id: 'impulse',  label: 'Impulse',   desc: 'Real-Time Protection, Rebellion, Safety Margin', accent: colors.amber,   url: '/panels/impulse'  },
  { id: 'network',  label: 'Network',   desc: 'Network position, live feed, intelligence',     accent: colors.cyan,    url: '/panels/network'  },
  { id: 'outcomes', label: 'Outcomes',  desc: 'Score history, accuracy, feedback',             accent: colors.emerald, url: '/panels/outcomes' },
]

export function PanelsScreen() {
  const navigation = useNavigation<any>()

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <HomiText variant="h3" style={{ marginBottom: spacing.xs }}>Panels</HomiText>
        <HomiText variant="sm" style={{ marginBottom: spacing.xl }}>
          Your decision intelligence command center.
        </HomiText>

        {PANELS.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={styles.panel}
            onPress={() => navigation.navigate('WebView', { url: p.url, title: p.label })}
            activeOpacity={0.8}
          >
            <View style={[styles.accent, { backgroundColor: p.accent }]} />
            <View style={styles.panelContent}>
              <Text style={[styles.panelLabel, { color: p.accent }]}>{p.label}</Text>
              <HomiText variant="xs">{p.desc}</HomiText>
            </View>
            <Text style={[styles.arrow, { color: p.accent }]}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: colors.bg0 },
  scroll:       { flex: 1 },
  content:      { padding: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.md },
  panel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  accent:       { width: 4, alignSelf: 'stretch' },
  panelContent: { flex: 1, padding: spacing.lg },
  panelLabel:   { fontSize: font.sizes.md, fontWeight: font.weights.semibold, marginBottom: 4 },
  arrow:        { fontSize: 24, paddingRight: spacing.lg },
})
