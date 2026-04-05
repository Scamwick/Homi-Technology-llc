/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Demo Mode — Shared utilities for AI endpoints
 *
 * When ANTHROPIC_API_KEY is not configured, AI features return clearly
 * labeled "[Demo Mode]" responses instead of crashing or faking data.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const DEMO_MESSAGE =
  '[Demo Mode] — AI features are waiting for an API key. Configure ANTHROPIC_API_KEY to enable live responses.';

/** Returns true when the Anthropic API key is not set. */
export function isDemoMode(): boolean {
  return !process.env.ANTHROPIC_API_KEY;
}

/** The standard demo-mode text shown to users. */
export function getDemoMessage(): string {
  return DEMO_MESSAGE;
}

/**
 * Stream a single "[Demo Mode]" SSE message then close.
 * Compatible with the agent/advisor streaming protocol.
 */
export function demoModeSSE(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
): void {
  controller.enqueue(
    encoder.encode(`event: delta\ndata: ${JSON.stringify({ text: DEMO_MESSAGE })}\n\n`),
  );
  controller.enqueue(encoder.encode('event: done\ndata: {}\n\n'));
  controller.close();
}

/**
 * JSON payload for non-streaming endpoints in demo mode.
 */
export function demoModeJSON() {
  return {
    demoMode: true,
    message: DEMO_MESSAGE,
  };
}
