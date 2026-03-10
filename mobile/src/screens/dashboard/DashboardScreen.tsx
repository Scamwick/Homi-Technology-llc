import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { colors, spacing, radius, font } from '@/theme'
import { HomiCard, HomiText, HomiBadge, HomiButton, ScoreRing, ProgressBar } from '@/components/ui'
import { supabase } from '@/lib/supabase'

export function DashboardScreen() {
  const [assessment, setAssessment] = useState<any>(null)
  const [loading, setLoading]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const navigation = useNavigation<any>()

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('assessments')
      .select('id, overall_score, emotional_score, financial_score, timing_score, verdict, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    setAssessment(data)
    setLoading(false)
    setRefreshing(false)
  }

  const onRefresh = () => { setRefreshing(true); fetchData() }

  const score    = assessment?.overall_score ?? 0
  const isReady  = assessment?.verdict === 'ready'
  const ringColor: 'emerald' | 'yellow' | 'amber' | 'crimson' =
    score >= 70 ? 'emerald' : score >= 55 ? 'yellow' : score >= 40 ? 'amber' : 'crimson'

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.cyan} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.wordmark}>
              <Text style={{ color: colors.cyan }}>H</Text>
              <Text style={{ color: colors.emerald }}>ō</Text>
              <Text style={{ color: colors.yellow }}>M</Text>
              <Text style={{ color: colors.cyan }}>I</Text>
            </Text>
            <HomiText variant="xs">Decision Intelligence</HomiText>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <View style={styles.avatar}>
              <HomiText variant="sm" bold>You</HomiText>
            </View>
          </TouchableOpacity>
        </View>

        {/* Score card */}
        {assessment ? (
          <HomiCard style={styles.scoreCard} accent={isReady ? colors.emerald : colors.yellow}>
            <View style={styles.scoreRow}>
              <ScoreRing value={score} size={88} color={ringColor} label="Score" />
              <View style={styles.scoreRight}>
                <HomiBadge variant={isReady ? 'emerald' : 'yellow'}>
                  {isReady ? 'READY' : 'NOT YET'}
                </HomiBadge>
                <View style={styles.dimensions}>
                  {[
                    { label: 'Financial',  value: assessment.financial_score ?? 0, color: 'emerald' as const },
                    { label: 'Emotional',  value: assessment.emotional_score  ?? 0, color: 'cyan'    as const },
                    { label: 'Timing',     value: assessment.timing_score     ?? 0, color: 'yellow'  as const },
                  ].map((d) => (
                    <View key={d.label} style={styles.dimension}>
                      <View style={styles.dimHeader}>
                        <HomiText variant="xs">{d.label}</HomiText>
                        <HomiText variant="xs" color={colors.text1} bold>{d.value}</HomiText>
                      </View>
                      <ProgressBar value={d.value} color={d.color} height={4} />
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </HomiCard>
        ) : (
          <HomiCard style={styles.emptyCard}>
            <HomiText variant="body" style={{ textAlign: 'center', marginBottom: spacing.lg }}>
              Complete your first assessment to unlock your HōMI Score.
            </HomiText>
            <HomiButton onPress={() => navigation.navigate('Assessment')}>
              Start Assessment
            </HomiButton>
          </HomiCard>
        )}

        {/* Quick actions */}
        <HomiText variant="xs" style={styles.sectionLabel}>QUICK ACTIONS</HomiText>
        <View style={styles.actions}>
          {[
            { label: 'Assessment',  tab: 'Assessment', accent: colors.cyan    },
            { label: 'AI Companion', tab: 'Companion',  accent: colors.emerald },
            { label: 'Panels',      tab: 'Panels',      accent: colors.yellow  },
            { label: 'Outcomes',    tab: 'Settings',    accent: colors.amber   },
          ].map((a) => (
            <TouchableOpacity
              key={a.label}
              style={[styles.actionBtn, { borderColor: a.accent + '40' }]}
              onPress={() => navigation.navigate(a.tab)}
            >
              <Text style={[styles.actionText, { color: a.accent }]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* New assessment CTA */}
        <HomiButton
          variant="outline"
          onPress={() => navigation.navigate('Assessment')}
          style={{ marginTop: spacing.md }}
        >
          New Assessment
        </HomiButton>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: colors.bg0 },
  scroll:       { flex: 1 },
  content:      { padding: spacing.xl, paddingBottom: spacing.xxxl },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  wordmark:     { fontSize: font.sizes.xxl, fontWeight: '700' },
  avatar:       { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.bg2, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  scoreCard:    { marginBottom: spacing.xl },
  scoreRow:     { flexDirection: 'row', gap: spacing.lg, alignItems: 'center' },
  scoreRight:   { flex: 1, gap: spacing.md },
  dimensions:   { gap: spacing.sm },
  dimension:    { gap: 4 },
  dimHeader:    { flexDirection: 'row', justifyContent: 'space-between' },
  emptyCard:    { marginBottom: spacing.xl, alignItems: 'center' },
  sectionLabel: { marginBottom: spacing.md, letterSpacing: 1 },
  actions:      { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  actionBtn:    { flex: 1, minWidth: '45%', backgroundColor: colors.bg1, borderWidth: 1, borderRadius: radius.sm, padding: spacing.md, alignItems: 'center' },
  actionText:   { fontSize: font.sizes.sm, fontWeight: font.weights.semibold },
})
