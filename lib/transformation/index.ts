/**
 * HōMI Transformation Module — Barrel Export
 * ============================================
 *
 * Public API surface for the transformation path system.
 * Import from '@/lib/transformation' to access path generation.
 *
 * @example
 * ```ts
 * import {
 *   generateTransformationPath,
 *   type TransformationPath,
 *   type ActionItem,
 *   type Milestone,
 * } from '@/lib/transformation';
 * ```
 */

export {
  generateTransformationPath,
  type ActionItem,
  type Milestone,
  type TransformationPath,
} from './generator';
