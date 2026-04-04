/**
 * AI Advisor — Conversational Readiness Coach
 * =============================================
 *
 * Provides a streaming chat interface backed by Claude. The advisor helps
 * users understand their HoMI-Score, explore readiness dimensions, and
 * navigate their transformation path.
 *
 * When ANTHROPIC_API_KEY is not set, the service returns mock streamed
 * responses so the UI can be developed without an external dependency.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AdvisorMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AssessmentContext {
  scores: {
    overall: number;
    financial: number;
    emotional: number;
    timing: number;
  };
  verdict: string;
  /** Live financial summary from Plaid (optional). */
  financialContext?: string;
}

interface SendMessageParams {
  conversationId: string;
  message: string;
  assessmentContext?: AssessmentContext;
  history: AdvisorMessage[];
}

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

const ADVISOR_SYSTEM_PROMPT = [
  'You are the HoMI AI Advisor \u2014 a warm, knowledgeable financial readiness coach.',
  'You help users understand their HoMI-Score, explore their readiness dimensions,',
  'and navigate their transformation path toward homeownership.',
  '',
  'Tone: 70% calm coach, 20% warm empathy, 10% sharp truth.',
  '',
  'Guidelines:',
  '- Never give specific financial advice (e.g. "buy this stock", "get this mortgage").',
  '- Always reference the user\'s actual scores when available.',
  '- Frame everything in terms of readiness dimensions: Financial Reality, Emotional Truth, Perfect Timing.',
  '- When a user asks about a low score, acknowledge the feeling first, then explain the factors.',
  '- Suggest concrete, actionable next steps drawn from the HoMI framework.',
  '- Keep responses concise \u2014 2-3 paragraphs max unless the user asks for detail.',
  '- Use the user\'s name if provided.',
  '- Never fabricate scores or data. If you don\'t have context, ask.',
].join('\n');

// ---------------------------------------------------------------------------
// Mock responses
// ---------------------------------------------------------------------------

const MOCK_RESPONSES: Record<string, string> = {
  'explain my financial reality score': [
    'Your Financial Reality score reflects the concrete numbers behind your readiness:',
    'debt-to-income ratio, down payment progress, emergency fund depth, and credit score.',
    '',
    'Think of it as the "can you afford this?" dimension. A strong score here means your',
    'financial foundation can support a mortgage without putting you in a precarious position.',
    'If your score is lower than you expected, focus on the single metric with the biggest gap \u2014',
    'usually emergency fund or DTI ratio.',
    '',
    'Would you like me to break down which specific factor is pulling your score down the most?',
  ].join('\n'),

  'why did i get not yet?': [
    'A NOT YET verdict means the Trinity Engine identified meaningful gaps between where you',
    'are today and where you need to be for homeownership to feel sustainable \u2014 not just',
    'financially possible.',
    '',
    'This is not a rejection. It is protection. The most common reasons are: insufficient',
    'emergency reserves (what happens if the furnace dies month one?), a debt-to-income ratio',
    'that would leave too little breathing room, or timing pressure that is rushing the decision.',
    '',
    'The good news: these are all addressable. Your Transformation Path will show you the',
    'specific milestones to hit. Most users who start at NOT YET reach ALMOST THERE within',
    '4-8 months of focused effort.',
  ].join('\n'),

  'what should i work on first?': [
    'Based on your assessment, I would prioritize in this order:',
    '',
    '1. **Emergency Fund** \u2014 This is the single highest-impact action. Aim for 6 months',
    '   of essential expenses. Even adding one month makes a meaningful difference to your score.',
    '',
    '2. **Debt Reduction** \u2014 Focus on the highest-interest debt first. Every dollar of monthly',
    '   debt you eliminate improves your DTI ratio and increases how much mortgage you can sustain.',
    '',
    '3. **Down Payment Velocity** \u2014 Once the emergency fund and debt are on track, redirect',
    '   freed-up cash toward your down payment. The 20% mark eliminates PMI.',
    '',
    'Want me to help you build a timeline for hitting these milestones?',
  ].join('\n'),

  default: [
    'That is a great question. Let me think about how your assessment data connects to this.',
    '',
    'Based on your scores, I can see a few things worth exploring. Your strongest dimension',
    'gives you a solid foundation to build from, while the areas that need attention represent',
    'concrete, achievable improvements rather than fundamental blockers.',
    '',
    'Would you like to dive deeper into any specific dimension, or shall I outline the next',
    'steps that would have the biggest impact on your overall readiness?',
  ].join('\n'),
};

function getMockResponse(message: string): string {
  const lower = message.toLowerCase().trim();

  for (const [key, response] of Object.entries(MOCK_RESPONSES)) {
    if (key === 'default') continue;
    if (lower.includes(key) || key.includes(lower)) {
      return response;
    }
  }

  // Partial matches
  if (lower.includes('financial') && lower.includes('score')) {
    return MOCK_RESPONSES['explain my financial reality score'];
  }
  if (lower.includes('not yet') || lower.includes('not_yet')) {
    return MOCK_RESPONSES['why did i get not yet?'];
  }
  if (lower.includes('work on') || lower.includes('first') || lower.includes('priority')) {
    return MOCK_RESPONSES['what should i work on first?'];
  }

  return MOCK_RESPONSES['default'];
}

// ---------------------------------------------------------------------------
// Advisor Service
// ---------------------------------------------------------------------------

export class AdvisorService {
  /**
   * Send a message and receive a streaming response.
   * Returns a ReadableStream that emits SSE-formatted text chunks.
   */
  async sendMessage(params: SendMessageParams): Promise<ReadableStream> {
    if (!this.hasApiKey()) {
      return this.getMockStream(params.message);
    }

    return this.getLiveStream(params);
  }

  // ── Private methods ─────────────────────────────────────────────────────

  private hasApiKey(): boolean {
    return Boolean(process.env.ANTHROPIC_API_KEY);
  }

  /**
   * Stream from the Claude API via SSE.
   */
  private async getLiveStream(params: SendMessageParams): Promise<ReadableStream> {
    const systemParts = [ADVISOR_SYSTEM_PROMPT];

    if (params.assessmentContext) {
      const ctx = params.assessmentContext;
      systemParts.push(
        '',
        '--- User Assessment Context ---',
        `Overall Score: ${ctx.scores.overall}/100`,
        `Verdict: ${ctx.verdict}`,
        `Financial Reality: ${ctx.scores.financial}`,
        `Emotional Truth: ${ctx.scores.emotional}`,
        `Perfect Timing: ${ctx.scores.timing}`,
      );

      // Include live financial data from Plaid if available
      if (ctx.financialContext) {
        systemParts.push('', ctx.financialContext);
      }
    }

    const messages = [
      ...params.history.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: params.message },
    ];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        stream: true,
        system: systemParts.join('\n'),
        messages,
      }),
    });

    if (!response.ok || !response.body) {
      // Fall back to mock on API error
      return this.getMockStream(params.message);
    }

    // Transform the Anthropic SSE stream into a simpler text stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    return new ReadableStream({
      async pull(controller) {
        const { done, value } = await reader.read();

        if (done) {
          controller.close();
          return;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') {
            controller.close();
            return;
          }

          try {
            const parsed = JSON.parse(data) as {
              type: string;
              delta?: { type: string; text: string };
            };
            if (
              parsed.type === 'content_block_delta' &&
              parsed.delta?.type === 'text_delta'
            ) {
              controller.enqueue(
                new TextEncoder().encode(parsed.delta.text),
              );
            }
          } catch {
            // Skip malformed SSE lines
          }
        }
      },
    });
  }

  /**
   * Simulate a streaming response by emitting mock text word-by-word.
   */
  private getMockStream(message: string): ReadableStream {
    const text = getMockResponse(message);
    const words = text.split(' ');
    let index = 0;

    return new ReadableStream({
      async pull(controller) {
        if (index >= words.length) {
          controller.close();
          return;
        }

        // Emit 2-3 words at a time with a small delay
        const batch = words.slice(index, index + 3).join(' ');
        index += 3;

        controller.enqueue(
          new TextEncoder().encode(
            batch + (index < words.length ? ' ' : ''),
          ),
        );

        // Simulate network latency
        await new Promise((resolve) => setTimeout(resolve, 50));
      },
    });
  }
}
