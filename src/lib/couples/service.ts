/**
 * Couples Mode Service
 * 
 * Manages partner relationships, joint assessments, and alignment analysis.
 */


export interface CoupleRelationship {
  id: string
  partnerAId: string
  partnerBId: string | null
  partnerAEmail: string
  partnerBEmail: string | null
  status: 'pending' | 'active' | 'dissolved'
  inviteToken: string
  createdAt: string
}

export interface CoupleAssessment {
  id: string
  coupleId: string
  partnerAAssessmentId: string
  partnerBAssessmentId: string | null
  decisionType: string
  combinedScore: number | null
  alignmentData: AlignmentData | null
  jointVerdict: 'both_ready' | 'one_not_yet' | 'both_not_yet' | null
  discussionPrompts: string[]
  createdAt: string
}

export interface AlignmentData {
  financial: DimensionAlignment
  emotional: DimensionAlignment
  timing: DimensionAlignment
}

export interface DimensionAlignment {
  scoreA: number
  scoreB: number
  gap: number
  alignmentLevel: 'strong' | 'moderate' | 'divergent'
}

/**
 * Calculate alignment between two partners' scores
 */
export function calculateAlignment(
  scoreA: number,
  scoreB: number
): DimensionAlignment {
  const gap = Math.abs(scoreA - scoreB)
  
  let alignmentLevel: DimensionAlignment['alignmentLevel']
  if (gap <= 10) {
    alignmentLevel = 'strong'
  } else if (gap <= 25) {
    alignmentLevel = 'moderate'
  } else {
    alignmentLevel = 'divergent'
  }

  return {
    scoreA,
    scoreB,
    gap,
    alignmentLevel,
  }
}

/**
 * Calculate overall alignment data for a couple
 */
export function calculateCoupleAlignment(
  partnerAScores: { financial: number; emotional: number; timing: number },
  partnerBScores: { financial: number; emotional: number; timing: number }
): AlignmentData {
  return {
    financial: calculateAlignment(partnerAScores.financial, partnerBScores.financial),
    emotional: calculateAlignment(partnerAScores.emotional, partnerBScores.emotional),
    timing: calculateAlignment(partnerAScores.timing, partnerBScores.timing),
  }
}

/**
 * Determine joint verdict based on individual verdicts
 */
export function determineJointVerdict(
  partnerAVerdict: 'ready' | 'not_yet',
  partnerBVerdict: 'ready' | 'not_yet'
): CoupleAssessment['jointVerdict'] {
  if (partnerAVerdict === 'ready' && partnerBVerdict === 'ready') {
    return 'both_ready'
  } else if (partnerAVerdict === 'not_yet' && partnerBVerdict === 'not_yet') {
    return 'both_not_yet'
  } else {
    return 'one_not_yet'
  }
}

/**
 * Generate discussion prompts based on alignment gaps
 */
export function generateDiscussionPrompts(
  alignmentData: AlignmentData,
  decisionType: string
): string[] {
  const prompts: string[] = []

  // Financial alignment prompts
  if (alignmentData.financial.alignmentLevel === 'divergent') {
    prompts.push(
      `You have a ${alignmentData.financial.gap}-point gap in financial readiness. What are your different assumptions about costs and affordability?`,
      `Discuss your emergency fund strategy. How many months of expenses should you have saved before ${decisionType.replace('_', ' ')}?`
    )
  } else if (alignmentData.financial.alignmentLevel === 'moderate') {
    prompts.push(
      `Your financial scores are close but not identical. What would it take for both of you to feel fully confident financially?`
    )
  }

  // Emotional alignment prompts
  if (alignmentData.emotional.alignmentLevel === 'divergent') {
    prompts.push(
      `There's a significant difference in your emotional readiness. Are you both making this decision for the same reasons?`,
      `One of you seems more confident than the other. What concerns need to be addressed?`
    )
  }

  // Timing alignment prompts
  if (alignmentData.timing.alignmentLevel === 'divergent') {
    prompts.push(
      `You disagree on timing. What would be the ideal timeline for each of you?`,
      `What external factors are influencing your sense of urgency or hesitation?`
    )
  }

  // General prompts
  if (prompts.length === 0) {
    prompts.push(
      `You're well-aligned! What's the next step in your ${decisionType.replace('_', ' ')} journey?`,
      `Discuss what "ready" means to each of you. Are your definitions the same?`
    )
  }

  return prompts.slice(0, 5)
}

/**
 * Calculate combined couple score
 */
export function calculateCombinedScore(
  partnerAScore: number,
  partnerBScore: number,
  alignmentData: AlignmentData
): number {
  // Average of both scores
  const averageScore = (partnerAScore + partnerBScore) / 2
  
  // Penalty for misalignment
  const avgGap = (
    alignmentData.financial.gap +
    alignmentData.emotional.gap +
    alignmentData.timing.gap
  ) / 3
  
  const alignmentPenalty = Math.min(avgGap * 0.5, 15)
  
  return Math.round(averageScore - alignmentPenalty)
}

/**
 * Generate invite token
 */
export function generateInviteToken(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}
