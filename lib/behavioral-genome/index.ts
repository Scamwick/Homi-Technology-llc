/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Behavioral Genome — Barrel Export
 *
 * HōMI's 9-dimension psychological profiling system.
 * Modifies UX friction only. NEVER modifies verdict logic.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// Dimensions
export {
  GENOME_DIMENSIONS,
  type GenomeDimensionId,
  type GenomeDimension,
} from './dimensions';

// Inference engine
export {
  collectSignals,
  generateMockProfile,
  type BehavioralEvent,
  type BehavioralEventType,
  type DimensionScore,
  type GenomeProfile,
} from './inference';

// Friction adjustments
export {
  getFrictionAdjustments,
  type FrictionAdjustment,
  type FrictionType,
} from './friction';
