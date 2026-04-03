/**
 * Crisis Detection Engine
 * =======================
 *
 * The Safety Canon's first line of defense. Monitors user interaction
 * signals across three categories (behavioral, emotional, language) and
 * determines whether the user should be deflected to safety resources.
 *
 * Trigger rule: 2+ signals from 2+ DIFFERENT categories, each with
 * intensity > 50. This prevents false positives from a single noisy
 * dimension while still catching genuine multi-signal distress.
 *
 * This module is PURE — it evaluates signals but does not apply
 * cooldowns or deflections. Those side effects live in their own modules.
 */

import type {
  CrisisCategory,
  CrisisSignal,
  CrisisSignalType,
  CrisisResult,
  CrisisAction,
} from '@/types/safety';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Minimum intensity for a signal to count toward the trigger rule. */
const INTENSITY_THRESHOLD = 50;

/** Minimum number of qualifying signals required to trigger deflection. */
const MIN_SIGNALS = 2;

/** Minimum number of distinct categories those signals must span. */
const MIN_CATEGORIES = 2;

/** Default cooldown duration in hours when deflection is triggered. */
const COOLDOWN_HOURS = 24;

// ---------------------------------------------------------------------------
// Signal Generators — Behavioral
// ---------------------------------------------------------------------------

/**
 * Detects rapid answer changes during an assessment session.
 * A user who keeps changing their answers may be in distress or
 * "score chasing" rather than answering honestly.
 *
 * @param changeCount - Number of answer changes in the current session
 * @param sessionDurationMinutes - How long the session has been active
 * @returns Signal if detected, null otherwise
 */
export function detectRapidAnswerChanges(
  changeCount: number,
  sessionDurationMinutes: number,
): CrisisSignal | null {
  if (sessionDurationMinutes <= 0 || changeCount < 5) return null;

  const changesPerMinute = changeCount / sessionDurationMinutes;

  // More than 2 changes per minute is suspicious
  if (changesPerMinute <= 2) return null;

  // Intensity scales with frequency: 2/min = 55, 5/min = 85, capped at 95
  const intensity = Math.min(95, Math.round(40 + changesPerMinute * 10));

  return {
    category: 'behavioral',
    type: 'erratic_inputs',
    intensity,
    evidence: `${changeCount} answer changes in ${sessionDurationMinutes.toFixed(1)} minutes (${changesPerMinute.toFixed(1)}/min)`,
    detectedAt: new Date().toISOString(),
  };
}

/**
 * Detects extreme slider values — all sliders pushed to max or min.
 * This is a behavioral signal because it reflects HOW the user is
 * interacting, not necessarily what they feel.
 *
 * @param sliderValues - Array of raw slider values (1-10 scale)
 * @returns Signal if detected, null otherwise
 */
export function detectExtremeSliderValues(
  sliderValues: number[],
): CrisisSignal | null {
  if (sliderValues.length === 0) return null;

  const extremeCount = sliderValues.filter(v => v <= 1 || v >= 10).length;
  const extremeRatio = extremeCount / sliderValues.length;

  // More than 80% of sliders at extremes is concerning
  if (extremeRatio < 0.8) return null;

  const intensity = Math.min(90, Math.round(extremeRatio * 90));

  return {
    category: 'behavioral',
    type: 'score_chasing',
    intensity,
    evidence: `${extremeCount}/${sliderValues.length} sliders at extreme values`,
    detectedAt: new Date().toISOString(),
  };
}

/**
 * Detects session duration anomalies — either dangerously fast (rushing)
 * or excessively long (obsessing).
 *
 * @param sessionDurationMinutes - Current session length
 * @param expectedMinMinutes - Minimum expected duration for the flow
 * @param expectedMaxMinutes - Maximum expected duration for the flow
 * @returns Signal if detected, null otherwise
 */
export function detectSessionAnomaly(
  sessionDurationMinutes: number,
  expectedMinMinutes: number = 3,
  expectedMaxMinutes: number = 60,
): CrisisSignal | null {
  if (
    sessionDurationMinutes >= expectedMinMinutes &&
    sessionDurationMinutes <= expectedMaxMinutes
  ) {
    return null;
  }

  const isTooFast = sessionDurationMinutes < expectedMinMinutes;
  const type: CrisisSignalType = isTooFast ? 'rapid_reassessment' : 'obsessive_checking';

  // Intensity: how far outside the expected range
  let intensity: number;
  if (isTooFast) {
    // Completed in under 1 minute = very suspicious
    intensity = Math.min(85, Math.round(70 * (1 - sessionDurationMinutes / expectedMinMinutes)));
  } else {
    // 2x expected max = moderate, 4x = high
    const overRatio = sessionDurationMinutes / expectedMaxMinutes;
    intensity = Math.min(80, Math.round(30 + overRatio * 12));
  }

  return {
    category: 'behavioral',
    type,
    intensity,
    evidence: isTooFast
      ? `Session completed in ${sessionDurationMinutes.toFixed(1)} min (expected >= ${expectedMinMinutes} min)`
      : `Session active for ${sessionDurationMinutes.toFixed(1)} min (expected <= ${expectedMaxMinutes} min)`,
    detectedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Signal Generators — Emotional
// ---------------------------------------------------------------------------

/**
 * Detects the dangerous FOMO + low confidence combination.
 * High external pressure to buy combined with low self-confidence
 * is one of the strongest predictors of a regrettable decision.
 *
 * @param fomoLevel - FOMO slider (1-10, higher = more pressure)
 * @param confidenceLevel - Confidence slider (1-10, higher = more confident)
 * @returns Signal if detected, null otherwise
 */
export function detectFomoConfidenceConflict(
  fomoLevel: number,
  confidenceLevel: number,
): CrisisSignal | null {
  // Trigger when FOMO is high (>= 7) AND confidence is low (<= 3)
  if (fomoLevel < 7 || confidenceLevel > 3) return null;

  // Intensity scales with the gap
  const gap = fomoLevel - confidenceLevel;
  const intensity = Math.min(95, Math.round(45 + gap * 6));

  return {
    category: 'emotional',
    type: 'fomo_crisis',
    intensity,
    evidence: `FOMO=${fomoLevel}/10, Confidence=${confidenceLevel}/10 (gap=${gap})`,
    detectedAt: new Date().toISOString(),
  };
}

/**
 * Detects panic buying signals — very short timeline combined with
 * high emotional urgency indicators.
 *
 * @param fomoLevel - FOMO slider (1-10)
 * @param timeHorizonMonths - Planned months until purchase
 * @param confidenceLevel - Confidence slider (1-10)
 * @returns Signal if detected, null otherwise
 */
export function detectPanicBuying(
  fomoLevel: number,
  timeHorizonMonths: number,
  confidenceLevel: number,
): CrisisSignal | null {
  // Trigger: FOMO >= 8, timeline < 2 months, confidence <= 4
  if (fomoLevel < 8 || timeHorizonMonths >= 2 || confidenceLevel > 4) return null;

  const intensity = Math.min(90, Math.round(60 + (10 - confidenceLevel) * 4));

  return {
    category: 'emotional',
    type: 'panic_buying_signal',
    intensity,
    evidence: `FOMO=${fomoLevel}/10, Timeline=${timeHorizonMonths} months, Confidence=${confidenceLevel}/10`,
    detectedAt: new Date().toISOString(),
  };
}

/**
 * Detects extreme low confidence as a standalone emotional signal.
 *
 * @param confidenceLevel - Confidence slider (1-10)
 * @param lifeStability - Life stability slider (1-10)
 * @returns Signal if detected, null otherwise
 */
export function detectExtremeLowConfidence(
  confidenceLevel: number,
  lifeStability: number,
): CrisisSignal | null {
  // Both very low = emotional distress signal
  if (confidenceLevel > 2 || lifeStability > 2) return null;

  const intensity = Math.min(85, Math.round(60 + (4 - confidenceLevel - lifeStability) * 8));

  return {
    category: 'emotional',
    type: 'extreme_low_confidence',
    intensity,
    evidence: `Confidence=${confidenceLevel}/10, Life Stability=${lifeStability}/10`,
    detectedAt: new Date().toISOString(),
  };
}

/**
 * Detects partner conflict signals — large gap between partner alignment
 * and user confidence, suggesting external relationship pressure.
 *
 * @param partnerAlignment - Partner alignment slider (1-10), null if single
 * @param confidenceLevel - Confidence slider (1-10)
 * @returns Signal if detected, null otherwise
 */
export function detectPartnerConflict(
  partnerAlignment: number | null,
  confidenceLevel: number,
): CrisisSignal | null {
  if (partnerAlignment === null) return null;

  // Partner very misaligned (low) while user confidence also low
  if (partnerAlignment > 3 || confidenceLevel > 4) return null;

  const intensity = Math.min(80, Math.round(50 + (6 - partnerAlignment) * 6));

  return {
    category: 'emotional',
    type: 'partner_conflict_indicator',
    intensity,
    evidence: `Partner Alignment=${partnerAlignment}/10, Confidence=${confidenceLevel}/10`,
    detectedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Signal Generators — Language (Placeholders for AI Coach Integration)
// ---------------------------------------------------------------------------

/**
 * Placeholder: Detects distress language in free-text input.
 * Will be implemented when the AI coach integration is built.
 *
 * @param _text - Free-text input from the user
 * @returns Signal if detected, null otherwise
 */
export function detectDistressLanguage(
  _text: string,
): CrisisSignal | null {
  // TODO: Implement NLP-based distress detection when AI coach is integrated.
  // This will use a classification model to detect:
  // - Financial desperation language ("I have no choice", "can't afford to wait")
  // - Relationship crisis language ("they'll leave if I don't", "ultimatum")
  // - Self-harm indicators (route to 988 immediately)
  // - General distress markers (catastrophizing, hopelessness)
  //
  // For now, this is a no-op placeholder. The crisis detection engine
  // still functions correctly using behavioral and emotional signals alone.
  return null;
}

// ---------------------------------------------------------------------------
// Core Detection Engine
// ---------------------------------------------------------------------------

/**
 * Aggregates all available signals from user inputs and session data.
 *
 * This is a convenience function that runs all signal detectors and
 * collects results. Callers who need finer control can call individual
 * detectors directly.
 */
export function collectSignals(params: {
  // Behavioral inputs
  answerChangeCount?: number;
  sessionDurationMinutes?: number;
  sliderValues?: number[];
  // Emotional inputs
  fomoLevel?: number;
  confidenceLevel?: number;
  lifeStability?: number;
  partnerAlignment?: number | null;
  timeHorizonMonths?: number;
  // Language inputs
  freeText?: string;
}): CrisisSignal[] {
  const signals: CrisisSignal[] = [];

  // Behavioral
  if (params.answerChangeCount !== undefined && params.sessionDurationMinutes !== undefined) {
    const s = detectRapidAnswerChanges(params.answerChangeCount, params.sessionDurationMinutes);
    if (s) signals.push(s);
  }

  if (params.sliderValues !== undefined) {
    const s = detectExtremeSliderValues(params.sliderValues);
    if (s) signals.push(s);
  }

  if (params.sessionDurationMinutes !== undefined) {
    const s = detectSessionAnomaly(params.sessionDurationMinutes);
    if (s) signals.push(s);
  }

  // Emotional
  if (params.fomoLevel !== undefined && params.confidenceLevel !== undefined) {
    const s = detectFomoConfidenceConflict(params.fomoLevel, params.confidenceLevel);
    if (s) signals.push(s);
  }

  if (
    params.fomoLevel !== undefined &&
    params.timeHorizonMonths !== undefined &&
    params.confidenceLevel !== undefined
  ) {
    const s = detectPanicBuying(params.fomoLevel, params.timeHorizonMonths, params.confidenceLevel);
    if (s) signals.push(s);
  }

  if (params.confidenceLevel !== undefined && params.lifeStability !== undefined) {
    const s = detectExtremeLowConfidence(params.confidenceLevel, params.lifeStability);
    if (s) signals.push(s);
  }

  if (params.confidenceLevel !== undefined) {
    const s = detectPartnerConflict(
      params.partnerAlignment ?? null,
      params.confidenceLevel,
    );
    if (s) signals.push(s);
  }

  // Language
  if (params.freeText !== undefined) {
    const s = detectDistressLanguage(params.freeText);
    if (s) signals.push(s);
  }

  return signals;
}

/**
 * Evaluates a set of crisis signals and determines the appropriate action.
 *
 * Trigger rule:
 *   2+ signals from 2+ DIFFERENT categories, each with intensity > 50.
 *
 * When triggered:
 *   - action = 'deflect'
 *   - cooldownUntil is set to now + COOLDOWN_HOURS
 *
 * When not triggered:
 *   - action = 'continue'
 *   - cooldownUntil is undefined
 *   - All signals (including sub-threshold) are still returned for logging
 *
 * @param signals - Array of crisis signals to evaluate
 * @returns CrisisResult with detection outcome and action
 */
export function detectCrisis(signals: CrisisSignal[]): CrisisResult {
  // Filter to signals that exceed the intensity threshold
  const qualifying = signals.filter(s => s.intensity > INTENSITY_THRESHOLD);

  // Count distinct categories among qualifying signals
  const categories = new Set<CrisisCategory>(qualifying.map(s => s.category));

  // Trigger rule: 2+ qualifying signals from 2+ distinct categories
  const triggered = qualifying.length >= MIN_SIGNALS && categories.size >= MIN_CATEGORIES;

  const action: CrisisAction = triggered ? 'deflect' : 'continue';

  const cooldownUntil = triggered
    ? new Date(Date.now() + COOLDOWN_HOURS * 60 * 60 * 1000).toISOString()
    : undefined;

  return {
    detected: triggered,
    action,
    signals,
    cooldownUntil,
  };
}
