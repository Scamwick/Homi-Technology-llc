/**
 * Trinity Engine - AI Three-Perspective Debate System
 * 
 * Simulates a debate between three AI personas:
 * - The Rationalist: Data-driven, logical analysis
 * - The Intuitive: Gut feelings, emotional intelligence
 * - The Pragmatist: Real-world constraints, practical concerns
 */

import { DimensionType } from '@/types/scoring'

export interface TrinityPerspective {
  id: 'rationalist' | 'intuitive' | 'pragmatist'
  name: string
  icon: string
  color: string
  stance: 'support' | 'oppose' | 'neutral'
  confidence: number // 0-100
  arguments: string[]
  concerns: string[]
  recommendation: string
}

export interface TrinityDebate {
  id: string
  assessmentId: string
  userId: string
  decisionType: string
  question: string
  context: {
    financialScore: number
    emotionalScore: number
    timingScore: number
    overallScore: number
    verdict: 'ready' | 'not_yet'
  }
  perspectives: TrinityPerspective[]
  synthesis: {
    consensus: string
    keyInsights: string[]
    actionItems: string[]
    confidenceLevel: number
  }
  createdAt: string
}

export interface GenerateDebateParams {
  assessmentId: string
  userId: string
  decisionType: string
  financialScore: number
  emotionalScore: number
  timingScore: number
  overallScore: number
  verdict: 'ready' | 'not_yet'
  financialSubScores?: {
    categories: Array<{ name: string; score: number }>
    strengths: string[]
    weaknesses: string[]
  }
  emotionalSubScores?: {
    categories: Array<{ name: string; score: number }>
    strengths: string[]
    weaknesses: string[]
  }
  timingSubScores?: {
    categories: Array<{ name: string; score: number }>
    strengths: string[]
    weaknesses: string[]
  }
  userQuestion?: string
}

// Perspective configurations
const PERSPECTIVE_CONFIGS = {
  rationalist: {
    name: 'The Rationalist',
    icon: '🧠',
    color: '#22d3ee', // cyan
    description: 'Data-driven analysis focused on numbers, trends, and logical outcomes',
  },
  intuitive: {
    name: 'The Intuitive',
    icon: '💫',
    color: '#a855f7', // purple
    description: 'Gut feelings, emotional intelligence, and subconscious patterns',
  },
  pragmatist: {
    name: 'The Pragmatist',
    icon: '🔧',
    color: '#f59e0b', // yellow
    description: 'Real-world constraints, practical concerns, and implementation details',
  },
}

/**
 * Generate a Trinity debate based on assessment data
 * This is a mock implementation that would be replaced with actual AI calls
 */
export async function generateTrinityDebate(
  params: GenerateDebateParams
): Promise<TrinityDebate> {
  const {
    financialScore,
    emotionalScore,
    timingScore,
    overallScore,
    verdict,
    financialSubScores,
    emotionalSubScores,
    timingSubScores,
    userQuestion,
  } = params

  // Generate perspectives based on scores
  const perspectives: TrinityPerspective[] = [
    generateRationalistPerspective(params),
    generateIntuitivePerspective(params),
    generatePragmatistPerspective(params),
  ]

  // Generate synthesis
  const synthesis = generateSynthesis(perspectives, params)

  return {
    id: `debate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    assessmentId: params.assessmentId,
    userId: params.userId,
    decisionType: params.decisionType,
    question: userQuestion || `Should I proceed with ${params.decisionType.replace('_', ' ')}?`,
    context: {
      financialScore,
      emotionalScore,
      timingScore,
      overallScore,
      verdict,
    },
    perspectives,
    synthesis,
    createdAt: new Date().toISOString(),
  }
}

function generateRationalistPerspective(params: GenerateDebateParams): TrinityPerspective {
  const { financialScore, timingScore, overallScore, verdict, financialSubScores } = params
  
  const arguments_: string[] = []
  const concerns: string[] = []
  let stance: 'support' | 'oppose' | 'neutral' = 'neutral'
  let confidence = 50

  // Financial analysis
  if (financialScore >= 75) {
    arguments_.push(`Strong financial foundation with a score of ${financialScore}%. Your savings rate and debt-to-income ratio are within healthy ranges.`)
    arguments_.push(`Financial modeling suggests you can absorb a 20% cost overrun without significant hardship.`)
  } else if (financialScore >= 50) {
    arguments_.push(`Financial position is adequate (${financialScore}%) but leaves limited margin for unexpected costs.`)
    concerns.push(`A 15% market downturn could strain your finances within 6 months.`)
  } else {
    concerns.push(`Financial score of ${financialScore}% indicates insufficient reserves. Probability of financial stress within 2 years: 68%.`)
    concerns.push(`Emergency fund covers less than 3 months of expenses.`)
  }

  // Timing analysis
  if (timingScore >= 70) {
    arguments_.push(`Market conditions and personal timing align favorably (${timingScore}%).`)
  } else {
    concerns.push(`Timing indicators suggest waiting 6-12 months could improve outcomes by 15-20%.`)
  }

  // Determine stance
  if (overallScore >= 80 && financialScore >= 70) {
    stance = 'support'
    confidence = Math.min(95, overallScore + 10)
  } else if (overallScore >= 60 && financialScore >= 60) {
    stance = 'neutral'
    confidence = overallScore
  } else {
    stance = 'oppose'
    confidence = 100 - overallScore
  }

  return {
    id: 'rationalist',
    name: PERSPECTIVE_CONFIGS.rationalist.name,
    icon: PERSPECTIVE_CONFIGS.rationalist.icon,
    color: PERSPECTIVE_CONFIGS.rationalist.color,
    stance,
    confidence,
    arguments: arguments_,
    concerns,
    recommendation: generateRationalistRecommendation(stance, params),
  }
}

function generateIntuitivePerspective(params: GenerateDebateParams): TrinityPerspective {
  const { emotionalScore, overallScore, verdict, emotionalSubScores } = params
  
  const arguments_: string[] = []
  const concerns: string[] = []
  let stance: 'support' | 'oppose' | 'neutral' = 'neutral'
  let confidence = 50

  // Emotional analysis
  if (emotionalScore >= 75) {
    arguments_.push(`High emotional readiness (${emotionalScore}%) indicates genuine motivation, not external pressure.`)
    arguments_.push(`Your confidence level and clarity of purpose suggest this decision aligns with your core values.`)
    arguments_.push(`Pattern analysis of your past decisions shows high emotional scores correlate with successful outcomes.`)
  } else if (emotionalScore >= 50) {
    arguments_.push(`Mixed emotional signals suggest some unresolved concerns that merit attention.`)
    concerns.push(`Ambivalence detected: 40% of responses indicated hesitation or uncertainty.`)
  } else {
    concerns.push(`Low emotional readiness (${emotionalScore}%) suggests this may be driven by external pressure or fear of missing out.`)
    concerns.push(`Your responses indicate 3x more anxiety-related keywords compared to confident decisions.`)
  }

  // Intuitive patterns
  if (emotionalSubScores?.strengths?.includes('motivation')) {
    arguments_.push(`Your intrinsic motivation score is strong—this appears to be internally driven.`)
  }
  if (emotionalSubScores?.weaknesses?.includes('confidence')) {
    concerns.push(`Confidence gaps may lead to second-guessing and decision paralysis.`)
  }

  // Determine stance
  if (emotionalScore >= 75) {
    stance = 'support'
    confidence = emotionalScore
  } else if (emotionalScore >= 55) {
    stance = 'neutral'
    confidence = 60
  } else {
    stance = 'oppose'
    confidence = 100 - emotionalScore
  }

  return {
    id: 'intuitive',
    name: PERSPECTIVE_CONFIGS.intuitive.name,
    icon: PERSPECTIVE_CONFIGS.intuitive.icon,
    color: PERSPECTIVE_CONFIGS.intuitive.color,
    stance,
    confidence,
    arguments: arguments_,
    concerns,
    recommendation: generateIntuitiveRecommendation(stance, params),
  }
}

function generatePragmatistPerspective(params: GenerateDebateParams): TrinityPerspective {
  const { financialScore, timingScore, overallScore, verdict, decisionType } = params
  
  const arguments_: string[] = []
  const concerns: string[] = []
  let stance: 'support' | 'oppose' | 'neutral' = 'neutral'
  let confidence = 50

  // Practical considerations by decision type
  const decisionConsiderations: Record<string, { pros: string[]; cons: string[] }> = {
    home_buying: {
      pros: [
        'Interest rates are within historical norms',
        'Rental costs may exceed mortgage payments in your area',
      ],
      cons: [
        'Closing costs, maintenance, and property taxes add 30-40% to monthly costs',
        'Selling within 5 years likely results in net loss due to transaction costs',
      ],
    },
    career_change: {
      pros: [
        'Skills gap can be bridged with 3-6 months of focused learning',
        'Your network shows 12+ contacts in target industry',
      ],
      cons: [
        'First 6 months in new role typically see 20-30% productivity dip',
        'Salary negotiations are weaker without direct experience',
      ],
    },
    investment: {
      pros: [
        'Dollar-cost averaging reduces timing risk',
        'Your risk tolerance profile supports this allocation',
      ],
      cons: [
        'Short-term volatility could trigger emotional selling',
        'Opportunity cost of not paying down debt first',
      ],
    },
    business_launch: {
      pros: [
        'Market research indicates viable customer segment',
        'Your skill set covers 70% of initial operational needs',
      ],
      cons: [
        'Most startups require 18-24 months to profitability',
        'Personal financial runway covers only 8 months at current burn rate',
      ],
    },
    major_purchase: {
      pros: [
        'Depreciation impact is manageable over 5+ year ownership',
        'Current deals/promotions may not repeat',
      ],
      cons: [
        'Warranty and maintenance costs often underestimated by 50%',
        'Resale value drops 20-30% in first year',
      ],
    },
  }

  const considerations = decisionConsiderations[decisionType] || { pros: [], cons: [] }
  arguments_.push(...considerations.pros)
  concerns.push(...considerations.cons)

  // Implementation readiness
  if (financialScore >= 70 && timingScore >= 60) {
    arguments_.push(`Implementation timeline of 3-6 months is realistic given your current position.`)
  } else {
    concerns.push(`Recommended preparation period: 6-12 months to strengthen financial position.`)
  }

  // Contingency planning
  arguments_.push(`You have 2-3 viable fallback options if primary plan encounters obstacles.`)
  
  if (financialScore < 60) {
    concerns.push(`Limited financial buffer reduces ability to pivot if initial approach fails.`)
  }

  // Determine stance
  if (overallScore >= 75 && financialScore >= 65) {
    stance = 'support'
    confidence = Math.min(90, overallScore)
  } else if (overallScore >= 60 && financialScore >= 55) {
    stance = 'neutral'
    confidence = 65
  } else {
    stance = 'oppose'
    confidence = 100 - overallScore + 10
  }

  return {
    id: 'pragmatist',
    name: PERSPECTIVE_CONFIGS.pragmatist.name,
    icon: PERSPECTIVE_CONFIGS.pragmatist.icon,
    color: PERSPECTIVE_CONFIGS.pragmatist.color,
    stance,
    confidence,
    arguments: arguments_,
    concerns,
    recommendation: generatePragmatistRecommendation(stance, params),
  }
}

function generateSynthesis(
  perspectives: TrinityPerspective[],
  params: GenerateDebateParams
): TrinityDebate['synthesis'] {
  const supporting = perspectives.filter(p => p.stance === 'support')
  const opposing = perspectives.filter(p => p.stance === 'oppose')
  const neutral = perspectives.filter(p => p.stance === 'neutral')

  let consensus = ''
  let confidenceLevel = 50

  if (supporting.length >= 2) {
    consensus = `Strong consensus to proceed. ${supporting.length} of 3 perspectives support this decision with high confidence.`
    confidenceLevel = Math.round(supporting.reduce((acc, p) => acc + p.confidence, 0) / supporting.length)
  } else if (opposing.length >= 2) {
    consensus = `Strong consensus to wait. ${opposing.length} of 3 perspectives recommend delaying this decision.`
    confidenceLevel = Math.round(opposing.reduce((acc, p) => acc + p.confidence, 0) / opposing.length)
  } else if (neutral.length >= 1) {
    consensus = 'Mixed signals. Proceed with caution and address identified concerns before moving forward.'
    confidenceLevel = 55
  } else {
    consensus = 'Perspectives are divided. Consider a phased approach or gather more information.'
    confidenceLevel = 50
  }

  // Extract key insights
  const keyInsights: string[] = []
  perspectives.forEach(p => {
    p.arguments.slice(0, 2).forEach(arg => keyInsights.push(`${p.icon} ${arg}`))
  })

  // Generate action items
  const actionItems: string[] = []
  
  if (params.financialScore < 70) {
    actionItems.push('Build emergency fund to cover 6 months of expenses')
  }
  if (params.emotionalScore < 70) {
    actionItems.push('Journal about your motivations and discuss with a trusted advisor')
  }
  if (params.timingScore < 70) {
    actionItems.push('Monitor market conditions and set up alerts for favorable changes')
  }
  
  // Add perspective-specific actions
  perspectives
    .filter(p => p.stance === 'oppose' || p.stance === 'neutral')
    .forEach(p => {
      p.concerns.slice(0, 1).forEach(concern => {
        actionItems.push(`Address: ${concern.substring(0, 60)}...`)
      })
    })

  return {
    consensus,
    keyInsights: keyInsights.slice(0, 5),
    actionItems: actionItems.slice(0, 5),
    confidenceLevel,
  }
}

function generateRationalistRecommendation(
  stance: TrinityPerspective['stance'],
  params: GenerateDebateParams
): string {
  if (stance === 'support') {
    return `The numbers support this decision. With a ${params.overallScore}% overall readiness score and strong financial metrics, the probability of a positive outcome is high. Proceed with standard risk management practices.`
  } else if (stance === 'neutral') {
    return `The data presents a mixed picture. While some indicators are positive, there are quantifiable risks that should be addressed. Consider a conditional approach with clear go/no-go triggers.`
  } else {
    return `Statistical analysis suggests waiting. The probability of financial stress or suboptimal outcomes exceeds acceptable thresholds. Recommend addressing key financial gaps first.`
  }
}

function generateIntuitiveRecommendation(
  stance: TrinityPerspective['stance'],
  params: GenerateDebateParams
): string {
  if (stance === 'support') {
    return `Your emotional readiness is genuine and strong. This appears to be an authentic desire rather than external pressure. Trust your intuition—it's well-calibrated for this decision.`
  } else if (stance === 'neutral') {
    return `There's internal conflict worth exploring. Part of you is ready, but another part has reservations. Take time to understand what's driving the hesitation before proceeding.`
  } else {
    return `Your intuition is signaling caution. The anxiety and uncertainty you're feeling are valid data points. This may not be the right decision—or the right time.`
  }
}

function generatePragmatistRecommendation(
  stance: TrinityPerspective['stance'],
  params: GenerateDebateParams
): string {
  if (stance === 'support') {
    return `Implementation is feasible with proper planning. Create a detailed timeline, budget for 20% cost overruns, and establish 2-3 fallback options. You're in a position to execute successfully.`
  } else if (stance === 'neutral') {
    return `Possible but risky. If you proceed, do so in phases with clear checkpoints. Build in more buffer than you think you need—things always take longer and cost more than expected.`
  } else {
    return `Practical obstacles outweigh benefits at this time. Focus on building your foundation first: increase savings, reduce debt, and improve timing factors. Reassess in 6-12 months.`
  }
}
