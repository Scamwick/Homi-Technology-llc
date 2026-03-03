/**
 * Behavioral Genome Engine
 * 
 * Tracks and analyzes user decision-making patterns across assessments
 * to provide insights about their behavioral tendencies.
 */

export interface BehavioralTrait {
  id: string
  name: string
  description: string
  score: number // 0-100
  trend: 'improving' | 'declining' | 'stable'
  history: Array<{ date: string; score: number }>
}

export interface DecisionPattern {
  type: 'risk_tolerance' | 'planning_horizon' | 'external_influence' | 'emotional_consistency' | 'financial_discipline'
  score: number
  label: string
  description: string
}

export interface BehavioralGenome {
  userId: string
  traits: BehavioralTrait[]
  patterns: DecisionPattern[]
  archetype: string
  archetypeDescription: string
  insights: string[]
  recommendations: string[]
  lastUpdated: string
}

// Archetype definitions based on trait combinations
const ARCHETYPES: Record<string, { name: string; description: string }> = {
  'analytical_planner': {
    name: 'The Analytical Planner',
    description: 'You approach decisions methodically, preferring data and thorough analysis. You rarely rush into things.',
  },
  'intuitive_dreamer': {
    name: 'The Intuitive Dreamer',
    description: 'You trust your gut and follow your heart. Your decisions are driven by passion and vision.',
  },
  'cautious_protector': {
    name: 'The Cautious Protector',
    description: 'You prioritize security and stability. You prefer to wait until conditions are just right.',
  },
  'bold_pioneer': {
    name: 'The Bold Pioneer',
    description: 'You embrace risk and opportunity. You\'re comfortable making decisions with incomplete information.',
  },
  'balanced_navigator': {
    name: 'The Balanced Navigator',
    description: 'You weigh logic and emotion equally. You adapt your approach based on the situation.',
  },
  'social_connector': {
    name: 'The Social Connector',
    description: 'You value others\' input and make decisions collaboratively. External opinions matter to you.',
  },
}

/**
 * Analyze behavioral patterns from assessment history
 */
export function analyzeBehavioralGenome(
  assessments: Array<{
    id: string
    decision_type: string
    financial_score: number
    emotional_score: number
    timing_score: number
    overall_score: number
    verdict: 'ready' | 'not_yet'
    created_at: string
    responses?: Array<{
      question_id: string
      dimension: string
      response_value: number | string
      response_metadata: { time_spent_ms: number; changes_made: number }
    }>
  }>
): BehavioralGenome {
  if (assessments.length === 0) {
    return generateDefaultGenome()
  }

  // Sort by date
  const sortedAssessments = [...assessments].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  // Calculate traits
  const traits = calculateTraits(sortedAssessments)

  // Calculate patterns
  const patterns = calculatePatterns(sortedAssessments)

  // Determine archetype
  const { archetype, archetypeDescription } = determineArchetype(traits, patterns)

  // Generate insights
  const insights = generateInsights(traits, patterns, sortedAssessments)

  // Generate recommendations
  const recommendations = generateRecommendations(traits, patterns)

  return {
    userId: '', // Will be set by caller
    traits,
    patterns,
    archetype,
    archetypeDescription,
    insights,
    recommendations,
    lastUpdated: new Date().toISOString(),
  }
}

function calculateTraits(assessments: typeof analyzeBehavioralGenome extends (...args: infer P) => any ? P[0] : never): BehavioralTrait[] {
  const traits: BehavioralTrait[] = []

  // Risk Tolerance Trait
  const riskScores = assessments.map(a => ({
    date: a.created_at,
    score: Math.round((a.financial_score + a.timing_score) / 2),
  }))
  traits.push({
    id: 'risk_tolerance',
    name: 'Risk Tolerance',
    description: 'Your comfort level with uncertainty and financial risk',
    score: riskScores[riskScores.length - 1]?.score || 50,
    trend: calculateTrend(riskScores.map(s => s.score)),
    history: riskScores,
  })

  // Emotional Consistency Trait
  const emotionalScores = assessments.map(a => ({
    date: a.created_at,
    score: a.emotional_score,
  }))
  traits.push({
    id: 'emotional_consistency',
    name: 'Emotional Consistency',
    description: 'How stable your emotional readiness is across decisions',
    score: emotionalScores[emotionalScores.length - 1]?.score || 50,
    trend: calculateTrend(emotionalScores.map(s => s.score)),
    history: emotionalScores,
  })

  // Planning Horizon Trait
  const planningScores = assessments.map(a => ({
    date: a.created_at,
    score: a.timing_score,
  }))
  traits.push({
    id: 'planning_horizon',
    name: 'Planning Horizon',
    description: 'Your ability to time decisions optimally',
    score: planningScores[planningScores.length - 1]?.score || 50,
    trend: calculateTrend(planningScores.map(s => s.score)),
    history: planningScores,
  })

  // Financial Discipline Trait
  const financialScores = assessments.map(a => ({
    date: a.created_at,
    score: a.financial_score,
  }))
  traits.push({
    id: 'financial_discipline',
    name: 'Financial Discipline',
    description: 'Your consistency in financial preparedness',
    score: financialScores[financialScores.length - 1]?.score || 50,
    trend: calculateTrend(financialScores.map(s => s.score)),
    history: financialScores,
  })

  // Decision Speed Trait (from response metadata if available)
  const speedScores = assessments
    .filter(a => a.responses && a.responses.length > 0)
    .map(a => {
      const avgTime = a.responses!.reduce((sum, r) => sum + r.response_metadata.time_spent_ms, 0) / a.responses!.length
      // Convert to score (faster = higher score, but not too fast)
      const score = Math.max(0, Math.min(100, 100 - (avgTime / 1000 - 5) * 5))
      return { date: a.created_at, score: Math.round(score) }
    })

  if (speedScores.length > 0) {
    traits.push({
      id: 'decision_speed',
      name: 'Decision Speed',
      description: 'How quickly you make decisions (without rushing)',
      score: speedScores[speedScores.length - 1]?.score || 50,
      trend: calculateTrend(speedScores.map(s => s.score)),
      history: speedScores,
    })
  }

  return traits
}

function calculatePatterns(assessments: typeof analyzeBehavioralGenome extends (...args: infer P) => any ? P[0] : never): DecisionPattern[] {
  const patterns: DecisionPattern[] = []

  // Risk Tolerance Pattern
  const avgFinancial = assessments.reduce((sum, a) => sum + a.financial_score, 0) / assessments.length
  const avgTiming = assessments.reduce((sum, a) => sum + a.timing_score, 0) / assessments.length
  const riskScore = Math.round((avgFinancial + avgTiming) / 2)

  patterns.push({
    type: 'risk_tolerance',
    score: riskScore,
    label: riskScore >= 70 ? 'High Risk Tolerance' : riskScore >= 50 ? 'Moderate Risk Tolerance' : 'Low Risk Tolerance',
    description: riskScore >= 70
      ? 'You\'re comfortable taking calculated risks and moving forward with uncertainty.'
      : riskScore >= 50
      ? 'You balance caution with opportunity, taking measured risks when appropriate.'
      : 'You prefer certainty and security, often waiting for ideal conditions.',
  })

  // Planning Horizon Pattern
  const avgTimingScore = assessments.reduce((sum, a) => sum + a.timing_score, 0) / assessments.length
  patterns.push({
    type: 'planning_horizon',
    score: Math.round(avgTimingScore),
    label: avgTimingScore >= 70 ? 'Long-term Planner' : avgTimingScore >= 50 ? 'Balanced Planner' : 'Short-term Focus',
    description: avgTimingScore >= 70
      ? 'You excel at long-term planning and timing decisions optimally.'
      : avgTimingScore >= 50
      ? 'You balance immediate needs with future considerations.'
      : 'You tend to focus on the present and near-term outcomes.',
  })

  // External Influence Pattern (based on emotional score variance)
  const emotionalScores = assessments.map(a => a.emotional_score)
  const emotionalVariance = calculateVariance(emotionalScores)
  const externalScore = Math.max(0, Math.min(100, 100 - emotionalVariance * 2))

  patterns.push({
    type: 'external_influence',
    score: Math.round(externalScore),
    label: externalScore >= 70 ? 'Internally Driven' : externalScore >= 50 ? 'Balanced Influence' : 'Externally Influenced',
    description: externalScore >= 70
      ? 'Your decisions are primarily driven by your own values and goals.'
      : externalScore >= 50
      ? 'You balance external input with your own judgment.'
      : 'External opinions and circumstances significantly influence your decisions.',
  })

  // Emotional Consistency Pattern
  const emotionalConsistency = 100 - calculateVariance(emotionalScores) * 3
  patterns.push({
    type: 'emotional_consistency',
    score: Math.round(Math.max(0, emotionalConsistency)),
    label: emotionalConsistency >= 70 ? 'Highly Consistent' : emotionalConsistency >= 50 ? 'Moderately Consistent' : 'Variable',
    description: emotionalConsistency >= 70
      ? 'Your emotional readiness is stable and predictable across decisions.'
      : emotionalConsistency >= 50
      ? 'Your emotional state varies somewhat depending on the decision.'
      : 'Your emotional readiness fluctuates significantly between decisions.',
  })

  // Financial Discipline Pattern
  const financialScores = assessments.map(a => a.financial_score)
  const financialTrend = calculateTrend(financialScores)
  const financialConsistency = 100 - calculateVariance(financialScores) * 2
  const disciplineScore = financialTrend === 'improving' 
    ? Math.min(100, financialConsistency + 10)
    : financialTrend === 'declining'
    ? Math.max(0, financialConsistency - 10)
    : financialConsistency

  patterns.push({
    type: 'financial_discipline',
    score: Math.round(disciplineScore),
    label: disciplineScore >= 70 ? 'Disciplined' : disciplineScore >= 50 ? 'Developing' : 'Needs Attention',
    description: disciplineScore >= 70
      ? 'You consistently maintain strong financial preparedness.'
      : disciplineScore >= 50
      ? 'Your financial discipline is improving with each assessment.'
      : 'Your financial readiness varies. Consider focusing on building stability.',
  })

  return patterns
}

function determineArchetype(traits: BehavioralTrait[], patterns: DecisionPattern[]): { archetype: string; archetypeDescription: string } {
  const riskTolerance = patterns.find(p => p.type === 'risk_tolerance')?.score || 50
  const emotionalConsistency = patterns.find(p => p.type === 'emotional_consistency')?.score || 50
  const externalInfluence = patterns.find(p => p.type === 'external_influence')?.score || 50
  const financialDiscipline = patterns.find(p => p.type === 'financial_discipline')?.score || 50

  // Determine archetype based on trait combinations
  let archetype: { name: string; description: string }
  if (riskTolerance >= 70 && financialDiscipline >= 70) {
    archetype = ARCHETYPES['bold_pioneer']
  } else if (riskTolerance < 50 && financialDiscipline >= 60) {
    archetype = ARCHETYPES['cautious_protector']
  } else if (externalInfluence < 50 && emotionalConsistency >= 60) {
    archetype = ARCHETYPES['social_connector']
  } else if (riskTolerance >= 60 && emotionalConsistency >= 60 && externalInfluence >= 50) {
    archetype = ARCHETYPES['balanced_navigator']
  } else if (emotionalConsistency >= 70 && externalInfluence >= 60) {
    archetype = ARCHETYPES['intuitive_dreamer']
  } else if (financialDiscipline >= 70 && emotionalConsistency >= 60) {
    archetype = ARCHETYPES['analytical_planner']
  } else {
    archetype = ARCHETYPES['balanced_navigator']
  }

  return {
    archetype: archetype.name,
    archetypeDescription: archetype.description,
  }
}

function generateInsights(traits: BehavioralTrait[], patterns: DecisionPattern[], assessments: typeof analyzeBehavioralGenome extends (...args: infer P) => any ? P[0] : never): string[] {
  const insights: string[] = []

  // Trend insights
  const improvingTraits = traits.filter(t => t.trend === 'improving')
  if (improvingTraits.length > 0) {
    insights.push(`Your ${improvingTraits.map(t => t.name).join(', ')} ${improvingTraits.length === 1 ? 'is' : 'are'} improving over time.`)
  }

  const decliningTraits = traits.filter(t => t.trend === 'declining')
  if (decliningTraits.length > 0) {
    insights.push(`Your ${decliningTraits.map(t => t.name).join(', ')} ${decliningTraits.length === 1 ? 'has' : 'have'} declined recently. Consider focusing on these areas.`)
  }

  // Pattern insights
  const readyAssessments = assessments.filter(a => a.verdict === 'ready').length
  const readyRate = assessments.length > 0 ? (readyAssessments / assessments.length) * 100 : 0

  if (readyRate >= 70) {
    insights.push('You frequently achieve READY status. You have a strong foundation for decision-making.')
  } else if (readyRate >= 40) {
    insights.push('You achieve READY status about half the time. There\'s room for improvement in your readiness.')
  } else {
    insights.push('You rarely achieve READY status. Focus on building your foundation across all three dimensions.')
  }

  // Dimension-specific insights
  const avgFinancial = assessments.reduce((sum, a) => sum + a.financial_score, 0) / assessments.length
  const avgEmotional = assessments.reduce((sum, a) => sum + a.emotional_score, 0) / assessments.length
  const avgTiming = assessments.reduce((sum, a) => sum + a.timing_score, 0) / assessments.length

  const lowestDimension = avgFinancial <= avgEmotional && avgFinancial <= avgTiming ? 'Financial Reality'
    : avgEmotional <= avgTiming ? 'Emotional Truth'
    : 'Perfect Timing'

  insights.push(`${lowestDimension} is your lowest-scoring dimension. This is where you can make the most improvement.`)

  return insights.slice(0, 5)
}

function generateRecommendations(traits: BehavioralTrait[], patterns: DecisionPattern[]): string[] {
  const recommendations: string[] = []

  // Trait-based recommendations
  const lowTraits = traits.filter(t => t.score < 50)
  lowTraits.forEach(trait => {
    recommendations.push(`Focus on improving your ${trait.name.toLowerCase()} through targeted exercises.`)
  })

  // Pattern-based recommendations
  const riskPattern = patterns.find(p => p.type === 'risk_tolerance')
  if (riskPattern && riskPattern.score < 50) {
    recommendations.push('Consider small, low-risk decisions to build your confidence before major ones.')
  }

  const emotionalPattern = patterns.find(p => p.type === 'emotional_consistency')
  if (emotionalPattern && emotionalPattern.score < 50) {
    recommendations.push('Practice mindfulness techniques to stabilize your emotional state during decisions.')
  }

  const financialPattern = patterns.find(p => p.type === 'financial_discipline')
  if (financialPattern && financialPattern.score < 50) {
    recommendations.push('Create a structured financial plan and track your progress regularly.')
  }

  return recommendations.slice(0, 5)
}

function calculateTrend(scores: number[]): 'improving' | 'declining' | 'stable' {
  if (scores.length < 2) return 'stable'

  const firstHalf = scores.slice(0, Math.floor(scores.length / 2))
  const secondHalf = scores.slice(Math.floor(scores.length / 2))

  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length

  const diff = secondAvg - firstAvg

  if (diff > 5) return 'improving'
  if (diff < -5) return 'declining'
  return 'stable'
}

function calculateVariance(scores: number[]): number {
  if (scores.length < 2) return 0

  const mean = scores.reduce((a, b) => a + b, 0) / scores.length
  const squaredDiffs = scores.map(score => Math.pow(score - mean, 2))
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / squaredDiffs.length

  return Math.sqrt(avgSquaredDiff)
}

function generateDefaultGenome(): BehavioralGenome {
  return {
    userId: '',
    traits: [],
    patterns: [],
    archetype: 'balanced_navigator',
    archetypeDescription: ARCHETYPES['balanced_navigator'].description,
    insights: ['Complete your first assessment to unlock your behavioral genome.'],
    recommendations: ['Take an assessment to get personalized recommendations.'],
    lastUpdated: new Date().toISOString(),
  }
}
