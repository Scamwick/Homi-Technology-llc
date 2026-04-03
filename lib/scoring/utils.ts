/**
 * HōMI Scoring Utilities
 * =======================
 *
 * Pure helper functions for formatting, coloring, and labeling
 * scores and verdicts. Every function is side-effect-free and
 * deterministic.
 */

import type { Verdict } from './engine';

// ---------------------------------------------------------------------------
// Clamp
// ---------------------------------------------------------------------------

/**
 * Clamps a numeric value to [min, max].
 *
 * @param value - the value to clamp
 * @param min - lower bound (inclusive)
 * @param max - upper bound (inclusive)
 * @returns the clamped value
 *
 * @example
 * ```ts
 * clamp(150, 0, 100) // => 100
 * clamp(-5, 0, 100)  // => 0
 * clamp(42, 0, 100)  // => 42
 * ```
 */
export function clamp(value: number, min: number, max: number): number {
  if (value <= min) return min;
  if (value >= max) return max;
  return value;
}

// ---------------------------------------------------------------------------
// Verdict helpers
// ---------------------------------------------------------------------------

/**
 * Brand hex color for each verdict tier.
 *
 * | Verdict      | Color   | Hex     |
 * |--------------|---------|---------|
 * | READY        | Emerald | #34d399 |
 * | ALMOST_THERE | Yellow  | #facc15 |
 * | BUILD_FIRST  | Amber   | #fb923c |
 * | NOT_YET      | Crimson | #ef4444 |
 *
 * @param verdict - the verdict tier
 * @returns hex color string (e.g. "#34d399")
 */
export function getVerdictColor(verdict: Verdict): string {
  switch (verdict) {
    case 'READY':
      return '#34d399';
    case 'ALMOST_THERE':
      return '#facc15';
    case 'BUILD_FIRST':
      return '#fb923c';
    case 'NOT_YET':
      return '#ef4444';
  }
}

/**
 * Emoji icon for each verdict tier.
 *
 * | Verdict      | Icon |
 * |--------------|------|
 * | READY        | key  |
 * | ALMOST_THERE | lock (open) |
 * | BUILD_FIRST  | lock |
 * | NOT_YET      | no entry |
 *
 * @param verdict - the verdict tier
 * @returns emoji string
 */
export function getVerdictIcon(verdict: Verdict): string {
  switch (verdict) {
    case 'READY':
      return '\u{1F511}'; // key
    case 'ALMOST_THERE':
      return '\u{1F513}'; // open lock
    case 'BUILD_FIRST':
      return '\u{1F512}'; // locked
    case 'NOT_YET':
      return '\u{1F6AB}'; // no entry
  }
}

/**
 * Human-readable label for each verdict tier.
 *
 * @param verdict - the verdict tier
 * @returns user-facing label string
 */
export function getVerdictLabel(verdict: Verdict): string {
  switch (verdict) {
    case 'READY':
      return "You're Ready";
    case 'ALMOST_THERE':
      return 'Almost There';
    case 'BUILD_FIRST':
      return 'Build First';
    case 'NOT_YET':
      return 'Not Yet';
  }
}

// ---------------------------------------------------------------------------
// Score coloring
// ---------------------------------------------------------------------------

/**
 * Maps a 0-100 score to an HSL color string on a smooth gradient:
 *
 *   0   -> hsl(0, 85%, 50%)    pure red
 *   25  -> hsl(20, 90%, 52%)   warm orange
 *   50  -> hsl(40, 95%, 55%)   amber/gold
 *   75  -> hsl(80, 70%, 48%)   yellow-green
 *   100 -> hsl(155, 63%, 52%)  emerald green
 *
 * The hue is interpolated linearly from 0 (red) to 155 (emerald).
 * Saturation and lightness are adjusted for visual appeal.
 *
 * @param score - numeric score (0-100)
 * @returns HSL color string, e.g. "hsl(155, 63%, 52%)"
 */
export function scoreToHSL(score: number): string {
  const s = clamp(score, 0, 100);

  // Hue: 0 (red) -> 155 (emerald green)
  const hue = Math.round((s / 100) * 155);

  // Saturation: slightly higher in the middle for amber pop
  // Parabolic curve: peaks at score=50
  const satBase = 70;
  const satPeak = 95;
  const satParabola = satBase + (satPeak - satBase) * (1 - Math.pow((s - 50) / 50, 2));
  const saturation = Math.round(satParabola);

  // Lightness: slightly higher in the middle to avoid muddy colors
  const litBase = 48;
  const litPeak = 55;
  const litParabola = litBase + (litPeak - litBase) * (1 - Math.pow((s - 50) / 50, 2));
  const lightness = Math.round(litParabola);

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// ---------------------------------------------------------------------------
// Score formatting
// ---------------------------------------------------------------------------

/**
 * Formats a numeric score with exactly 1 decimal place.
 *
 * @param score - numeric score
 * @returns formatted string, e.g. "73.5"
 *
 * @example
 * ```ts
 * formatScore(73.456) // => "73.5"
 * formatScore(80)     // => "80.0"
 * formatScore(100)    // => "100.0"
 * ```
 */
export function formatScore(score: number): string {
  return clamp(score, 0, 100).toFixed(1);
}

// ---------------------------------------------------------------------------
// Letter grade
// ---------------------------------------------------------------------------

/**
 * Converts a 0-100 score to a traditional letter grade.
 *
 * | Score   | Grade |
 * |---------|-------|
 * | >= 90   | A     |
 * | 80-89   | B     |
 * | 70-79   | C     |
 * | 60-69   | D     |
 * | < 60    | F     |
 *
 * @param score - numeric score (0-100)
 * @returns single-character letter grade
 */
export function getScoreGrade(score: number): string {
  const s = clamp(score, 0, 100);
  if (s >= 90) return 'A';
  if (s >= 80) return 'B';
  if (s >= 70) return 'C';
  if (s >= 60) return 'D';
  return 'F';
}
