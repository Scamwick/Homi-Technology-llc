import React from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { colors, spacing, radius, font } from '@/theme'
import { HomiCard, HomiText, HomiButton } from '@/components/ui'

const ENTRY_POINTS = [
  { title: 'Full Assessment',      desc: 'Complete 3-dimension readiness check',       accent: colors.cyan,    screen: 'WebView', url: '/assessments/new'  },
  { title: 'Emotional Deep-Dive',  desc: 'Quick emotional readiness check (6 questions)', accent: colors.emerald, screen: 'WebView', url: '/emotional'        },
  { title: 'Fingerprint',          desc: 'View your decision history trend',            accent: colors.yellow,  screen: 'WebView', url: '/fingerprint'      },
  { title: 'Certification',        desc: 'Check or share your readiness certificate',   accent: colors.amber,   screen: 'WebView', url: '/certification'    },
]

export function AssessmentScreen() {
  const navigation = useNavigation<any>()

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <HomiText variant="h3" style={{ marginBottom: spacing.xs }}>Assessments</HomiText>
        <HomiText variant="sm" style={{ marginBottom: spacing.xl }}>
          Measure your readiness across three dimensions.
        </HomiText>

        {ENTRY_POINTS.map((ep) => (
          <TouchableOpacity
            key={ep.title}
            onPress={() => navigation.navigate('WebView', { url: ep.url, title: ep.title })}
          >
            <HomiCard style={[styles.card, { borderLeftColor: ep.accent, borderLeftWidth: 3 }]}>
              <HomiText variant="body" bold style={{ color: colors.text1, marginBottom: 4 }}>{ep.title}</HomiText>
              <HomiText variant="sm">{ep.desc}</HomiText>
            </HomiCard>
          </TouchableOpacity>
        ))}

        <View style={styles.infoCard}>
          <HomiText variant="xs" style={{ marginBottom: spacing.sm, color: colors.cyan }}>HOW SCORING WORKS</HomiText>
          {[
            { label: 'Financial Readiness', pct: '35%', color: colors.emerald },
            { label: 'Emotional Alignment', pct: '35%', color: colors.cyan    },
            { label: 'Market Timing',       pct: '30%', color: colors.yellow  },
          ].map((d) => (
            <View key={d.label} style={styles.dimRow}>
              <HomiText variant="xs" style={{ flex: 1 }}>{d.label}</HomiText>
              <Text style={[styles.pct, { color: d.color }]}>{d.pct}</Text>
            </View>
          ))}
          <HomiText variant="xs" style={{ marginTop: spacing.md, color: colors.text3 }}>
            Score 65+ to unlock a READY verdict.
          </HomiText>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:     { flex: 1, backgroundColor: colors.bg0 },
  scroll:   { flex: 1 },
  content:  { padding: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.md },
  card:     { marginBottom: 0 },
  infoCard: { backgroundColor: colors.bg1, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginTop: spacing.md },
  dimRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  pct:      { fontSize: font.sizes.sm, fontWeight: font.weights.semibold, fontFamily: 'monospace' },
})
