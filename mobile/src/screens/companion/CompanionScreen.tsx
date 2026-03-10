import React from 'react'
import { View, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { colors, spacing } from '@/theme'
import { HomiText, HomiButton, HomiCard } from '@/components/ui'

const COMPANION_OPTIONS = [
  { label: 'AI Companion',   desc: 'Chat with your decision companion',   url: '/companion'   },
  { label: 'AI Coach',       desc: 'Score-aware coaching chat',           url: '/ai-coach'    },
  { label: 'AI Advisor',     desc: 'Deep Q&A with the HōMI advisor',     url: '/advisor'     },
  { label: 'Temporal Twin',  desc: 'Messages from your future self',      url: '/temporal-twin' },
  { label: 'Trinity Engine', desc: 'Advocate vs Skeptic vs Arbiter',     url: '/trinity'     },
]

export function CompanionScreen() {
  const navigation = useNavigation<any>()

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <HomiText variant="h3" style={{ marginBottom: spacing.xs }}>AI Companions</HomiText>
        <HomiText variant="sm" style={{ marginBottom: spacing.xl }}>
          Intelligent advisors for every stage of your decision.
        </HomiText>

        {COMPANION_OPTIONS.map((opt) => (
          <HomiCard key={opt.label} style={styles.card}>
            <HomiText variant="body" bold style={{ color: colors.text1, marginBottom: 4 }}>{opt.label}</HomiText>
            <HomiText variant="sm" style={{ marginBottom: spacing.md }}>{opt.desc}</HomiText>
            <HomiButton
              variant="outline"
              onPress={() => navigation.navigate('WebView', { url: opt.url, title: opt.label })}
            >
              Open
            </HomiButton>
          </HomiCard>
        ))}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.bg0 },
  content: { flex: 1, padding: spacing.xl, gap: spacing.md },
  card:    { },
})
