import { DimensionType, DimensionScore } from '@/types/scoring'
import { ActionItem, Milestone } from '@/types/database'

/**
 * Generate a transformation path for NOT YET users
 */
export function generateTransformationPath(
  financial: DimensionScore,
  emotional: DimensionScore,
  timing: DimensionScore
): {
  targetDimension: DimensionType | 'all'
  actionItems: ActionItem[]
  milestones: Milestone[]
} {
  // Determine target dimension(s)
  const scores = [
    { dimension: 'financial' as DimensionType, score: financial.score },
    { dimension: 'emotional' as DimensionType, score: emotional.score },
    { dimension: 'timing' as DimensionType, score: timing.score },
  ]

  const lowestScore = scores.sort((a, b) => a.score - b.score)[0]
  const targetDimension = lowestScore.score < 50 ? lowestScore.dimension : 'all'

  // Generate action items based on weaknesses
  const actionItems: ActionItem[] = []
  const milestones: Milestone[] = []

  // Financial actions
  if (targetDimension === 'financial' || targetDimension === 'all') {
    if (financial.weaknesses.includes('liquidity')) {
      actionItems.push(createActionItem(
        'Build Emergency Fund',
        'Save 3-6 months of expenses in an accessible emergency fund. Start with $1,000 and build from there.',
        'financial',
        'liquidity',
        'medium',
        '3-6 months',
        [
          { title: 'Emergency Fund Calculator', url: 'https://www.nerdwallet.com/article/banking/emergency-fund-why-matters' },
          { title: 'High-Yield Savings Accounts', url: 'https://www.bankrate.com/banking/savings/best-high-yield-savings-accounts/' },
        ]
      ))
    }

    if (financial.weaknesses.includes('down_payment')) {
      actionItems.push(createActionItem(
        'Increase Down Payment Savings',
        'Set up automatic transfers to a dedicated home savings account. Aim to save at least 10-20% of your target home price.',
        'financial',
        'down_payment',
        'hard',
        '6-12 months',
        [
          { title: 'Down Payment Strategies', url: 'https://www.consumerfinance.gov/owning-a-home/' },
        ]
      ))
    }

    if (financial.weaknesses.includes('debt')) {
      actionItems.push(createActionItem(
        'Reduce High-Interest Debt',
        'Focus on paying off credit cards and high-interest loans. Consider debt consolidation or the avalanche method.',
        'financial',
        'debt',
        'hard',
        '6-12 months',
        [
          { title: 'Debt Payoff Calculator', url: 'https://www.creditkarma.com/calculators/debt-repayment' },
        ]
      ))
    }

    milestones.push(createMilestone(
      'Financial Foundation',
      'Achieve 70+ Financial Reality score',
      'financial',
      70,
      'You\'ve built a solid financial foundation! Your savings, debt management, and income stability are now at healthy levels.'
    ))
  }

  // Emotional actions
  if (targetDimension === 'emotional' || targetDimension === 'all') {
    if (emotional.weaknesses.includes('motivation')) {
      actionItems.push(createActionItem(
        'Clarify Your Why',
        'Journal about your true motivations for this decision. Are you doing this for yourself or external pressure?',
        'emotional',
        'motivation',
        'easy',
        '1-2 weeks',
        [
          { title: 'Decision-Making Framework', url: '#' },
        ]
      ))
    }

    if (emotional.weaknesses.includes('confidence')) {
      actionItems.push(createActionItem(
        'Build Decision Confidence',
        'Research and learn more about your decision. Knowledge breeds confidence.',
        'emotional',
        'confidence',
        'medium',
        '1-2 months',
        [
          { title: 'Home Buying Guide', url: '#' },
        ]
      ))
    }

    actionItems.push(createActionItem(
      'Discuss with Trusted Advisor',
      'Talk through your decision with a trusted friend, family member, or professional who can offer perspective.',
      'emotional',
      'support',
      'easy',
      '1-2 weeks',
      []
    ))

    milestones.push(createMilestone(
      'Emotional Readiness',
      'Achieve 70+ Emotional Truth score',
      'emotional',
      70,
      'You\'re emotionally prepared! Your motivations are clear and you have the confidence to move forward.'
    ))
  }

  // Timing actions
  if (targetDimension === 'timing' || targetDimension === 'all') {
    if (timing.weaknesses.includes('market')) {
      actionItems.push(createActionItem(
        'Monitor Market Conditions',
        'Set up alerts for interest rate changes and market trends in your target area.',
        'timing',
        'market',
        'easy',
        'Ongoing',
        [
          { title: 'Market Trends', url: '#' },
        ]
      ))
    }

    if (timing.weaknesses.includes('life_stability')) {
      actionItems.push(createActionItem(
        'Stabilize Life Changes',
        'Address any major life changes before proceeding. Ensure job stability and personal circumstances are settled.',
        'timing',
        'life_stability',
        'medium',
        '3-6 months',
        []
      ))
    }

    milestones.push(createMilestone(
      'Perfect Timing',
      'Achieve 70+ Perfect Timing score',
      'timing',
      70,
      'The timing is right! Market conditions, life circumstances, and external factors are aligned.'
    ))
  }

  // Add generic actions if list is short
  if (actionItems.length < 5) {
    actionItems.push(createActionItem(
      'Reassess in 30 Days',
      'Schedule time to retake the assessment and track your progress.',
      targetDimension === 'all' ? 'financial' : targetDimension,
      'tracking',
      'easy',
      '30 days',
      []
    ))
  }

  // Sort by difficulty
  const difficultyOrder = { easy: 0, medium: 1, hard: 2 }
  actionItems.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty])

  // Reassign order
  actionItems.forEach((item, index) => {
    item.order = index
  })

  return {
    targetDimension,
    actionItems,
    milestones,
  }
}

function createActionItem(
  title: string,
  description: string,
  dimension: DimensionType,
  category: string,
  difficulty: 'easy' | 'medium' | 'hard',
  estimatedDuration: string,
  resources: { title: string; url: string }[]
): ActionItem {
  return {
    id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title,
    description,
    dimension,
    category,
    difficulty,
    estimated_duration: estimatedDuration,
    resources,
    completed: false,
    completed_at: null,
    order: 0,
  }
}

function createMilestone(
  title: string,
  description: string,
  targetDimension: DimensionType,
  targetScore: number,
  celebrationMessage: string
): Milestone {
  return {
    id: `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title,
    description,
    target_dimension: targetDimension,
    target_score: targetScore,
    achieved: false,
    achieved_at: null,
    celebration_message: celebrationMessage,
  }
}
