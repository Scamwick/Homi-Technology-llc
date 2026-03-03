import { 
  AssessmentResponse, 
  Question, 
  ScoringResult, 
  DimensionScore, 
  CategoryScore,
  QuestionScore,
  AssessmentInsights,
  ScoringMetadata,
  VerdictType,
  VERDICT_THRESHOLDS,
  DimensionType
} from '@/types/scoring'

/**
 * Main scoring engine for HōMI assessments
 * Pipeline: Response → Raw Score → Category Score → Dimension Score → Overall → Verdict
 */
export class ScoringEngine {
  private questions: Question[]
  private responses: AssessmentResponse[]
  private scoringVersion = '1.0.0'

  constructor(questions: Question[], responses: AssessmentResponse[]) {
    this.questions = questions
    this.responses = responses
  }

  /**
   * Run the complete scoring pipeline
   */
  calculateScores(): ScoringResult {
    const startTime = Date.now()

    // Group responses by dimension
    const responsesByDimension = this.groupResponsesByDimension()

    // Calculate dimension scores
    const financial = this.calculateDimensionScore('financial', responsesByDimension.financial)
    const emotional = this.calculateDimensionScore('emotional', responsesByDimension.emotional)
    const timing = this.calculateDimensionScore('timing', responsesByDimension.timing)

    // Calculate overall score with weights
    const overall = this.calculateOverallScore(financial, emotional, timing)

    // Determine verdict
    const verdict = this.determineVerdict(financial.score, emotional.score, timing.score, overall)

    // Calculate metadata
    const metadata: ScoringMetadata = {
      scoring_version: this.scoringVersion,
      scored_at: new Date().toISOString(),
      questions_answered: this.responses.length,
      questions_total: this.questions.length,
      consistency_bonus: this.calculateConsistencyBonus(financial.score, emotional.score, timing.score),
      red_flag_penalties: this.calculateRedFlagPenalties([financial, emotional, timing]),
    }

    // Generate insights
    const insights = this.generateInsights(financial, emotional, timing, verdict)

    return {
      financial,
      emotional,
      timing,
      overall,
      verdict,
      insights,
      metadata,
    }
  }

  /**
   * Group responses by dimension
   */
  private groupResponsesByDimension() {
    const grouped: Record<DimensionType, AssessmentResponse[]> = {
      financial: [],
      emotional: [],
      timing: [],
    }

    for (const response of this.responses) {
      if (grouped[response.dimension]) {
        grouped[response.dimension].push(response)
      }
    }

    return grouped
  }

  /**
   * Calculate score for a single dimension
   */
  private calculateDimensionScore(
    dimension: DimensionType,
    responses: AssessmentResponse[]
  ): DimensionScore {
    // Get questions for this dimension
    const dimensionQuestions = this.questions.filter(q => q.dimension === dimension)
    
    // Group by category
    const questionsByCategory = this.groupQuestionsByCategory(dimensionQuestions)
    
    // Calculate category scores
    const categories: CategoryScore[] = []
    const strengths: string[] = []
    const weaknesses: string[] = []
    const redFlags: string[] = []

    for (const [categoryName, questions] of Object.entries(questionsByCategory)) {
      const categoryResponses = responses.filter(r => 
        questions.some(q => q.id === r.question_id)
      )

      const questionScores: QuestionScore[] = []
      let categoryTotalWeight = 0
      let categoryWeightedScore = 0

      for (const question of questions) {
        const response = categoryResponses.find(r => r.question_id === question.id)
        
        if (response) {
          const score = this.scoreQuestion(question, response)
          questionScores.push({
            question_id: question.id,
            raw_value: response.response_value,
            score,
            weight: question.weight,
          })
          
          categoryWeightedScore += score * question.weight
          categoryTotalWeight += question.weight
        }
      }

      const categoryScore = categoryTotalWeight > 0
        ? categoryWeightedScore / categoryTotalWeight
        : 0

      categories.push({
        name: categoryName,
        score: Math.round(categoryScore),
        weight: questions.reduce((sum, q) => sum + q.weight, 0),
        questions: questionScores,
      })

      // Identify strengths and weaknesses
      if (categoryScore >= 80) {
        strengths.push(categoryName)
      } else if (categoryScore < 50) {
        weaknesses.push(categoryName)
      }

      // Check for red flags
      if (categoryScore < 30) {
        redFlags.push(`${categoryName}: Critical concern`)
      }
    }

    // Calculate overall dimension score
    const totalWeight = categories.reduce((sum, c) => sum + c.weight, 0)
    const weightedSum = categories.reduce((sum, c) => sum + c.score * c.weight, 0)
    const dimensionScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0

    return {
      dimension,
      score: dimensionScore,
      categories,
      strengths,
      weaknesses,
      red_flags: redFlags,
    }
  }

  /**
   * Group questions by category
   */
  private groupQuestionsByCategory(questions: Question[]): Record<string, Question[]> {
    const grouped: Record<string, Question[]> = {}
    
    for (const question of questions) {
      if (!grouped[question.category]) {
        grouped[question.category] = []
      }
      grouped[question.category].push(question)
    }
    
    return grouped
  }

  /**
   * Score a single question based on its scoring function
   */
  private scoreQuestion(question: Question, response: AssessmentResponse): number {
    const { type, params } = question.scoring_function
    const value = response.response_value

    switch (type) {
      case 'direct':
        // Direct mapping (e.g., slider 0-100)
        if (typeof value === 'number') {
          const min = (params.min as number) || 0
          const max = (params.max as number) || 100
          return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))
        }
        return 0

      case 'scaled':
        // Scaled mapping with optimal point
        if (typeof value === 'number') {
          const min = (params.min as number) || 0
          const max = (params.max as number) || 100
          const optimal = params.optimal as number | undefined
          
          if (optimal !== undefined) {
            // Distance from optimal (closer is better)
            const distance = Math.abs(value - optimal)
            const maxDistance = Math.max(optimal - min, max - optimal)
            return Math.max(0, 100 - (distance / maxDistance) * 100)
          }
          
          return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))
        }
        return 0

      case 'inverted':
        // Inverted scoring (lower is better)
        if (typeof value === 'number') {
          const min = (params.min as number) || 0
          const max = (params.max as number) || 100
          return 100 - Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))
        }
        return 0

      case 'lookup':
        // Lookup table scoring
        if (question.options) {
          const option = question.options.find(o => o.value === value)
          return option?.score ?? 0
        }
        return 0

      case 'multi_select':
        // Multi-select scoring
        if (Array.isArray(value) && question.options) {
          const baseScore = (params.base_score as number) || 100
          const penaltyPerItem = (params.penalty_per_item as number) || 0
          const bonusPerItem = (params.bonus_per_item as number) || 0
          
          let score = baseScore
          
          for (const selected of value) {
            const option = question.options.find(o => o.value === selected)
            if (option) {
              score += option.score
            }
          }
          
          return Math.min(100, Math.max(0, score))
        }
        return 0

      case 'threshold':
        // Threshold-based scoring
        if (typeof value === 'number') {
          const thresholds = params.thresholds as Array<{ min: number; max: number; score: number }>
          if (thresholds) {
            const match = thresholds.find(t => value >= t.min && value <= t.max)
            return match?.score ?? 0
          }
        }
        return 0

      default:
        return 0
    }
  }

  /**
   * Calculate overall score using dimension weights
   */
  private calculateOverallScore(
    financial: DimensionScore,
    emotional: DimensionScore,
    timing: DimensionScore
  ): number {
    const weights = VERDICT_THRESHOLDS.DIMENSION_WEIGHTS
    
    let overall = (
      financial.score * weights.financial +
      emotional.score * weights.emotional +
      timing.score * weights.timing
    )

    // Apply consistency bonus
    overall += this.calculateConsistencyBonus(financial.score, emotional.score, timing.score)

    // Apply red flag penalties
    const redFlagCount = 
      financial.red_flags.length + 
      emotional.red_flags.length + 
      timing.red_flags.length
    overall -= Math.min(
      redFlagCount * VERDICT_THRESHOLDS.RED_FLAG_PENALTY,
      VERDICT_THRESHOLDS.RED_FLAG_PENALTY_CAP
    )

    return Math.min(100, Math.max(0, Math.round(overall)))
  }

  /**
   * Determine verdict based on dimension scores
   */
  private determineVerdict(
    financial: number,
    emotional: number,
    timing: number,
    overall: number
  ): VerdictType {
    // All three dimensions must be >= 70 for READY
    const allDimensionsReady = 
      financial >= VERDICT_THRESHOLDS.DIMENSION_READY_THRESHOLD &&
      emotional >= VERDICT_THRESHOLDS.DIMENSION_READY_THRESHOLD &&
      timing >= VERDICT_THRESHOLDS.DIMENSION_READY_THRESHOLD

    return allDimensionsReady ? 'ready' : 'not_yet'
  }

  /**
   * Calculate consistency bonus (+3 if all dimensions within 10 points)
   */
  private calculateConsistencyBonus(
    financial: number,
    emotional: number,
    timing: number
  ): number {
    const max = Math.max(financial, emotional, timing)
    const min = Math.min(financial, emotional, timing)
    
    return max - min <= 10 ? VERDICT_THRESHOLDS.CONSISTENCY_BONUS : 0
  }

  /**
   * Calculate total red flag penalties
   */
  private calculateRedFlagPenalties(dimensions: DimensionScore[]): number {
    const redFlagCount = dimensions.reduce(
      (sum, d) => sum + d.red_flags.length,
      0
    )
    
    return Math.min(
      redFlagCount * VERDICT_THRESHOLDS.RED_FLAG_PENALTY,
      VERDICT_THRESHOLDS.RED_FLAG_PENALTY_CAP
    )
  }

  /**
   * Generate AI-style insights based on scores
   */
  private generateInsights(
    financial: DimensionScore,
    emotional: DimensionScore,
    timing: DimensionScore,
    verdict: VerdictType
  ): AssessmentInsights {
    const lowestDimension = this.getLowestDimension(financial, emotional, timing)
    
    return {
      executive_summary: this.generateExecutiveSummary(financial, emotional, timing, verdict),
      financial_insight: this.generateDimensionInsight('financial', financial),
      emotional_insight: this.generateDimensionInsight('emotional', emotional),
      timing_insight: this.generateDimensionInsight('timing', timing),
      recommendations: this.generateRecommendations(financial, emotional, timing),
      transformation_priority: verdict === 'not_yet' ? lowestDimension : null,
    }
  }

  /**
   * Get the lowest scoring dimension
   */
  private getLowestDimension(
    financial: DimensionScore,
    emotional: DimensionScore,
    timing: DimensionScore
  ): DimensionType {
    const scores = [
      { dimension: 'financial' as DimensionType, score: financial.score },
      { dimension: 'emotional' as DimensionType, score: emotional.score },
      { dimension: 'timing' as DimensionType, score: timing.score },
    ]
    
    return scores.sort((a, b) => a.score - b.score)[0].dimension
  }

  /**
   * Generate executive summary
   */
  private generateExecutiveSummary(
    financial: DimensionScore,
    emotional: DimensionScore,
    timing: DimensionScore,
    verdict: VerdictType
  ): string {
    if (verdict === 'ready') {
      return `Your assessment shows strong readiness across all three dimensions. ` +
        `Financial: ${financial.score}/100, Emotional: ${emotional.score}/100, ` +
        `Timing: ${timing.score}/100. You're in a good position to proceed with confidence.`
    } else {
      const lowest = this.getLowestDimension(financial, emotional, timing)
      return `Your assessment indicates you're not yet fully ready. ` +
        `Your ${lowest} dimension needs attention (score: ${
          lowest === 'financial' ? financial.score :
          lowest === 'emotional' ? emotional.score : timing.score
        }/100). Focus on strengthening this area before proceeding.`
    }
  }

  /**
   * Generate insight for a specific dimension
   */
  private generateDimensionInsight(
    dimension: DimensionType,
    score: DimensionScore
  ): string {
    const dimensionNames: Record<DimensionType, string> = {
      financial: 'Financial Reality',
      emotional: 'Emotional Truth',
      timing: 'Perfect Timing',
    }

    if (score.score >= 80) {
      return `Your ${dimensionNames[dimension]} is strong at ${score.score}/100. ` +
        `Key strengths: ${score.strengths.join(', ') || 'Overall solid foundation'}.`
    } else if (score.score >= 50) {
      return `Your ${dimensionNames[dimension]} at ${score.score}/100 shows room for improvement. ` +
        `Focus areas: ${score.weaknesses.join(', ') || 'General strengthening needed'}.`
    } else {
      return `Your ${dimensionNames[dimension]} at ${score.score}/100 needs significant attention. ` +
        `${score.red_flags.join('; ') || 'Critical areas require immediate focus'}.`
    }
  }

  /**
   * Generate personalized recommendations
   */
  private generateRecommendations(
    financial: DimensionScore,
    emotional: DimensionScore,
    timing: DimensionScore
  ): string[] {
    const recommendations: string[] = []

    // Financial recommendations
    if (financial.score < 70) {
      if (financial.weaknesses.includes('liquidity')) {
        recommendations.push('Build your emergency fund to at least 3-6 months of expenses')
      }
      if (financial.weaknesses.includes('down_payment')) {
        recommendations.push('Increase your down payment savings to at least 10-20%')
      }
      if (financial.weaknesses.includes('debt')) {
        recommendations.push('Focus on reducing high-interest debt before taking on new obligations')
      }
    }

    // Emotional recommendations
    if (emotional.score < 70) {
      recommendations.push('Take time to clarify your true motivations for this decision')
      recommendations.push('Discuss your plans with trusted friends or family for perspective')
    }

    // Timing recommendations
    if (timing.score < 70) {
      recommendations.push('Consider waiting for more favorable market conditions')
      recommendations.push('Ensure your personal life is stable before making major changes')
    }

    // Add generic recommendations if few specific ones
    if (recommendations.length < 3) {
      recommendations.push('Reassess in 30-90 days to track your progress')
    }

    return recommendations.slice(0, 5)
  }
}

/**
 * Helper function to score an assessment
 */
export function scoreAssessment(
  questions: Question[],
  responses: AssessmentResponse[]
): ScoringResult {
  const engine = new ScoringEngine(questions, responses)
  return engine.calculateScores()
}
