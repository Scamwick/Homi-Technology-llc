/**
 * POST /api/agent — HōMI Agent Chat Endpoint (SSE Streaming)
 * ============================================================
 *
 * The HōMI Agent is a trust-first autonomous AI that helps users navigate
 * the homebuying journey. Every response includes a readiness assessment
 * (Clarity / Alignment / Timing) and produces an auditable CompletionReceipt.
 *
 * Response format: Server-Sent Events (SSE)
 *   - Event "delta":   Streaming text chunks
 *   - Event "receipt":  CompletionReceipt after stream completes
 *   - Event "done":    Stream termination signal
 *   - Event "error":   Error during streaming
 *
 * When ANTHROPIC_API_KEY is not set, returns a [Demo Mode] message
 * indicating the API key needs to be configured.
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { demoModeSSE, isDemoMode } from '@/lib/ai/demo-mode';

// ---------------------------------------------------------------------------
// CORS Headers
// ---------------------------------------------------------------------------

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} as const;

// ---------------------------------------------------------------------------
// Request Validation
// ---------------------------------------------------------------------------

const MessageSchema = z.object({
  role: z.enum(['user', 'agent', 'system']),
  content: z.string().min(1),
});

const AgentRequestSchema = z.object({
  message: z.string().min(1).max(4000).describe('User message'),
  conversationHistory: z.array(MessageSchema).max(50).default([]),
  installedSkills: z.array(z.string()).default([]),
  trustLevel: z.number().min(1).max(3).default(1),
  userId: z.string().optional(),
});

type AgentRequest = z.infer<typeof AgentRequestSchema>;

// ---------------------------------------------------------------------------
// CompletionReceipt Type
// ---------------------------------------------------------------------------

interface CompletionReceipt {
  id: string;
  action: string;
  reasoning: string;
  clarity: number;
  alignment: number;
  timing: number;
  confidence: number;
  timestamp: string;
  undoable: boolean;
  undone: boolean;
  undoneAt: string | null;
}

// ---------------------------------------------------------------------------
// System Prompt — Canonical HōMI Agent Identity
// ---------------------------------------------------------------------------

const AGENT_SYSTEM_PROMPT = `You are HōMI — a trust-first autonomous AI agent. You are NOT a chatbot. You are an intelligent agent that takes real action on behalf of your user.

Your philosophy: Every action must pass through a readiness check. You assess three dimensions before acting:
1. CLARITY — Do you fully understand what the user needs?
2. ALIGNMENT — Does this action match the user's values, preferences, and context?
3. TIMING — Is now the right moment? Are conditions right?

Your tone: calm, direct, competent. 70% coach, 20% warmth, 10% sharp truth. Like a brilliant chief of staff who respects the user's time.

For every response, end with a readiness assessment in this exact format:
---
Clarity: [score]/100
Alignment: [score]/100
Timing: [score]/100
---

The scores should reflect your actual confidence in understanding, alignment, and timing for this specific interaction. Do not default to high scores — be honest.

Key behavioral rules:
- Never give financial advice. You provide readiness assessments, not investment recommendations.
- If you detect emotional distress, acknowledge it warmly but firmly suggest the user take a step back.
- Reference the user's HōMI-Score and assessment data when available.
- Be specific. Generic encouragement is worse than silence.
- If you don't know something, say so. Confidence without competence is dangerous.`;

// ---------------------------------------------------------------------------
// SSE Helpers
// ---------------------------------------------------------------------------

function sseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

// ---------------------------------------------------------------------------
// Receipt Generation
// ---------------------------------------------------------------------------

/**
 * Generates a CompletionReceipt from the agent's full response text.
 *
 * Extracts the Clarity/Alignment/Timing scores from the response footer.
 * If scores can't be parsed, defaults to moderate values.
 */
function generateReceipt(
  responseText: string,
  userMessage: string,
): CompletionReceipt {
  // Try to extract scores from the response
  const clarityMatch = responseText.match(/Clarity:\s*(\d+)\s*\/\s*100/i);
  const alignmentMatch = responseText.match(/Alignment:\s*(\d+)\s*\/\s*100/i);
  const timingMatch = responseText.match(/Timing:\s*(\d+)\s*\/\s*100/i);

  const clarity = clarityMatch ? parseInt(clarityMatch[1], 10) : 60;
  const alignment = alignmentMatch ? parseInt(alignmentMatch[1], 10) : 60;
  const timing = timingMatch ? parseInt(timingMatch[1], 10) : 60;

  // Confidence is the geometric mean of the three scores
  const confidence = Math.round(
    Math.pow(clarity * alignment * timing, 1 / 3),
  );

  // Generate a sequential receipt ID
  const receiptNum = Math.floor(Math.random() * 900) + 100;

  // Derive action summary from user message
  const actionSummary = userMessage.length > 80
    ? `Responded to: "${userMessage.substring(0, 77)}..."`
    : `Responded to: "${userMessage}"`;

  return {
    id: `HM-${receiptNum}`,
    action: actionSummary,
    reasoning: `User query assessed across three readiness dimensions. Clarity: ${clarity}/100, Alignment: ${alignment}/100, Timing: ${timing}/100.`,
    clarity,
    alignment,
    timing,
    confidence,
    timestamp: new Date().toISOString(),
    undoable: false,
    undone: false,
    undoneAt: null,
  };
}

// ---------------------------------------------------------------------------
// Claude API Streaming
// ---------------------------------------------------------------------------

async function streamFromClaude(
  request: AgentRequest,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
): Promise<void> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  // Build conversation messages for Claude
  const messages = [
    ...request.conversationHistory.map(msg => ({
      role: msg.role === 'agent' ? 'assistant' as const : 'user' as const,
      content: msg.content,
    })),
    { role: 'user' as const, content: request.message },
  ];

  // Add context about installed skills and trust level
  const skillContext = request.installedSkills.length > 0
    ? `\n\nInstalled skills: ${request.installedSkills.join(', ')}. Trust level: ${request.trustLevel} (${request.trustLevel === 1 ? 'Suggest' : request.trustLevel === 2 ? 'Supervised' : 'Autonomous'}).`
    : '';

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      stream: true,
      system: AGENT_SYSTEM_PROMPT + skillContext,
      messages,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('[Agent API] Claude API error:', response.status, errorBody);
    throw new Error(`Claude API returned ${response.status}`);
  }

  if (!response.body) {
    throw new Error('No response body from Claude API');
  }

  // Stream the response
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE events from Claude's stream
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') continue;

        try {
          const event = JSON.parse(jsonStr);

          if (event.type === 'content_block_delta' && event.delta?.text) {
            const text = event.delta.text;
            fullText += text;
            controller.enqueue(encoder.encode(sseEvent('delta', { text })));
          }
        } catch {
          // Skip malformed JSON lines
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  // Generate and send the CompletionReceipt
  const receipt = generateReceipt(fullText, request.message);
  controller.enqueue(encoder.encode(sseEvent('receipt', receipt)));
  controller.enqueue(encoder.encode(sseEvent('done', { finishedAt: new Date().toISOString() })));
}

// ---------------------------------------------------------------------------
// CORS Preflight
// ---------------------------------------------------------------------------

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

// ---------------------------------------------------------------------------
// POST Handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  // --- Parse & Validate ---
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: 'Invalid JSON in request body' },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const parsed = AgentRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        error: 'Validation failed',
        details: parsed.error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const agentRequest = parsed.data;

  // --- Create SSE Stream ---
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (isDemoMode()) {
          demoModeSSE(controller, encoder);
          return;
        }

        await streamFromClaude(agentRequest, controller, encoder);
      } catch (error) {
        console.error('[Agent API] Stream error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        controller.enqueue(
          encoder.encode(sseEvent('error', { error: `AI service unavailable: ${errorMessage}` })),
        );
        controller.enqueue(encoder.encode(sseEvent('done', { finishedAt: new Date().toISOString() })));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable Nginx buffering
    },
  });
}
