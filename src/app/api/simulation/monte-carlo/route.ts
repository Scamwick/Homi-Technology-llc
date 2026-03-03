import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { MonteCarloEngine, createParamsFromAssessment } from '@/lib/monte-carlo/engine'
import { z } from 'zod'

const simulationRequestSchema = z.object({
  assessmentId: z.string().uuid(),
  userInputs: z.object({
    monthlyIncome: z.number().positive(),
    monthlyExpenses: z.number().positive(),
    currentSavings: z.number().min(0),
    currentDebt: z.number().min(0).default(0),
    targetAmount: z.number().positive(),
  }),
  iterations: z.number().min(1000).max(50000).default(10000),
})

// POST /api/simulation/monte-carlo - Run Monte Carlo simulation
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = simulationRequestSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { assessmentId, userInputs, iterations } = validation.data

    // Get assessment data
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', assessmentId)
      .eq('user_id', user.id)
      .single()

    if (assessmentError || !assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      )
    }

    // Create simulation parameters
    const params = createParamsFromAssessment(
      {
        financial_score: assessment.financial_score || 50,
        financial_sub_scores: assessment.financial_sub_scores || undefined,
        decision_type: assessment.decision_type,
      },
      userInputs
    )

    // Run simulation
    const engine = new MonteCarloEngine(params, iterations)
    const results = engine.runSimulation()

    // Store simulation results
    const { error: storeError } = await supabase
      .from('simulation_results')
      .insert({
        user_id: user.id,
        assessment_id: assessmentId,
        simulation_type: 'monte_carlo',
        params: params as any,
        results: {
          successRate: results.successRate,
          averageFinalNetWorth: results.averageFinalNetWorth,
          medianFinalNetWorth: results.medianFinalNetWorth,
          minFinalNetWorth: results.minFinalNetWorth,
          maxFinalNetWorth: results.maxFinalNetWorth,
          bankruptcyRate: results.bankruptcyRate,
          emergencyFundDepletionRate: results.emergencyFundDepletionRate,
          probabilityOfAffordingIn1Year: results.probabilityOfAffordingIn1Year,
          probabilityOfAffordingIn3Years: results.probabilityOfAffordingIn3Years,
          probabilityOfAffordingIn5Years: results.probabilityOfAffordingIn5Years,
          confidenceInterval: results.confidenceInterval,
          recommendation: results.recommendation,
          riskLevel: results.riskLevel,
        },
      })

    if (storeError) {
      console.error('Error storing simulation results:', storeError)
    }

    // Return results (without raw simulation data to save bandwidth)
    return NextResponse.json({
      iterations: results.iterations,
      successRate: results.successRate,
      averageFinalNetWorth: results.averageFinalNetWorth,
      medianFinalNetWorth: results.medianFinalNetWorth,
      minFinalNetWorth: results.minFinalNetWorth,
      maxFinalNetWorth: results.maxFinalNetWorth,
      bankruptcyRate: results.bankruptcyRate,
      emergencyFundDepletionRate: results.emergencyFundDepletionRate,
      probabilityOfAffordingIn1Year: results.probabilityOfAffordingIn1Year,
      probabilityOfAffordingIn3Years: results.probabilityOfAffordingIn3Years,
      probabilityOfAffordingIn5Years: results.probabilityOfAffordingIn5Years,
      confidenceInterval: results.confidenceInterval,
      recommendation: results.recommendation,
      riskLevel: results.riskLevel,
    })
  } catch (error) {
    console.error('Error in POST /api/simulation/monte-carlo:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/simulation/monte-carlo - Get stored simulation results
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query params
    const { searchParams } = new URL(request.url)
    const assessmentId = searchParams.get('assessmentId')

    let query = supabase
      .from('simulation_results')
      .select('*')
      .eq('user_id', user.id)
      .eq('simulation_type', 'monte_carlo')
      .order('created_at', { ascending: false })

    if (assessmentId) {
      query = query.eq('assessment_id', assessmentId)
    }

    const { data: simulations, error } = await query.limit(10)

    if (error) {
      console.error('Error fetching simulations:', error)
      return NextResponse.json(
        { error: 'Failed to fetch simulations' },
        { status: 500 }
      )
    }

    return NextResponse.json({ simulations })
  } catch (error) {
    console.error('Error in GET /api/simulation/monte-carlo:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
