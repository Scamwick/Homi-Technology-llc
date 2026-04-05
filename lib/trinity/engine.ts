/**
 * Trinity Engine — Adversarial Collaboration Service
 * ====================================================
 *
 * Runs three AI perspectives on every assessment:
 *   1. Advocate  (Emerald) — finds every reason the user CAN succeed
 *   2. Skeptic   (Yellow)  — surfaces every risk being overlooked
 *   3. Arbiter   (Cyan)    — synthesizes both into actionable guidance
 *
 * When ANTHROPIC_API_KEY is not configured the engine falls back to
 * verdict-specific mock content so the UI can be developed and tested
 * without an external API dependency.
 */

import type {
  TrinityRole,
  TrinityPerspective,
  TrinityAnalysis,
} from '@/types/trinity';
import type { Verdict, Dimension } from '@/types/assessment';

// ---------------------------------------------------------------------------
// Context supplied to the engine from the assessment result
// ---------------------------------------------------------------------------

export interface TrinityContext {
  assessmentId: string;
  verdict: Verdict;
  overallScore: number;
  dimensions: {
    financial: { score: number; maxContribution: number };
    emotional: { score: number; maxContribution: number };
    timing: { score: number; maxContribution: number };
  };
  /** Optional free-text notes from the user. */
  userNotes?: string;
  /** Live financial context from Plaid (injected into all three perspectives). */
  financialContext?: string;
}

// ---------------------------------------------------------------------------
// System prompts per role
// ---------------------------------------------------------------------------

const SYSTEM_PROMPTS: Record<TrinityRole, string> = {
  advocate: [
    'You are the Advocate in the HōMI Trinity Engine.',
    'Your job is to find every reason the user CAN succeed at homeownership right now.',
    'Be warm, encouraging, and specific. Reference the user\'s actual scores and strengths.',
    'Highlight what they are doing right, even when overall readiness is low.',
    'Tone: optimistic mentor who genuinely believes in the user.',
    'Keep your response to 2-3 concise paragraphs.',
  ].join(' '),

  skeptic: [
    'You are the Skeptic in the HōMI Trinity Engine.',
    'Your job is to surface every risk the user might be overlooking.',
    'Be direct and protective — not cruel, but honest.',
    'Point out gaps in their financial cushion, emotional readiness, or timing pressure.',
    'Tone: caring but blunt friend who would rather the user hear the truth now than suffer later.',
    'Keep your response to 2-3 concise paragraphs.',
  ].join(' '),

  arbiter: [
    'You are the Arbiter in the HōMI Trinity Engine.',
    'You have read the Advocate\'s and Skeptic\'s perspectives.',
    'Synthesize both into a balanced, actionable recommendation.',
    'Weigh the evidence from both sides and deliver clear next-steps.',
    'Tone: balanced, decisive mediator. Think senior financial counselor.',
    'Keep your response to 2-3 concise paragraphs with a clear action list.',
  ].join(' '),
};

// ---------------------------------------------------------------------------
// Mock content — returned when ANTHROPIC_API_KEY is not set
// ---------------------------------------------------------------------------

function getMockPerspectives(verdict: Verdict): {
  advocate: Pick<TrinityPerspective, 'perspective' | 'confidence' | 'keyPoints' | 'primaryDimensions'>;
  skeptic: Pick<TrinityPerspective, 'perspective' | 'confidence' | 'keyPoints' | 'primaryDimensions'>;
  arbiter: Pick<TrinityPerspective, 'perspective' | 'confidence' | 'keyPoints' | 'primaryDimensions'>;
} {
  if (verdict === 'READY') {
    return {
      advocate: {
        perspective:
          'Your financial foundation is excellent. A strong credit score, healthy emergency fund, and solid down payment position put you ahead of most first-time buyers. Your emotional readiness signals are also strong — you and your partner are aligned, and you are making this decision from confidence rather than pressure.\n\nThe timing metrics reinforce everything else: your savings trajectory is on track, and the market conditions in your area favor prepared buyers. You have done the work. Trust it.',
        confidence: 92,
        keyPoints: [
          'Credit score positions you for the best rates available',
          'Emergency fund exceeds the recommended 6-month threshold',
          'Down payment savings exceed 20%, eliminating PMI requirement',
          'Partner alignment score indicates shared financial vision',
        ],
        primaryDimensions: ['financial'] as Dimension[],
      },
      skeptic: {
        perspective:
          'Even with strong numbers, there are risks worth naming. Your debt-to-income ratio, while manageable, will tighten once a mortgage payment enters the picture. Have you stress-tested your budget with the full cost of ownership — property taxes, insurance, maintenance at 1-2% of home value annually?\n\nEmotionally, confidence is high, but confidence is not the same as preparedness. Make sure you have walked through worst-case scenarios together: job loss, major repair in year one, rate adjustments if you are considering an ARM.',
        confidence: 68,
        keyPoints: [
          'Post-purchase DTI will increase — budget needs stress testing',
          'Maintenance costs (1-2% of home value/year) often surprise first-time buyers',
          'High confidence can mask unexamined assumptions',
          'Insurance and property tax increases are not capped in most states',
        ],
        primaryDimensions: ['financial', 'emotional'] as Dimension[],
      },
      arbiter: {
        perspective:
          'The evidence strongly supports moving forward. Your financial metrics are well above threshold across every dimension, and your emotional readiness indicators are healthy. The Skeptic raises valid points about post-purchase cost awareness, but these are manageable risks rather than blocking concerns.\n\nMy recommendation: proceed with active house-hunting while completing these three actions:\n\n1. Run a full post-purchase budget simulation including taxes, insurance, and 1.5% annual maintenance\n2. Get pre-approved to lock in your rate advantage\n3. Have one explicit conversation with your partner about the "what if everything goes wrong" scenario',
        confidence: 88,
        keyPoints: [
          'Green light to proceed — financial foundation is strong',
          'Complete post-purchase budget stress test before signing',
          'Secure pre-approval to leverage your credit position',
          'One final partner alignment conversation on worst-case scenarios',
        ],
        primaryDimensions: ['financial', 'emotional', 'timing'] as Dimension[],
      },
    };
  }

  // NOT_YET / BUILD_FIRST / ALMOST_THERE — default mock for non-READY verdicts
  return {
    advocate: {
      perspective:
        'While the overall score suggests more preparation is needed, there are genuine strengths here to build on. Your commitment to taking this assessment shows self-awareness and planning discipline — qualities that predict long-term success in homeownership.\n\nYour emotional readiness signals are promising. The fact that you are evaluating this thoughtfully rather than rushing in under pressure is exactly the right approach. Many successful homeowners started exactly where you are.',
      confidence: 65,
      keyPoints: [
        'Self-awareness and planning discipline are strong indicators',
        'No signs of FOMO-driven decision making',
        'Current savings rate shows commitment to the goal',
        'Emotional readiness foundation is solid to build upon',
      ],
      primaryDimensions: ['emotional'] as Dimension[],
    },
    skeptic: {
      perspective:
        'The numbers tell an honest story: there are meaningful gaps between where you are and where you need to be. Your emergency fund needs reinforcement before adding a mortgage payment, and the current debt-to-income ratio leaves too little margin for the unexpected costs of homeownership.\n\nThis is not a "never" — it is a "not yet." The risk of buying before these fundamentals are solid is that you trade the stress of renting for the deeper stress of being house-poor. That trade rarely ends well.',
      confidence: 82,
      keyPoints: [
        'Emergency fund is below the recommended 6-month threshold',
        'Debt-to-income ratio needs reduction before adding a mortgage',
        'Down payment savings gap increases long-term cost through PMI',
        'Buying prematurely risks financial stress that erodes quality of life',
      ],
      primaryDimensions: ['financial', 'timing'] as Dimension[],
    },
    arbiter: {
      perspective:
        'Both perspectives contain important truth. The Advocate is right that your intentionality and emotional grounding are genuine assets. The Skeptic is right that the financial fundamentals need strengthening before this decision makes sense.\n\nHere is your priority action plan:\n\n1. Focus on building your emergency fund to 6 months of expenses — this is the single highest-impact action\n2. Reduce monthly debt obligations to get your DTI below 36%\n3. Increase your down payment savings rate, even by a small amount each month\n4. Reassess in 3-6 months — your trajectory matters more than your current position',
      confidence: 78,
      keyPoints: [
        'Not ready today, but trajectory is positive',
        'Priority 1: Emergency fund to 6 months',
        'Priority 2: Reduce DTI below 36%',
        'Reassess in 3-6 months with updated numbers',
      ],
      primaryDimensions: ['financial', 'timing'] as Dimension[],
    },
  };
}

// ---------------------------------------------------------------------------
// Trinity Engine
// ---------------------------------------------------------------------------

export class TrinityEngine {
  /**
   * Run the full Trinity analysis on an assessment context.
   * Advocate and Skeptic run in parallel; the Arbiter runs after both
   * complete so it can synthesize their outputs.
   */
  async analyzeAssessment(context: TrinityContext): Promise<TrinityAnalysis> {
    const [advocate, skeptic] = await Promise.all([
      this.generatePerspective('advocate', context),
      this.generatePerspective('skeptic', context),
    ]);

    const arbiter = await this.generatePerspective(
      'arbiter',
      context,
      advocate.perspective,
      skeptic.perspective,
    );

    return {
      id: crypto.randomUUID(),
      assessmentId: context.assessmentId,
      advocate,
      skeptic,
      arbiter,
      consensus: this.calculateConsensus(advocate, skeptic),
      createdAt: new Date().toISOString(),
      modelVersion: this.hasApiKey() ? 'claude-sonnet-4-20250514' : 'mock-v1',
    };
  }

  /**
   * Generate a single perspective. When the Anthropic API key is available,
   * calls the Claude API. Otherwise returns structured mock content.
   */
  private async generatePerspective(
    role: TrinityRole,
    context: TrinityContext,
    advocateContent?: string,
    skepticContent?: string,
  ): Promise<TrinityPerspective> {
    if (!this.hasApiKey()) {
      return this.getMockPerspective(role, context.verdict);
    }

    // --- Live API path ---
    const userMessage = this.buildUserMessage(
      role,
      context,
      advocateContent,
      skepticContent,
    );

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
        system: SYSTEM_PROMPTS[role],
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!response.ok) {
      console.error(`Trinity API error for ${role}:`, response.status);
      return this.getMockPerspective(role, context.verdict);
    }

    const data = (await response.json()) as {
      content: Array<{ type: string; text: string }>;
    };

    const text =
      data.content?.find((b) => b.type === 'text')?.text ?? '';

    return {
      role,
      perspective: text,
      confidence: this.estimateConfidence(role, context),
      keyPoints: this.extractKeyPoints(text),
      primaryDimensions: this.inferDimensions(role, context),
    };
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private hasApiKey(): boolean {
    return Boolean(process.env.ANTHROPIC_API_KEY);
  }

  private getMockPerspective(
    role: TrinityRole,
    verdict: Verdict,
  ): TrinityPerspective {
    const mocks = getMockPerspectives(verdict);
    return { role, ...mocks[role] };
  }

  private buildUserMessage(
    role: TrinityRole,
    context: TrinityContext,
    advocateContent?: string,
    skepticContent?: string,
  ): string {
    const lines = [
      `Assessment ID: ${context.assessmentId}`,
      `Overall Score: ${context.overallScore}/100`,
      `Verdict: ${context.verdict}`,
      '',
      'Dimension Scores:',
      `  Financial: ${context.dimensions.financial.score}/${context.dimensions.financial.maxContribution}`,
      `  Emotional: ${context.dimensions.emotional.score}/${context.dimensions.emotional.maxContribution}`,
      `  Timing: ${context.dimensions.timing.score}/${context.dimensions.timing.maxContribution}`,
    ];

    if (context.userNotes) {
      lines.push('', `User Notes: ${context.userNotes}`);
    }

    if (context.financialContext) {
      lines.push('', context.financialContext);
    }

    if (role === 'arbiter' && advocateContent && skepticContent) {
      lines.push(
        '',
        '--- Advocate Perspective ---',
        advocateContent,
        '',
        '--- Skeptic Perspective ---',
        skepticContent,
      );
    }

    return lines.join('\n');
  }

  private estimateConfidence(
    role: TrinityRole,
    context: TrinityContext,
  ): number {
    const score = context.overallScore;
    switch (role) {
      case 'advocate':
        return Math.min(95, 50 + score * 0.5);
      case 'skeptic':
        return Math.min(95, 50 + (100 - score) * 0.4);
      case 'arbiter':
        return Math.min(95, 60 + Math.abs(score - 50) * 0.3);
    }
  }

  private inferDimensions(
    role: TrinityRole,
    context: TrinityContext,
  ): Dimension[] {
    const dims = context.dimensions;
    const sorted = (
      ['financial', 'emotional', 'timing'] as Dimension[]
    ).sort((a, b) => {
      const ratioA = dims[a].score / dims[a].maxContribution;
      const ratioB = dims[b].score / dims[b].maxContribution;
      // Advocate focuses on strongest dims, Skeptic on weakest
      return role === 'advocate' ? ratioB - ratioA : ratioA - ratioB;
    });

    return role === 'arbiter' ? sorted : sorted.slice(0, 2);
  }

  private extractKeyPoints(text: string): string[] {
    // Pull numbered or bulleted items from the response
    const lines = text.split('\n');
    const points: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      const match = trimmed.match(/^(?:\d+[\.\)]\s*|[-*]\s+)(.+)/);
      if (match) {
        points.push(match[1].trim());
      }
    }

    // If no structured points found, generate from sentences
    if (points.length === 0) {
      const sentences = text
        .split(/[.!?]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 20 && s.length < 200);
      return sentences.slice(0, 4);
    }

    return points.slice(0, 6);
  }

  private calculateConsensus(
    advocate: TrinityPerspective,
    skeptic: TrinityPerspective,
  ): number {
    // Higher consensus when both have similar confidence levels
    const diff = Math.abs(advocate.confidence - skeptic.confidence);
    return Math.max(10, 100 - diff * 1.5);
  }
}
