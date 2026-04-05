/**
 * AI Advisor — Conversational Readiness Coach
 * =============================================
 *
 * Provides a streaming chat interface backed by Claude. The advisor helps
 * users understand their HoMI-Score, explore readiness dimensions, and
 * navigate their transformation path.
 *
 * When ANTHROPIC_API_KEY is not set, the service returns a [Demo Mode]
 * message indicating the API key needs to be configured.
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
// Advisor Service
// ---------------------------------------------------------------------------

export class AdvisorService {
  /**
   * Send a message and receive a streaming response.
   * Returns a ReadableStream that emits text chunks.
   */
  async sendMessage(params: SendMessageParams): Promise<ReadableStream> {
    if (!this.hasApiKey()) {
      return this.getDemoStream();
    }

    return this.getLiveStream(params);
  }

  // \u2500\u2500 Private methods \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

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
      return this.getErrorStream();
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
   * Stream a single [Demo Mode] message when API key is not configured.
   */
  private getDemoStream(): ReadableStream {
    const text =
      '[Demo Mode] \u2014 AI Advisor is waiting for an API key. Configure ANTHROPIC_API_KEY to enable live responses.';
    return new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(text));
        controller.close();
      },
    });
  }

  /**
   * Stream an error message when the API call fails.
   */
  private getErrorStream(): ReadableStream {
    const text =
      '[Error] AI Advisor is temporarily unavailable. Please try again.';
    return new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(text));
        controller.close();
      },
    });
  }
}
