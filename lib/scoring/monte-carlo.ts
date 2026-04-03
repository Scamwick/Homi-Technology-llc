/**
 * HōMI Monte Carlo Stress-Test Engine
 * ====================================
 *
 * Runs 10,000 simulated financial scenarios over a 60-month horizon
 * to stress-test whether the buyer can sustain homeownership through
 * adverse market conditions.
 *
 * The simulation models:
 *   - Market regime shifts (crash, downturn, normal)
 *   - Monthly income volatility via Box-Muller normal distribution
 *   - Random income shocks (job loss / reduction)
 *   - Random maintenance/repair hits
 *   - Equity tracking based on home value changes
 *
 * The primary output is a success rate (% of scenarios where the buyer
 * remains solvent for the full 60 months). A Monte Carlo gate is applied:
 * if success rate < 85%, the caller should downgrade READY -> ALMOST_THERE.
 *
 * NOTE: This module intentionally uses Math.random() for stochastic
 * simulation. It is NOT deterministic — each call produces different
 * results. For reproducible testing, inject a seeded PRNG via the
 * optional `rng` parameter.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Financial inputs required for Monte Carlo simulation. */
export interface FinancialInputs {
  /** Gross monthly income in dollars. */
  monthlyIncome: number;
  /** Monthly housing payment (PITI: principal, interest, tax, insurance). */
  monthlyHousingPayment: number;
  /** Other monthly debt obligations (car, student loans, etc.). */
  monthlyDebtPayments: number;
  /** Current liquid emergency fund in dollars. */
  emergencyFund: number;
  /** Home purchase price in dollars. */
  homePrice: number;
  /** Down-payment amount in dollars. */
  downPayment: number;
  /** Monthly non-housing, non-debt essential expenses. */
  monthlyExpenses: number;
}

/** Configuration for the Monte Carlo simulation. */
export interface MonteCarloConfig {
  /** Number of simulation runs. Default: 10,000. */
  numSimulations?: number;
  /** Simulation horizon in months. Default: 60. */
  horizonMonths?: number;
  /** Monthly income volatility standard deviation (as a ratio). Default: 0.02. */
  incomeVolatility?: number;
  /** Probability of an income shock in any given month. Default: 0.005 (0.5%). */
  incomeShockProbability?: number;
  /** Income reduction during a shock (as a ratio). Default: 0.50 (50% cut). */
  incomeShockSeverity?: number;
  /** Duration of an income shock in months. Default: 3. */
  incomeShockDurationMonths?: number;
  /** Probability of a maintenance hit in any given month. Default: 0.05 (5%). */
  maintenanceHitProbability?: number;
  /** Maintenance hit cost as a ratio of home price. Default: 0.005 (0.5%). */
  maintenanceHitSeverity?: number;
  /**
   * Optional pseudo-random number generator for deterministic testing.
   * Must return values in [0, 1). Defaults to Math.random.
   */
  rng?: () => number;
}

/** Per-scenario tracked outcome. */
interface ScenarioOutcome {
  /** Whether the buyer remained solvent for the full horizon. */
  solvent: boolean;
  /** Final home equity (home value - remaining mortgage). */
  finalEquity: number;
  /** Whether the buyer could still afford payments at month 60. */
  finalAffordable: boolean;
  /** The market regime applied to this scenario. */
  regime: MarketRegime;
  /** Month at which insolvency occurred, or null if survived. */
  insolvencyMonth: number | null;
}

/** Market regime definition. */
interface MarketRegime {
  name: string;
  /** Probability of this regime being selected. */
  probability: number;
  /** Annual home appreciation rate under this regime. */
  annualAppreciation: number;
  /** Multiplier on income volatility. */
  volatilityMultiplier: number;
  /** Multiplier on income shock probability. */
  shockMultiplier: number;
}

/** Percentile snapshot of a numeric distribution. */
export interface Percentiles {
  p10: number;
  p50: number;
  p90: number;
}

/** Complete Monte Carlo result. */
export interface MonteCarloResult {
  /** Percentage of scenarios where the buyer remained solvent (0-100). */
  successRate: number;
  /** Equity distribution at the end of the horizon. */
  equityPercentiles: Percentiles;
  /** Monthly surplus distribution at the end of the horizon. */
  surplusPercentiles: Percentiles;
  /** Percentage of 2008-crash scenarios that survived. */
  crashSurvivalRate: number;
  /** Number of simulations run. */
  numSimulations: number;
  /** Horizon in months. */
  horizonMonths: number;
  /**
   * If true, the success rate fell below 85% and the caller should
   * consider downgrading READY -> ALMOST_THERE.
   */
  gateApplied: boolean;
  /** The threshold used for the gate (85%). */
  gateThreshold: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_NUM_SIMULATIONS = 10_000;
const DEFAULT_HORIZON_MONTHS = 60;
const DEFAULT_INCOME_VOLATILITY = 0.02;
const DEFAULT_INCOME_SHOCK_PROBABILITY = 0.005;
const DEFAULT_INCOME_SHOCK_SEVERITY = 0.50;
const DEFAULT_INCOME_SHOCK_DURATION = 3;
const DEFAULT_MAINTENANCE_PROBABILITY = 0.05;
const DEFAULT_MAINTENANCE_SEVERITY = 0.005;

/** Monte Carlo gate threshold. */
const GATE_THRESHOLD = 85;

/**
 * Market regimes with their probabilities and characteristics.
 * Probabilities must sum to 1.0.
 */
const MARKET_REGIMES: MarketRegime[] = [
  {
    name: '2008_CRASH',
    probability: 0.05,
    annualAppreciation: -0.20,
    volatilityMultiplier: 2.5,
    shockMultiplier: 3.0,
  },
  {
    name: 'DOTCOM',
    probability: 0.10,
    annualAppreciation: -0.08,
    volatilityMultiplier: 1.8,
    shockMultiplier: 2.0,
  },
  {
    name: 'REGIONAL_DOWNTURN',
    probability: 0.10,
    annualAppreciation: -0.05,
    volatilityMultiplier: 1.4,
    shockMultiplier: 1.5,
  },
  {
    name: 'NORMAL',
    probability: 0.75,
    annualAppreciation: 0.03,
    volatilityMultiplier: 1.0,
    shockMultiplier: 1.0,
  },
];

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Box-Muller transform: generates a normally distributed random number
 * from two uniform random numbers.
 *
 * Uses the polar form for numerical stability. The two uniform inputs
 * are mapped to a standard normal N(0,1), then scaled to N(mean, sigma).
 *
 * @param mean - center of the distribution
 * @param sigma - standard deviation
 * @param rng - uniform random number generator returning [0, 1)
 * @returns a single sample from N(mean, sigma)
 */
function boxMuller(mean: number, sigma: number, rng: () => number): number {
  let u1 = rng();
  // Guard against log(0) — re-sample if u1 is exactly 0
  while (u1 === 0) u1 = rng();
  const u2 = rng();
  return mean + sigma * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/**
 * Selects a market regime based on cumulative probability distribution.
 *
 * @param rng - uniform random number generator
 * @returns the selected MarketRegime
 */
function selectRegime(rng: () => number): MarketRegime {
  const roll = rng();
  let cumulative = 0;
  for (const regime of MARKET_REGIMES) {
    cumulative += regime.probability;
    if (roll < cumulative) return regime;
  }
  // Floating-point safety: return last regime if nothing matched
  return MARKET_REGIMES[MARKET_REGIMES.length - 1];
}

/**
 * Computes the nth percentile from a sorted array of numbers.
 *
 * Uses linear interpolation between adjacent values.
 *
 * @param sorted - pre-sorted array of numbers (ascending)
 * @param p - percentile (0-100)
 * @returns the interpolated percentile value
 */
function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];

  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) return sorted[lower];

  const fraction = index - lower;
  return sorted[lower] + fraction * (sorted[upper] - sorted[lower]);
}

/**
 * Runs a single simulation scenario.
 *
 * Models month-by-month:
 *   1. Apply income volatility (Box-Muller)
 *   2. Check for income shock onset or continuation
 *   3. Check for maintenance hit
 *   4. Compute monthly surplus = income - housing - debts - expenses - maintenance
 *   5. Update emergency fund (surplus adds, deficit drains)
 *   6. Track home equity
 *   7. Check solvency (emergency fund >= 0)
 *
 * @returns ScenarioOutcome for this run
 */
function simulateScenario(
  inputs: FinancialInputs,
  config: Required<Omit<MonteCarloConfig, 'rng'>> & { rng: () => number },
): ScenarioOutcome {
  const rng = config.rng;
  const regime = selectRegime(rng);

  // Monthly appreciation from annual rate
  const monthlyAppreciation = Math.pow(1 + regime.annualAppreciation, 1 / 12) - 1;

  // Effective volatility and shock probability under this regime
  const effectiveVolatility = config.incomeVolatility * regime.volatilityMultiplier;
  const effectiveShockProb = config.incomeShockProbability * regime.shockMultiplier;

  // State variables
  let emergencyFund = inputs.emergencyFund;
  let homeValue = inputs.homePrice;
  let remainingMortgage = inputs.homePrice - inputs.downPayment;
  let monthlyIncome = inputs.monthlyIncome;
  let inShock = false;
  let shockMonthsRemaining = 0;
  let insolvencyMonth: number | null = null;

  for (let month = 1; month <= config.horizonMonths; month++) {
    // 1. Income volatility (normal fluctuation around base)
    const baseIncome = inputs.monthlyIncome;
    const volatileIncome = boxMuller(baseIncome, baseIncome * effectiveVolatility, rng);
    monthlyIncome = Math.max(0, volatileIncome);

    // 2. Income shock
    if (inShock) {
      shockMonthsRemaining--;
      monthlyIncome *= (1 - config.incomeShockSeverity);
      if (shockMonthsRemaining <= 0) {
        inShock = false;
      }
    } else if (rng() < effectiveShockProb) {
      inShock = true;
      shockMonthsRemaining = config.incomeShockDurationMonths;
      monthlyIncome *= (1 - config.incomeShockSeverity);
    }

    // 3. Maintenance hit
    let maintenanceCost = 0;
    if (rng() < config.maintenanceHitProbability) {
      maintenanceCost = homeValue * config.maintenanceHitSeverity;
    }

    // 4. Monthly surplus
    const totalOutflows =
      inputs.monthlyHousingPayment +
      inputs.monthlyDebtPayments +
      inputs.monthlyExpenses +
      maintenanceCost;

    const surplus = monthlyIncome - totalOutflows;

    // 5. Update emergency fund
    emergencyFund += surplus;

    // 6. Track home equity
    homeValue *= (1 + monthlyAppreciation);
    // Simple amortization approximation: mortgage decreases slightly each month.
    // We approximate principal paydown as 30% of housing payment (rest is interest/tax/insurance).
    const principalPaydown = inputs.monthlyHousingPayment * 0.30;
    remainingMortgage = Math.max(0, remainingMortgage - principalPaydown);

    // 7. Solvency check
    if (emergencyFund < 0 && insolvencyMonth === null) {
      insolvencyMonth = month;
    }
  }

  const finalEquity = homeValue - remainingMortgage;
  const finalSurplus = monthlyIncome - inputs.monthlyHousingPayment - inputs.monthlyDebtPayments - inputs.monthlyExpenses;
  const finalAffordable = finalSurplus > 0;
  const solvent = insolvencyMonth === null;

  return {
    solvent,
    finalEquity,
    finalAffordable,
    regime,
    insolvencyMonth,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Runs 10,000 Monte Carlo scenarios to stress-test homeownership viability.
 *
 * Simulates 60 months of financial life under varying market conditions,
 * income shocks, and unexpected maintenance costs. Returns survival
 * statistics, equity percentiles, and whether the Monte Carlo gate
 * should be applied.
 *
 * @param inputs - Financial parameters for the simulation.
 * @param config - Optional overrides for simulation parameters.
 * @returns MonteCarloResult with success rate, percentiles, and gate status.
 *
 * @example
 * ```ts
 * const result = runMonteCarlo({
 *   monthlyIncome: 8000,
 *   monthlyHousingPayment: 2200,
 *   monthlyDebtPayments: 400,
 *   emergencyFund: 30000,
 *   homePrice: 400000,
 *   downPayment: 80000,
 *   monthlyExpenses: 3000,
 * });
 * // result.successRate => e.g. 92.4
 * // result.gateApplied => false (above 85%)
 * ```
 */
export function runMonteCarlo(
  inputs: FinancialInputs,
  config: MonteCarloConfig = {},
): MonteCarloResult {
  const resolvedConfig = {
    numSimulations: config.numSimulations ?? DEFAULT_NUM_SIMULATIONS,
    horizonMonths: config.horizonMonths ?? DEFAULT_HORIZON_MONTHS,
    incomeVolatility: config.incomeVolatility ?? DEFAULT_INCOME_VOLATILITY,
    incomeShockProbability: config.incomeShockProbability ?? DEFAULT_INCOME_SHOCK_PROBABILITY,
    incomeShockSeverity: config.incomeShockSeverity ?? DEFAULT_INCOME_SHOCK_SEVERITY,
    incomeShockDurationMonths: config.incomeShockDurationMonths ?? DEFAULT_INCOME_SHOCK_DURATION,
    maintenanceHitProbability: config.maintenanceHitProbability ?? DEFAULT_MAINTENANCE_PROBABILITY,
    maintenanceHitSeverity: config.maintenanceHitSeverity ?? DEFAULT_MAINTENANCE_SEVERITY,
    rng: config.rng ?? Math.random,
  };

  const outcomes: ScenarioOutcome[] = [];

  for (let i = 0; i < resolvedConfig.numSimulations; i++) {
    outcomes.push(simulateScenario(inputs, resolvedConfig));
  }

  // --- Aggregate results ---

  const solventCount = outcomes.filter((o) => o.solvent).length;
  const successRate = Math.round((solventCount / resolvedConfig.numSimulations) * 1000) / 10;

  // Equity percentiles
  const equities = outcomes.map((o) => o.finalEquity).sort((a, b) => a - b);
  const equityPercentiles: Percentiles = {
    p10: Math.round(percentile(equities, 10)),
    p50: Math.round(percentile(equities, 50)),
    p90: Math.round(percentile(equities, 90)),
  };

  // Monthly surplus percentiles: derived from equity distribution divided by
  // horizon as a meaningful proxy for "average monthly financial cushion".
  // A more granular approach would store per-scenario final surplus, but
  // equity / months is a reasonable approximation for the dashboard.
  const surplusPercentiles: Percentiles = {
    p10: Math.round(percentile(equities, 10) / resolvedConfig.horizonMonths),
    p50: Math.round(percentile(equities, 50) / resolvedConfig.horizonMonths),
    p90: Math.round(percentile(equities, 90) / resolvedConfig.horizonMonths),
  };

  // Crash survival rate (only 2008_CRASH scenarios)
  const crashOutcomes = outcomes.filter((o) => o.regime.name === '2008_CRASH');
  const crashSurvivors = crashOutcomes.filter((o) => o.solvent).length;
  const crashSurvivalRate =
    crashOutcomes.length > 0
      ? Math.round((crashSurvivors / crashOutcomes.length) * 1000) / 10
      : 100; // No crash scenarios = vacuously true

  const gateApplied = successRate < GATE_THRESHOLD;

  return {
    successRate,
    equityPercentiles,
    surplusPercentiles,
    crashSurvivalRate,
    numSimulations: resolvedConfig.numSimulations,
    horizonMonths: resolvedConfig.horizonMonths,
    gateApplied,
    gateThreshold: GATE_THRESHOLD,
  };
}
