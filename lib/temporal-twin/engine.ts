/**
 * Temporal Twin Engine — Future-Self Message Generation
 * =====================================================
 *
 * Generates personalized letters from the user's future self across
 * three time horizons (5yr, 10yr, retirement). Messages are tailored
 * to the user's assessment verdict and scores.
 *
 * When ANTHROPIC_API_KEY is set, messages could be AI-generated
 * (future enhancement). Otherwise, uses carefully crafted templates
 * based on verdict and score data.
 */

import type { Verdict } from '@/lib/scoring/engine';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Horizon = '5yr' | '10yr' | 'retirement';

export interface TemporalMessage {
  horizon: Horizon;
  futureAge: number;
  content: string;
  signature: string;
  verdict: string;
  generatedAt: string;
}

export interface GenerateParams {
  currentAge: number;
  verdict: Verdict;
  overallScore: number;
  financialScore: number;
  emotionalScore: number;
  timingScore: number;
  decisionType: string;
  horizon: Horizon;
}

export interface GenerateAllParams {
  currentAge: number;
  verdict: Verdict;
  overallScore: number;
  financialScore: number;
  emotionalScore: number;
  timingScore: number;
  decisionType: string;
}

export interface AllMessages {
  fiveYear: TemporalMessage;
  tenYear: TemporalMessage;
  retirement: TemporalMessage;
}

// ---------------------------------------------------------------------------
// Horizon age offsets
// ---------------------------------------------------------------------------

const HORIZON_OFFSETS: Record<Horizon, number> = {
  '5yr': 5,
  '10yr': 10,
  retirement: 35,
};

// ---------------------------------------------------------------------------
// Template Bank
// ---------------------------------------------------------------------------

interface TemplateContext {
  futureAge: number;
  currentAge: number;
  overallScore: number;
  financialScore: number;
  emotionalScore: number;
  timingScore: number;
  decisionType: string;
  horizon: Horizon;
}

type TemplateGenerator = (ctx: TemplateContext) => string;

const READY_TEMPLATES: Record<Horizon, TemplateGenerator> = {
  '5yr': (ctx) =>
    `I'm writing this from ${ctx.futureAge}, sitting in the home you're about to choose. ` +
    `Your overall score of ${ctx.overallScore} told you the truth — you were ready, and you were right to trust it. ` +
    `The financial foundation you built (scoring ${ctx.financialScore}%) has given us options I never imagined. ` +
    `That emotional clarity you had, that ${ctx.emotionalScore}% confidence? It wasn't naive — it was wisdom. ` +
    `Thank you for making the call when the numbers and your heart agreed.`,

  '10yr': (ctx) =>
    `A decade from your decision, I want you to know something: the courage it took to move forward with a score of ${ctx.overallScore} was the turning point. ` +
    `Our ${ctx.decisionType} decision created a ripple effect I'm still grateful for. ` +
    `The financial discipline that earned you ${ctx.financialScore}% became a habit that changed everything. ` +
    `And that timing score of ${ctx.timingScore}%? The market rewarded your patience and preparation.`,

  retirement: (ctx) =>
    `From the vantage point of ${ctx.futureAge}, I can see the full arc of our journey, and it started with the decision you're about to make. ` +
    `Your ${ctx.overallScore}-point readiness score was more than a number — it was the first brick of a lifetime of security. ` +
    `The home became equity. The equity became freedom. The freedom became this peaceful morning where I can write to you without worry. ` +
    `You earned this. Every point of that ${ctx.financialScore}% financial score was a step toward here.`,
};

const ALMOST_THERE_TEMPLATES: Record<Horizon, TemplateGenerator> = {
  '5yr': (ctx) =>
    `I know waiting felt hard when your score was ${ctx.overallScore} and you could almost taste it. ` +
    `But the extra months you spent pushing that financial score past ${ctx.financialScore}% made all the difference. ` +
    `The patience paid off in ways the calculator couldn't predict — lower rates, better inventory, and the confidence that comes from knowing you were truly ready. ` +
    `At ${ctx.futureAge}, I'm grateful you didn't rush.`,

  '10yr': (ctx) =>
    `Ten years in, I think about the moment you saw ${ctx.overallScore} and almost jumped. ` +
    `Your emotional readiness was at ${ctx.emotionalScore}%, which told you something important: you cared deeply about getting this right. ` +
    `The extra time you took didn't just improve the numbers — it transformed how you felt about the entire decision. ` +
    `That foundation of certainty has carried us through every challenge since.`,

  retirement: (ctx) =>
    `At ${ctx.futureAge}, I can tell you that the gap between "almost ready" and "ready" was the most important distance you ever closed. ` +
    `Your timing score of ${ctx.timingScore}% was telling you to prepare just a little more, and listening to that signal was an act of self-respect. ` +
    `The home you eventually chose became the anchor of a life well-lived. ` +
    `The patience you showed at ${ctx.currentAge} became the wisdom I carry at ${ctx.futureAge}.`,
};

const BUILD_FIRST_TEMPLATES: Record<Horizon, TemplateGenerator> = {
  '5yr': (ctx) =>
    `Thank you for pausing at ${ctx.overallScore}. I know it wasn't easy when everyone around you seemed to be buying. ` +
    `Your financial score of ${ctx.financialScore}% needed reinforcement, and you gave it exactly that. ` +
    `The foundation you built over the next months protected us from a market correction that would have been devastating. ` +
    `At ${ctx.futureAge}, our home is a source of joy, not anxiety, because you built first.`,

  '10yr': (ctx) =>
    `A decade later, I still think about the strength it took to see a score of ${ctx.overallScore} and choose to build rather than leap. ` +
    `Your emotional score of ${ctx.emotionalScore}% was honestly telling you something: this decision needed more time to feel right. ` +
    `The building period wasn't a delay — it was the most productive chapter of our financial life. ` +
    `Every dollar saved, every point of credit improved, compounded into the security we enjoy now.`,

  retirement: (ctx) =>
    `At ${ctx.futureAge}, I want you to know that pausing was the bravest financial decision you ever made. ` +
    `With a timing score of ${ctx.timingScore}% and an overall ${ctx.overallScore}, the numbers were asking you to invest in yourself first. ` +
    `You listened. And that listening — that willingness to prioritize long-term stability over short-term desire — defined everything that followed. ` +
    `Our retirement is comfortable because ${ctx.currentAge}-year-old you chose the harder, wiser path.`,
};

const NOT_YET_TEMPLATES: Record<Horizon, TemplateGenerator> = {
  '5yr': (ctx) =>
    `The foundation you're building right now at ${ctx.currentAge} is everything. I know a score of ${ctx.overallScore} feels discouraging, but here's what I see from ${ctx.futureAge}: every single step you're taking matters. ` +
    `Your financial score of ${ctx.financialScore}% is a starting point, not a ceiling. ` +
    `The awareness you have right now — just by taking this assessment — puts you ahead of where most people begin. ` +
    `Keep going. I'm proof that the work pays off.`,

  '10yr': (ctx) =>
    `From ten years ahead, I can tell you something nobody at ${ctx.currentAge} could have convinced me of: the timeline doesn't matter nearly as much as the trajectory. ` +
    `An emotional readiness of ${ctx.emotionalScore}% wasn't failure — it was honesty. ` +
    `And that honesty with yourself became the superpower that guided every financial decision after. ` +
    `The path from ${ctx.overallScore} to homeownership wasn't a sprint. It was a transformation, and it was worth every step.`,

  retirement: (ctx) =>
    `At ${ctx.futureAge}, I carry deep compassion for the ${ctx.currentAge}-year-old who saw a score of ${ctx.overallScore} and felt the weight of it. ` +
    `But here's the truth from the other side: that moment of honest assessment was the seed of everything good that followed. ` +
    `You didn't need to be ready then. You needed to be aware. And you were. ` +
    `The home eventually came, and when it did, it came with the unshakable confidence of someone who earned every square foot.`,
};

const TEMPLATE_BANK: Record<Verdict, Record<Horizon, TemplateGenerator>> = {
  READY: READY_TEMPLATES,
  ALMOST_THERE: ALMOST_THERE_TEMPLATES,
  BUILD_FIRST: BUILD_FIRST_TEMPLATES,
  NOT_YET: NOT_YET_TEMPLATES,
};

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------

export class TemporalTwinEngine {
  /**
   * Generate a message from the user's future self for a single horizon.
   */
  async generateMessage(params: GenerateParams): Promise<TemporalMessage> {
    const futureAge = params.currentAge + HORIZON_OFFSETS[params.horizon];
    const ctx: TemplateContext = {
      futureAge,
      currentAge: params.currentAge,
      overallScore: params.overallScore,
      financialScore: params.financialScore,
      emotionalScore: params.emotionalScore,
      timingScore: params.timingScore,
      decisionType: params.decisionType,
      horizon: params.horizon,
    };

    const templateFn = TEMPLATE_BANK[params.verdict]?.[params.horizon];
    if (!templateFn) {
      throw new Error(
        `No template found for verdict "${params.verdict}" / horizon "${params.horizon}"`,
      );
    }

    const content = templateFn(ctx);
    const signature = `\u2014 You, age ${futureAge}`;

    return {
      horizon: params.horizon,
      futureAge,
      content,
      signature,
      verdict: params.verdict,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Generate messages for all three horizons in parallel.
   */
  async generateAll(params: GenerateAllParams): Promise<AllMessages> {
    const [fiveYear, tenYear, retirement] = await Promise.all([
      this.generateMessage({ ...params, horizon: '5yr' }),
      this.generateMessage({ ...params, horizon: '10yr' }),
      this.generateMessage({ ...params, horizon: 'retirement' }),
    ]);

    return { fiveYear, tenYear, retirement };
  }
}
