/**
 * Trinity Engine — Adversarial Collaboration Service
 * ====================================================
 *
 * Runs three AI perspectives on every assessment:
 *   1. Advocate  (Emerald) — finds every reason the user CAN succeed
 *   2. Skeptic   (Yellow)  — surfaces every risk being overlooked
 *   3. Arbiter   (Cyan)    — synthesizes both into actionable guidance
 *
 * When ANTHROPIC_API_KEY is not configured, the engine returns
 * [Demo Mode] placeholders indicating the API key needs to be set.
 */

import type {
  TrinityRole,
  TrinityPerspective,
  TrinityAnalysis,
} from '@/types/trinity';
import type { Verdict, Dimension } from '@/types/assessment';
import { getDemoMessage } from '@/lib/ai/demo-mode';

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
      modelVersion: this.hasApiKey() ? 'claude-sonnet-4-20250514' : 'demo',
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
      return this.getDemoPerspective(role, context);
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
      throw new Error(`Trinity API request failed for ${role}: ${response.status}`);
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

  private getDemoPerspective(
    role: TrinityRole,
    context: TrinityContext,
  ): TrinityPerspective {
    return {
      role,
      perspective: getDemoMessage(),
      confidence: 0,
      keyPoints: [],
      primaryDimensions: this.inferDimensions(role, context),
    };
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
