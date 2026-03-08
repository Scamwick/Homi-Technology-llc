/**
 * Monte Carlo Simulation Engine for HōMI
 * 
 * Runs thousands of financial simulations to predict outcomes
 * for major life decisions like home buying, career changes, etc.
 */

export interface SimulationParams {
  // Initial financial state
  initialSavings: number
  monthlyIncome: number
  monthlyExpenses: number
  currentDebt: number
  
  // Decision-specific parameters
  decisionType: 'home_buying' | 'career_change' | 'investment' | 'business_launch' | 'major_purchase'
  decisionCost: number // Down payment, startup cost, etc.
  
  // Time horizon
  yearsToSimulate: number
  
  // Market conditions
  inflationRate: number // Annual inflation (e.g., 0.03 for 3%)
  investmentReturnRate: number // Expected annual return (e.g., 0.07 for 7%)
  
  // Risk factors
  jobLossProbability: number // Probability of job loss per year
  jobLossDuration: number // Months without income if job lost
  
  // Lifestyle factors
  incomeGrowthRate: number // Annual income growth (e.g., 0.03 for 3%)
  expenseGrowthRate: number // Annual expense growth
  
  // Buffer preferences
  emergencyFundMonths: number // Target emergency fund in months of expenses
}

export interface SimulationResult {
  success: boolean // Whether the simulation ended positively
  finalNetWorth: number
  minNetWorth: number
  maxNetWorth: number
  bankruptcy: boolean
  emergencyFundDepleted: boolean
  monthsToDecision: number | null // How many months until decision is affordable
}

export interface MonteCarloResults {
  iterations: number
  successRate: number // Percentage of simulations that succeeded
  averageFinalNetWorth: number
  medianFinalNetWorth: number
  minFinalNetWorth: number
  maxFinalNetWorth: number
  bankruptcyRate: number
  emergencyFundDepletionRate: number
  probabilityOfAffordingIn1Year: number
  probabilityOfAffordingIn3Years: number
  probabilityOfAffordingIn5Years: number
  confidenceInterval: {
    lower: number // 5th percentile
    upper: number // 95th percentile
  }
  recommendation: 'proceed' | 'caution' | 'wait'
  riskLevel: 'low' | 'medium' | 'high'
  simulations: SimulationResult[]
}

// Default parameters based on historical data
const DEFAULT_PARAMS: Partial<SimulationParams> = {
  inflationRate: 0.03,
  investmentReturnRate: 0.07,
  jobLossProbability: 0.05, // 5% chance per year
  jobLossDuration: 6, // 6 months
  incomeGrowthRate: 0.03,
  expenseGrowthRate: 0.025,
  emergencyFundMonths: 6,
}

export class MonteCarloEngine {
  private params: SimulationParams
  private iterations: number

  constructor(params: SimulationParams, iterations: number = 10000) {
    this.params = { ...DEFAULT_PARAMS, ...params }
    this.iterations = iterations
  }

  /**
   * Run the Monte Carlo simulation
   */
  runSimulation(): MonteCarloResults {
    const simulations: SimulationResult[] = []

    for (let i = 0; i < this.iterations; i++) {
      const result = this.runSingleSimulation()
      simulations.push(result)
    }

    return this.aggregateResults(simulations)
  }

  /**
   * Run a single simulation iteration
   */
  private runSingleSimulation(): SimulationResult {
    const {
      initialSavings,
      monthlyIncome,
      monthlyExpenses,
      currentDebt,
      decisionCost,
      yearsToSimulate,
      investmentReturnRate,
      jobLossProbability,
      jobLossDuration,
      incomeGrowthRate,
      expenseGrowthRate,
      emergencyFundMonths,
    } = this.params

    let netWorth = initialSavings - currentDebt
    let minNetWorth = netWorth
    let maxNetWorth = netWorth
    let bankruptcy = false
    let emergencyFundDepleted = false
    let monthsToDecision: number | null = null
    let decisionMade = false

    const monthlyInvestmentReturn = Math.pow(1 + investmentReturnRate!, 1 / 12) - 1
    const monthlyIncomeGrowth = Math.pow(1 + incomeGrowthRate!, 1 / 12) - 1
    const monthlyExpenseGrowth = Math.pow(1 + expenseGrowthRate!, 1 / 12) - 1

    let currentIncome = monthlyIncome
    let currentExpenses = monthlyExpenses
    let monthsWithoutJob = 0

    for (let month = 1; month <= yearsToSimulate! * 12; month++) {
      // Apply monthly growth
      currentIncome *= (1 + monthlyIncomeGrowth)
      currentExpenses *= (1 + monthlyExpenseGrowth)

      // Job loss simulation (Poisson-like process)
      if (monthsWithoutJob === 0 && Math.random() < jobLossProbability! / 12) {
        monthsWithoutJob = jobLossDuration!
      }

      // Calculate monthly cash flow
      let monthlyIncomeActual = currentIncome
      if (monthsWithoutJob > 0) {
        monthlyIncomeActual = 0
        monthsWithoutJob--
      }

      const monthlySavings = monthlyIncomeActual - currentExpenses
      
      // Update net worth (savings + investment returns)
      if (netWorth > 0) {
        netWorth *= (1 + monthlyInvestmentReturn)
      }
      netWorth += monthlySavings

      // Track min/max
      minNetWorth = Math.min(minNetWorth, netWorth)
      maxNetWorth = Math.max(maxNetWorth, netWorth)

      // Check for bankruptcy
      if (netWorth < -50000) { // $50k in debt threshold
        bankruptcy = true
        break
      }

      // Check emergency fund depletion
      const emergencyFundTarget = currentExpenses * emergencyFundMonths!
      if (netWorth < emergencyFundTarget * 0.5) {
        emergencyFundDepleted = true
      }

      // Check if decision is affordable
      if (!decisionMade && netWorth >= decisionCost * 1.2) { // 20% buffer
        monthsToDecision = month
        decisionMade = true
        // Continue simulation to see long-term impact
      }
    }

    return {
      success: netWorth > 0 && !bankruptcy,
      finalNetWorth: netWorth,
      minNetWorth,
      maxNetWorth,
      bankruptcy,
      emergencyFundDepleted,
      monthsToDecision,
    }
  }

  /**
   * Aggregate results from all simulations
   */
  private aggregateResults(simulations: SimulationResult[]): MonteCarloResults {
    const successful = simulations.filter(s => s.success)
    const bankruptcies = simulations.filter(s => s.bankruptcy)
    const emergencyDepleted = simulations.filter(s => s.emergencyFundDepleted)
    
    const finalNetWorths = simulations.map(s => s.finalNetWorth).sort((a, b) => a - b)
    const monthsToDecisions = simulations
      .map(s => s.monthsToDecision)
      .filter((m): m is number => m !== null)

    const successRate = (successful.length / this.iterations) * 100
    const averageFinalNetWorth = finalNetWorths.reduce((a, b) => a + b, 0) / this.iterations
    const medianFinalNetWorth = finalNetWorths[Math.floor(this.iterations / 2)]
    
    // Percentiles
    const p5 = finalNetWorths[Math.floor(this.iterations * 0.05)]
    const p95 = finalNetWorths[Math.floor(this.iterations * 0.95)]

    // Probability of affording in X years
    const affordingIn1Year = monthsToDecisions.filter(m => m <= 12).length / this.iterations * 100
    const affordingIn3Years = monthsToDecisions.filter(m => m <= 36).length / this.iterations * 100
    const affordingIn5Years = monthsToDecisions.filter(m => m <= 60).length / this.iterations * 100

    // Determine recommendation and risk level
    let recommendation: 'proceed' | 'caution' | 'wait'
    let riskLevel: 'low' | 'medium' | 'high'

    if (successRate >= 90 && affordingIn1Year >= 70) {
      recommendation = 'proceed'
      riskLevel = 'low'
    } else if (successRate >= 70 && affordingIn3Years >= 50) {
      recommendation = 'caution'
      riskLevel = 'medium'
    } else {
      recommendation = 'wait'
      riskLevel = 'high'
    }

    return {
      iterations: this.iterations,
      successRate,
      averageFinalNetWorth,
      medianFinalNetWorth,
      minFinalNetWorth: Math.min(...finalNetWorths),
      maxFinalNetWorth: Math.max(...finalNetWorths),
      bankruptcyRate: (bankruptcies.length / this.iterations) * 100,
      emergencyFundDepletionRate: (emergencyDepleted.length / this.iterations) * 100,
      probabilityOfAffordingIn1Year: affordingIn1Year,
      probabilityOfAffordingIn3Years: affordingIn3Years,
      probabilityOfAffordingIn5Years: affordingIn5Years,
      confidenceInterval: {
        lower: p5,
        upper: p95,
      },
      recommendation,
      riskLevel,
      simulations,
    }
  }

  /**
   * Run sensitivity analysis by varying a single parameter
   */
  runSensitivityAnalysis(
    paramName: keyof SimulationParams,
    paramValues: number[]
  ): Array<{ value: number; results: MonteCarloResults }> {
    return paramValues.map(value => {
      const originalValue = this.params[paramName]
      this.params = { ...this.params, [paramName]: value }
      const results = this.runSimulation()
      this.params = { ...this.params, [paramName]: originalValue }
      return { value, results }
    })
  }
}

/**
 * Create simulation parameters from assessment data
 */
export function createParamsFromAssessment(
  assessmentData: {
    financial_score: number
    financial_sub_scores?: {
      categories: Array<{ name: string; score: number }>
    }
    decision_type: string
  },
  userInputs: {
    monthlyIncome: number
    monthlyExpenses: number
    currentSavings: number
    currentDebt: number
    targetAmount: number
  }
): SimulationParams {
  // Adjust risk parameters based on financial score
  const financialScore = assessmentData.financial_score
  
  // Higher financial score = lower job loss impact (better job security)
  const adjustedJobLossProbability = Math.max(0.02, 0.08 - (financialScore / 100) * 0.06)
  
  // Higher score = better investment returns (more financial savvy)
  const adjustedInvestmentReturn = 0.05 + (financialScore / 100) * 0.04

  return {
    initialSavings: userInputs.currentSavings,
    monthlyIncome: userInputs.monthlyIncome,
    monthlyExpenses: userInputs.monthlyExpenses,
    currentDebt: userInputs.currentDebt,
    decisionType: assessmentData.decision_type as any,
    decisionCost: userInputs.targetAmount,
    yearsToSimulate: 10,
    inflationRate: 0.03,
    investmentReturnRate: adjustedInvestmentReturn,
    jobLossProbability: adjustedJobLossProbability,
    jobLossDuration: Math.max(3, 9 - Math.floor(financialScore / 20)),
    incomeGrowthRate: 0.03,
    expenseGrowthRate: 0.025,
    emergencyFundMonths: 6,
  }
}
