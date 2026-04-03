/**
 * HoMI Temporal Twin Module — Barrel Export
 * ==========================================
 *
 * Public API surface for the Temporal Twin messaging system.
 * Import from '@/lib/temporal-twin' to access the engine and types.
 *
 * @example
 * ```ts
 * import {
 *   TemporalTwinEngine,
 *   type TemporalMessage,
 *   type Horizon,
 * } from '@/lib/temporal-twin';
 * ```
 */

export {
  TemporalTwinEngine,
  type TemporalMessage,
  type Horizon,
  type GenerateParams,
  type GenerateAllParams,
  type AllMessages,
} from './engine';
