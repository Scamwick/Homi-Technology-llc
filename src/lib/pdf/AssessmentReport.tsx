import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#0a1628',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2px solid #22d3ee',
    paddingBottom: 20,
  },
  logo: {
    fontSize: 32,
    color: '#22d3ee',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 15,
    borderLeft: '4px solid #22d3ee',
    paddingLeft: 10,
  },
  verdictBox: {
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  verdictReady: {
    backgroundColor: '#10b98120',
    border: '2px solid #10b981',
  },
  verdictNotYet: {
    backgroundColor: '#f59e0b20',
    border: '2px solid #f59e0b',
  },
  verdictText: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  verdictReadyText: {
    color: '#10b981',
  },
  verdictNotYetText: {
    color: '#f59e0b',
  },
  scoreGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  scoreCard: {
    width: '30%',
    padding: 15,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  scoreCyan: { color: '#22d3ee' },
  scoreEmerald: { color: '#34d399' },
  scoreYellow: { color: '#facc15' },
  insightBox: {
    padding: 15,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    marginBottom: 10,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 12,
    color: '#cbd5e1',
    lineHeight: 1.6,
  },
  recommendationList: {
    marginTop: 10,
  },
  recommendationItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22d3ee',
    marginTop: 5,
    marginRight: 10,
  },
  recommendationText: {
    fontSize: 12,
    color: '#cbd5e1',
    flex: 1,
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    borderTop: '1px solid #334155',
    paddingTop: 15,
  },
  footerText: {
    fontSize: 10,
    color: '#64748b',
  },
  dateText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 5,
  },
  compassContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  categoryScores: {
    marginTop: 15,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottom: '1px solid #334155',
  },
  categoryName: {
    fontSize: 12,
    color: '#cbd5e1',
  },
  categoryScore: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#22d3ee',
  },
})

interface AssessmentReportProps {
  assessment: {
    id: string
    decision_type: string
    financial_score: number
    emotional_score: number
    timing_score: number
    overall_score: number
    verdict: 'ready' | 'not_yet'
    financial_sub_scores?: {
      categories: Array<{ name: string; score: number }>
    }
    emotional_sub_scores?: {
      categories: Array<{ name: string; score: number }>
    }
    timing_sub_scores?: {
      categories: Array<{ name: string; score: number }>
    }
    insights?: {
      executive_summary: string
      financial_insight: string
      emotional_insight: string
      timing_insight: string
      recommendations: string[]
    }
    completed_at: string
  }
  userName: string
}

const decisionTypeLabels: Record<string, string> = {
  home_buying: 'Home Purchase Decision',
  career_change: 'Career Change Decision',
  investment: 'Investment Decision',
  business_launch: 'Business Launch Decision',
  major_purchase: 'Major Purchase Decision',
}

export function AssessmentReport({ assessment, userName }: AssessmentReportProps) {
  const decisionLabel = decisionTypeLabels[assessment.decision_type] || 'Decision Readiness Assessment'
  const isReady = assessment.verdict === 'ready'
  const completedDate = assessment.completed_at 
    ? new Date(assessment.completed_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : 'N/A'

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>HōMI</Text>
          <Text style={styles.subtitle}>The Emotionally Intelligent Decision OS</Text>
          <Text style={styles.dateText}>Prepared for: {userName}</Text>
          <Text style={styles.dateText}>Completed: {completedDate}</Text>
        </View>

        {/* Verdict */}
        <View style={styles.section}>
          <View style={[
            styles.verdictBox,
            isReady ? styles.verdictReady : styles.verdictNotYet
          ]}>
            <Text style={[
              styles.verdictText,
              isReady ? styles.verdictReadyText : styles.verdictNotYetText
            ]}>
              {isReady ? '✓ READY' : '⏳ NOT YET'}
            </Text>
            <Text style={{ fontSize: 14, color: '#94a3b8', textAlign: 'center', marginTop: 10 }}>
              {decisionLabel}
            </Text>
          </View>
        </View>

        {/* Overall Score */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overall Readiness Score</Text>
          <View style={{ alignItems: 'center', marginVertical: 15 }}>
            <Text style={{ fontSize: 64, fontWeight: 'bold', color: isReady ? '#10b981' : '#f59e0b' }}>
              {assessment.overall_score}%
            </Text>
          </View>
        </View>

        {/* Three Dimensions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Three Dimensions</Text>
          <View style={styles.scoreGrid}>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>Financial Reality</Text>
              <Text style={[styles.scoreValue, styles.scoreCyan]}>
                {assessment.financial_score}%
              </Text>
            </View>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>Emotional Truth</Text>
              <Text style={[styles.scoreValue, styles.scoreEmerald]}>
                {assessment.emotional_score}%
              </Text>
            </View>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>Perfect Timing</Text>
              <Text style={[styles.scoreValue, styles.scoreYellow]}>
                {assessment.timing_score}%
              </Text>
            </View>
          </View>
        </View>

        {/* Executive Summary */}
        {assessment.insights?.executive_summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Executive Summary</Text>
            <View style={styles.insightBox}>
              <Text style={styles.insightText}>
                {assessment.insights.executive_summary}
              </Text>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            HōMI — The Emotionally Intelligent Decision OS
          </Text>
          <Text style={styles.footerText}>
            This report is for informational purposes only and does not constitute financial advice.
          </Text>
        </View>
      </Page>

      {/* Second Page - Detailed Insights */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.logo}>HōMI</Text>
          <Text style={styles.subtitle}>Detailed Insights</Text>
        </View>

        {/* Financial Insight */}
        {assessment.insights?.financial_insight && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Financial Reality Analysis</Text>
            <View style={styles.insightBox}>
              <Text style={styles.insightText}>
                {assessment.insights.financial_insight}
              </Text>
            </View>
            {assessment.financial_sub_scores?.categories && (
              <View style={styles.categoryScores}>
                {assessment.financial_sub_scores.categories.map((cat, i) => (
                  <View key={i} style={styles.categoryRow}>
                    <Text style={styles.categoryName}>{cat.name}</Text>
                    <Text style={styles.categoryScore}>{cat.score}%</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Emotional Insight */}
        {assessment.insights?.emotional_insight && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emotional Truth Analysis</Text>
            <View style={styles.insightBox}>
              <Text style={styles.insightText}>
                {assessment.insights.emotional_insight}
              </Text>
            </View>
          </View>
        )}

        {/* Timing Insight */}
        {assessment.insights?.timing_insight && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Perfect Timing Analysis</Text>
            <View style={styles.insightBox}>
              <Text style={styles.insightText}>
                {assessment.insights.timing_insight}
              </Text>
            </View>
          </View>
        )}

        {/* Recommendations */}
        {assessment.insights?.recommendations && assessment.insights.recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            <View style={styles.recommendationList}>
              {assessment.insights.recommendations.map((rec, i) => (
                <View key={i} style={styles.recommendationItem}>
                  <View style={styles.bullet} />
                  <Text style={styles.recommendationText}>{rec}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Page 2 of 2 • Assessment ID: {assessment.id}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
