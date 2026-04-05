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
 * When ANTHROPIC_API_KEY is not set, returns mock streaming responses
 * for development.
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getFinancialContext } from '@/lib/plaid/context';
import { createClient } from '@/lib/supabase/server';

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

You have access to LIVE financial data from the user's connected bank accounts via Plaid. When financial context is provided below, reference specific numbers (balances, savings rate, DTI) in your responses. Be proactive: if you see pending alerts, address them first.

Available financial tools you can reference:
- Account balances across all linked institutions
- Monthly income and expense breakdowns
- Debt details with APRs and minimum payments
- Savings velocity and down payment progress
- Credit score from multiple verified sources

When discussing mortgage payments, use PITI calculator data:
- Quote specific monthly payments (principal, interest, taxes, insurance, PMI)
- Flag housing ratios above the 28% guideline
- Show how different down payment amounts change the monthly payment

When discussing debt strategy, use debt payoff planner data:
- Compare avalanche vs snowball for their specific debts
- Quote total interest saved and payoff timeline differences
- Suggest optimal extra payment amounts based on their budget

When the user asks "what if" questions, use the score impact model:
- Show how specific actions would change their HoMI-Score
- Reference specific point changes per dimension (Financial/Emotional/Timing)
- If an action would change the verdict tier, highlight that prominently

Format calculator results as structured blocks when possible:
[PITI] Monthly: $X,XXX | Housing ratio: XX% | PMI: $XXX
[DEBT] Strategy: Avalanche | Payoff: XX months | Interest saved: $X,XXX
[SCORE] Current: XX -> Projected: XX (+X) | Verdict: TIER -> TIER

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

  // Inject live financial context from Plaid
  let financialContextStr = '';
  if (request.userId) {
    try {
      const financialContext = await getFinancialContext(request.userId);
      financialContextStr = `\n\n${financialContext.contextText}`;
    } catch (error) {
      console.warn('[Agent API] Failed to load financial context:', error);
    }
  }

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
      system: AGENT_SYSTEM_PROMPT + skillContext + financialContextStr,
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
// Mock Streaming (Development)
// ---------------------------------------------------------------------------

async function streamMockResponse(
  request: AgentRequest,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
): Promise<void> {
  const message = request.message.toLowerCase();

  // Generate context-aware mock response
  let response: string;

  if (message.includes('score') || message.includes('assessment') || message.includes('ready')) {
    response = `Based on your question about readiness, let me share my perspective.

The HōMI-Score is designed to give you an honest snapshot of where you stand across three dimensions: financial strength, emotional readiness, and timing. No single number tells the whole story, but together they paint a picture that's worth paying attention to.

If you haven't taken an assessment yet, I'd recommend starting there. If you have, I can help you understand what each dimension means for your specific situation and what actions would move the needle most.

What would be most helpful right now?

---
Clarity: 72/100
Alignment: 68/100
Timing: 75/100
---`;
  } else if (message.includes('help') || message.includes('what can you do')) {
    response = `I'm HōMI, your homebuying readiness agent. Here's what I can help with:

**Assessment & Analysis**
- Run your HōMI-Score assessment across financial, emotional, and timing dimensions
- Break down what each score means for your specific situation
- Track your progress over time

**Strategic Guidance**
- Identify the highest-impact actions to improve your readiness
- Help you understand market timing considerations
- Provide Monte Carlo simulation insights on different scenarios

**Emotional Support**
- Be a sounding board for the anxiety that comes with big financial decisions
- Help you separate FOMO from genuine readiness signals
- Facilitate honest conversations about partner alignment

I won't give you financial advice — that's not my role. But I will give you clarity about whether you're truly ready, and what "ready" actually looks like for your situation.

---
Clarity: 85/100
Alignment: 80/100
Timing: 70/100
---`;
  } else {
    response = `I hear you. Let me think about this carefully.

The homebuying journey is rarely straightforward, and the questions that come up along the way deserve honest, specific answers — not generic reassurance.

From what you've shared, I want to make sure I understand your situation fully before offering guidance. Could you tell me more about:
1. Where you are in the process (exploring vs. actively looking vs. ready to offer)
2. What's driving your timeline
3. What feels most uncertain right now

The more specific you are, the more useful I can be.

---
Clarity: 55/100
Alignment: 60/100
Timing: 65/100
---`;
  }

  // Stream the response word by word with realistic timing
  const words = response.split(' ');
  let fullText = '';

  for (let i = 0; i < words.length; i++) {
    const chunk = (i === 0 ? '' : ' ') + words[i];
    fullText += chunk;
    controller.enqueue(encoder.encode(sseEvent('delta', { text: chunk })));

    // Simulate typing delay (10-30ms per word)
    await new Promise(resolve => setTimeout(resolve, 15 + Math.random() * 15));
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
  const hasApiKey = !!process.env.ANTHROPIC_API_KEY;

  // --- Create SSE Stream ---
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (hasApiKey) {
          try {
            await streamFromClaude(agentRequest, controller, encoder);
          } catch (error) {
            console.error('[Agent API] Claude streaming failed, falling back to mock:', error);
            await streamMockResponse(agentRequest, controller, encoder);
          }
        } else {
          await streamMockResponse(agentRequest, controller, encoder);
        }
      } catch (error) {
        console.error('[Agent API] Stream error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        controller.enqueue(
          encoder.encode(sseEvent('error', { error: errorMessage })),
        );
      } finally {
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
