/**
 * Error Reporting — Centralized error capture
 * ==============================================
 *
 * All caught errors should flow through this module rather than
 * console.error directly. This provides a single integration point
 * for services like Sentry, Datadog, or LogRocket.
 *
 * Current implementation: structured console logging.
 * To integrate Sentry, replace the body of `reportError` with:
 *   Sentry.captureException(error, { extra: context });
 */

export interface ErrorContext {
  /** Where the error occurred (e.g. 'ErrorBoundary', 'agent/route', 'billing') */
  source: string;
  /** Optional user ID for correlation */
  userId?: string;
  /** Any additional context */
  extra?: Record<string, unknown>;
}

/**
 * Report an error to the configured error tracking service.
 */
export function reportError(error: unknown, context: ErrorContext): void {
  const errorObj = error instanceof Error ? error : new Error(String(error));

  // Structured log for log aggregation (Vercel, Datadog, etc.)
  console.error(JSON.stringify({
    level: 'error',
    message: errorObj.message,
    stack: errorObj.stack,
    source: context.source,
    userId: context.userId,
    extra: context.extra,
    timestamp: new Date().toISOString(),
  }));

  // Integration point: Sentry, Datadog, etc.
  // if (typeof window !== 'undefined' && window.Sentry) {
  //   window.Sentry.captureException(errorObj, { extra: { ...context } });
  // }
}

/**
 * Report a warning (non-fatal issue).
 */
export function reportWarning(message: string, context: ErrorContext): void {
  console.warn(JSON.stringify({
    level: 'warn',
    message,
    source: context.source,
    userId: context.userId,
    extra: context.extra,
    timestamp: new Date().toISOString(),
  }));
}
