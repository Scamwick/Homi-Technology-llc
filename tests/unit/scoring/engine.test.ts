import { describe, it, expect } from 'vitest'
import {
  computeScore,
  type AssessmentInputs,
  MAX_FINANCIAL,
  MAX_EMOTIONAL,
  MAX_TIMING,
} from '@/lib/scoring/engine'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** A "perfect" input set that should yield the maximum score (100). */
const PERFECT_INPUTS: AssessmentInputs = {
  debtToIncomeRatio: 0.20,    // <= 28% => 10
  downPaymentPercent: 0.25,   // >= 20% => 10
  emergencyFundMonths: 8,     // >= 6   => 8
  creditScore: 780,           // >= 740 => 7
  lifeStability: 10,          // max => 9
  confidenceLevel: 10,        // max => 9
  partnerAlignment: 10,       // max => 9
  fomoLevel: 1,               // inverted max => 8
  timeHorizonMonths: 18,      // > 12 => 10
  savingsRate: 0.25,          // >= 20% => 10
  downPaymentProgress: 0.90,  // >= 80% => 10
}

/** A "worst-case" input set that should yield the minimum score. */
const WORST_INPUTS: AssessmentInputs = {
  debtToIncomeRatio: 0.50,    // > 43%  => 0
  downPaymentPercent: 0.02,   // < 5%   => 0
  emergencyFundMonths: 0.5,   // < 1    => 0
  creditScore: 550,           // < 660  => 0
  lifeStability: 1,           // min => 0
  confidenceLevel: 1,         // min => 0
  partnerAlignment: 1,        // min => 0
  fomoLevel: 10,              // inverted min => 0
  timeHorizonMonths: 1,       // < 3   => 2
  savingsRate: 0.02,          // < 5%  => 1
  downPaymentProgress: 0.10,  // < 25% => 1
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('computeScore', () => {
  it('produces expected output for the example in the docstring', () => {
    const result = computeScore({
      debtToIncomeRatio: 0.25,
      downPaymentPercent: 0.20,
      emergencyFundMonths: 6,
      creditScore: 750,
      lifeStability: 8,
      confidenceLevel: 7,
      partnerAlignment: 9,
      fomoLevel: 3,
      timeHorizonMonths: 18,
      savingsRate: 0.22,
      downPaymentProgress: 0.85,
    })

    // Financial: DTI 10 + DP 10 + EF 8 + Credit 7 = 35
    expect(result.financial.total).toBe(35)

    // Emotional: lifeStability slider=8 => floor((7/9)*9) = 7
    //            confidence slider=7 => floor((6/9)*9) = 6
    //            partner slider=9 => floor((8/9)*9) = 8
    //            fomo slider=3 => inverted=8 => floor((7/9)*8) = 6
    expect(result.emotional.lifeStability).toBe(7)
    expect(result.emotional.confidenceLevel).toBe(6)
    expect(result.emotional.partnerAlignment).toBe(8)
    expect(result.emotional.fomoCheck).toBe(6)
    expect(result.emotional.total).toBe(27)

    // Timing: horizon 10 + savings 10 + progress 10 = 30
    expect(result.timing.total).toBe(30)

    // Overall: 35 + 27 + 30 = 92
    expect(result.score).toBe(92)
    expect(result.verdict).toBe('READY')
  })

  it('scores 100 when all dimensions are at max', () => {
    const result = computeScore(PERFECT_INPUTS)

    expect(result.financial.total).toBe(MAX_FINANCIAL) // 35
    expect(result.emotional.total).toBe(MAX_EMOTIONAL) // 35
    expect(result.timing.total).toBe(MAX_TIMING)       // 30
    expect(result.score).toBe(100)
    expect(result.verdict).toBe('READY')
  })

  it('scores near 0 when all dimensions are at min', () => {
    const result = computeScore(WORST_INPUTS)

    // Financial: 0 + 0 + 0 + 0 = 0
    expect(result.financial.total).toBe(0)
    // Emotional: 0 + 0 + 0 + 0 = 0
    expect(result.emotional.total).toBe(0)
    // Timing: 2 + 1 + 1 = 4 (timing has non-zero minimums)
    expect(result.timing.total).toBe(4)

    expect(result.score).toBe(4)
    expect(result.verdict).toBe('NOT_YET')
  })

  it('redistributes partner alignment points for single user (null)', () => {
    const singleInputs: AssessmentInputs = {
      ...PERFECT_INPUTS,
      partnerAlignment: null,
    }

    const result = computeScore(singleInputs)

    // Partner alignment should be 0 and singleRedistribution should be true
    expect(result.emotional.partnerAlignment).toBe(0)
    expect(result.emotional.singleRedistribution).toBe(true)

    // Total emotional should still equal MAX_EMOTIONAL (35) since all
    // base scores are at max and 9 bonus points are redistributed
    expect(result.emotional.total).toBe(MAX_EMOTIONAL)

    // Overall score should still be 100
    expect(result.score).toBe(100)
  })
})

describe('verdict thresholds', () => {
  it('score >= 80 => READY', () => {
    // Financial: 35, Timing: 30, Emotional: 6+4+4+3 = 17 => total 82
    const result = computeScore({
      debtToIncomeRatio: 0.20,    // 10
      downPaymentPercent: 0.20,   // 10
      emergencyFundMonths: 6,     // 8
      creditScore: 740,           // 7
      lifeStability: 7,           // floor((6/9)*9) = 6
      confidenceLevel: 5,        // floor((4/9)*9) = 4
      partnerAlignment: 5,       // floor((4/9)*9) = 4
      fomoLevel: 6,              // inverted=5 => floor((4/9)*8) = 3
      timeHorizonMonths: 18,     // 10
      savingsRate: 0.20,         // 10
      downPaymentProgress: 0.85, // 10
    })

    expect(result.score).toBeGreaterThanOrEqual(80)
    expect(result.verdict).toBe('READY')
  })

  it('score in 65-79 => ALMOST_THERE', () => {
    // Financial: 35, Timing: 30, Emotional: 5+3+3+2 = 13 => total 78
    const result = computeScore({
      debtToIncomeRatio: 0.20,    // 10
      downPaymentPercent: 0.20,   // 10
      emergencyFundMonths: 6,     // 8
      creditScore: 740,           // 7
      lifeStability: 6,           // floor((5/9)*9) = 5
      confidenceLevel: 4,        // floor((3/9)*9) = 3
      partnerAlignment: 4,       // floor((3/9)*9) = 3
      fomoLevel: 7,              // inverted=4 => floor((3/9)*8) = 2
      timeHorizonMonths: 18,     // 10
      savingsRate: 0.20,         // 10
      downPaymentProgress: 0.85, // 10
    })

    expect(result.score).toBeLessThan(80)
    expect(result.score).toBeGreaterThanOrEqual(65)
    expect(result.verdict).toBe('ALMOST_THERE')
  })

  it('score exactly at boundary 65 => ALMOST_THERE', () => {
    // Financial: 35, Timing: 30, Emotional: 0+0+0+0 = 0 => total 65
    const result = computeScore({
      debtToIncomeRatio: 0.20,    // 10
      downPaymentPercent: 0.20,   // 10
      emergencyFundMonths: 6,     // 8
      creditScore: 740,           // 7
      lifeStability: 1,           // 0
      confidenceLevel: 1,        // 0
      partnerAlignment: 1,       // 0
      fomoLevel: 10,             // inverted => 0
      timeHorizonMonths: 18,     // 10
      savingsRate: 0.20,         // 10
      downPaymentProgress: 0.85, // 10
    })

    expect(result.score).toBe(65)
    expect(result.verdict).toBe('ALMOST_THERE')
  })

  it('score 64 => BUILD_FIRST', () => {
    // Financial: 10+10+5+7 = 32, Timing: 30, Emotional: 0 => total 62
    const result = computeScore({
      debtToIncomeRatio: 0.20,    // 10
      downPaymentPercent: 0.20,   // 10
      emergencyFundMonths: 4,     // 5
      creditScore: 740,           // 7
      lifeStability: 1,           // 0
      confidenceLevel: 1,        // 0
      partnerAlignment: 1,       // 0
      fomoLevel: 10,             // inverted => 0
      timeHorizonMonths: 18,     // 10
      savingsRate: 0.20,         // 10
      downPaymentProgress: 0.85, // 10
    })

    expect(result.score).toBeLessThan(65)
    expect(result.score).toBeGreaterThanOrEqual(50)
    expect(result.verdict).toBe('BUILD_FIRST')
  })

  it('score exactly at boundary 50 => BUILD_FIRST', () => {
    // Financial: 10+4+2+3 = 19, Timing: 30, Emotional: 0+1+0+0 = 1 => total 50
    const result = computeScore({
      debtToIncomeRatio: 0.20,    // 10
      downPaymentPercent: 0.06,   // 4
      emergencyFundMonths: 1,     // 2
      creditScore: 670,           // 3
      lifeStability: 1,           // 0
      confidenceLevel: 2,        // floor((1/9)*9) = 1
      partnerAlignment: 1,       // 0
      fomoLevel: 10,             // inverted => 0
      timeHorizonMonths: 18,     // 10
      savingsRate: 0.20,         // 10
      downPaymentProgress: 0.85, // 10
    })

    expect(result.score).toBe(50)
    expect(result.verdict).toBe('BUILD_FIRST')
  })

  it('score 49 => NOT_YET', () => {
    // Financial: 10+4+2+3 = 19, Timing: 30, Emotional: 0 => total 49
    const result = computeScore({
      debtToIncomeRatio: 0.20,    // 10
      downPaymentPercent: 0.06,   // 4
      emergencyFundMonths: 1,     // 2
      creditScore: 670,           // 3
      lifeStability: 1,           // 0
      confidenceLevel: 1,        // 0
      partnerAlignment: 1,       // 0
      fomoLevel: 10,             // inverted => 0
      timeHorizonMonths: 18,     // 10
      savingsRate: 0.20,         // 10
      downPaymentProgress: 0.85, // 10
    })

    expect(result.score).toBe(49)
    expect(result.verdict).toBe('NOT_YET')
  })
})
