/**
 * HōMI Transformation Path Generator
 * ====================================
 *
 * Generates personalised action plans for NOT YET users to move toward READY.
 * Analyses weakest dimensions and produces actionable items with milestones.
 *
 * @module lib/transformation/generator
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  dimension: 'financial' | 'emotional' | 'timing';
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedDuration: string;
  completed: boolean;
  order: number;
}

export interface Milestone {
  id: string;
  title: string;
  targetDimension: 'financial' | 'emotional' | 'timing';
  targetScore: number;
  achieved: boolean;
  celebrationMessage: string;
}

export interface TransformationPath {
  id: string;
  assessmentId: string;
  status: 'active' | 'completed' | 'abandoned';
  weakestDimension: 'financial' | 'emotional' | 'timing';
  actionItems: ActionItem[];
  milestones: Milestone[];
  reassessmentDate: string; // 30/60/90 days based on gap size
  daysOnPath: number;
  completionPercentage: number;
}

// ---------------------------------------------------------------------------
// Action item templates per dimension
// ---------------------------------------------------------------------------

interface ActionTemplate {
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedDuration: string;
  minGap: number; // only include if score is below this
}

const FINANCIAL_ACTIONS: ActionTemplate[] = [
  {
    title: 'Calculate your true monthly expenses',
    description:
      'Track every expense for 30 days. Knowing your real spend is the foundation for all financial planning.',
    category: 'Budgeting',
    difficulty: 'easy',
    estimatedDuration: '30 days',
    minGap: 90,
  },
  {
    title: 'Build emergency fund to 3 months',
    description:
      'Set up automatic transfers to build a safety net. Aim for 3 months of living expenses before buying.',
    category: 'Savings',
    difficulty: 'easy',
    estimatedDuration: '3-6 months',
    minGap: 80,
  },
  {
    title: 'Get your credit report and dispute errors',
    description:
      'Pull your free annual report from all three bureaus. Dispute any inaccuracies that are dragging your score down.',
    category: 'Credit',
    difficulty: 'easy',
    estimatedDuration: '1 week',
    minGap: 85,
  },
  {
    title: 'Reduce debt-to-income ratio below 36%',
    description:
      'Pay down revolving debt aggressively. Lenders want your total monthly debt payments under 36% of gross income.',
    category: 'Debt Management',
    difficulty: 'medium',
    estimatedDuration: '3-12 months',
    minGap: 75,
  },
  {
    title: 'Save for a 10-20% down payment',
    description:
      'Open a dedicated high-yield savings account. A larger down payment means lower monthly payments and no PMI.',
    category: 'Savings',
    difficulty: 'hard',
    estimatedDuration: '6-24 months',
    minGap: 70,
  },
  {
    title: 'Get pre-approved for a mortgage',
    description:
      'Shop at least 3 lenders for pre-approval. This locks in your rate range and shows sellers you are serious.',
    category: 'Mortgage',
    difficulty: 'medium',
    estimatedDuration: '2 weeks',
    minGap: 60,
  },
  {
    title: 'Increase credit score by 20+ points',
    description:
      'Pay all bills on time, reduce utilisation below 30%, and avoid opening new accounts. Small gains compound.',
    category: 'Credit',
    difficulty: 'hard',
    estimatedDuration: '2-6 months',
    minGap: 70,
  },
  {
    title: 'Understand closing costs in your market',
    description:
      'Research typical closing costs (2-5% of purchase price). Factor these into your savings target.',
    category: 'Planning',
    difficulty: 'easy',
    estimatedDuration: '1 day',
    minGap: 85,
  },
  {
    title: 'Create a post-purchase budget',
    description:
      'Model your finances after buying: mortgage, taxes, insurance, maintenance. Make sure it still works.',
    category: 'Budgeting',
    difficulty: 'medium',
    estimatedDuration: '1 week',
    minGap: 80,
  },
  {
    title: 'Set up dedicated home fund account',
    description:
      'Automate savings into a separate account labelled for your home purchase. Out of sight, out of spend.',
    category: 'Savings',
    difficulty: 'easy',
    estimatedDuration: '1 day',
    minGap: 95,
  },
];

const EMOTIONAL_ACTIONS: ActionTemplate[] = [
  {
    title: 'Write down your 3 biggest fears about this decision',
    description:
      'Name your fears to shrink them. Are they based on evidence or anxiety? This clarity changes everything.',
    category: 'Self-Reflection',
    difficulty: 'easy',
    estimatedDuration: '30 minutes',
    minGap: 90,
  },
  {
    title: 'Have the money conversation with your partner',
    description:
      'Sit down and discuss finances openly: debts, savings goals, risk tolerance. Alignment prevents resentment.',
    category: 'Relationship',
    difficulty: 'medium',
    estimatedDuration: '1-2 hours',
    minGap: 80,
  },
  {
    title: 'Visit 3 open houses with zero pressure to buy',
    description:
      'Go just to learn. Notice what you love, what you can skip, and how prices feel. Build confidence through exposure.',
    category: 'Exploration',
    difficulty: 'easy',
    estimatedDuration: '1 weekend',
    minGap: 85,
  },
  {
    title: 'Define your non-negotiables vs nice-to-haves',
    description:
      'Create two lists: what you absolutely need and what you would like. This prevents decision paralysis later.',
    category: 'Planning',
    difficulty: 'easy',
    estimatedDuration: '1 hour',
    minGap: 90,
  },
  {
    title: 'Talk to 2 friends who recently bought',
    description:
      'Ask about their experience honestly: what surprised them, what they wish they knew, what they love.',
    category: 'Social Support',
    difficulty: 'easy',
    estimatedDuration: '1 week',
    minGap: 85,
  },
  {
    title: 'Agree on a decision framework with your partner',
    description:
      'How will you decide together? Establish rules: both must agree, set a budget ceiling, define walkaway points.',
    category: 'Relationship',
    difficulty: 'medium',
    estimatedDuration: '1-2 hours',
    minGap: 75,
  },
  {
    title: 'Journal about your ideal living situation',
    description:
      'Spend 20 minutes writing about your perfect day in your new home. Let vision drive action, not just numbers.',
    category: 'Self-Reflection',
    difficulty: 'easy',
    estimatedDuration: '20 minutes',
    minGap: 95,
  },
  {
    title: 'Address lifestyle change readiness',
    description:
      'Homeownership means less flexibility and more responsibility. Are you genuinely ready for that shift?',
    category: 'Self-Reflection',
    difficulty: 'medium',
    estimatedDuration: '1 week',
    minGap: 70,
  },
  {
    title: 'Create a shared vision board',
    description:
      'Collect images, layouts, and neighborhood vibes that excite both of you. Shared vision creates shared motivation.',
    category: 'Relationship',
    difficulty: 'easy',
    estimatedDuration: '2 hours',
    minGap: 80,
  },
];

const TIMING_ACTIONS: ActionTemplate[] = [
  {
    title: 'Research market conditions in your target area',
    description:
      'Track listing prices, days on market, and inventory levels. Understanding trends helps you time your move.',
    category: 'Market Research',
    difficulty: 'easy',
    estimatedDuration: '1 week',
    minGap: 90,
  },
  {
    title: 'Set a decision deadline 6 months out',
    description:
      'Deadlines create urgency. Pick a date to either commit or reassess, and work backward from there.',
    category: 'Planning',
    difficulty: 'medium',
    estimatedDuration: '1 day',
    minGap: 80,
  },
  {
    title: 'Evaluate your lease or current housing timeline',
    description:
      'When does your lease end? What is the cost of month-to-month? Align your home search with natural transitions.',
    category: 'Logistics',
    difficulty: 'easy',
    estimatedDuration: '1 day',
    minGap: 85,
  },
  {
    title: 'Check if any life events affect your timeline',
    description:
      'Job changes, family planning, school districts, relocations. Map life events against your buying window.',
    category: 'Life Planning',
    difficulty: 'easy',
    estimatedDuration: '1 hour',
    minGap: 90,
  },
  {
    title: 'Monitor interest rate trends weekly',
    description:
      'Set up rate alerts. Even 0.25% matters on a 30-year mortgage. Be ready to act when rates dip.',
    category: 'Market Research',
    difficulty: 'easy',
    estimatedDuration: 'Ongoing',
    minGap: 85,
  },
  {
    title: 'Research seasonal buying patterns',
    description:
      'Spring is competitive but has more inventory. Winter has fewer buyers but less selection. Know the tradeoffs.',
    category: 'Market Research',
    difficulty: 'easy',
    estimatedDuration: '2 hours',
    minGap: 80,
  },
  {
    title: 'Create a 90-day action timeline',
    description:
      'Map out the next 3 months: what to do each week to stay on track. A plan beats a wish every time.',
    category: 'Planning',
    difficulty: 'medium',
    estimatedDuration: '2 hours',
    minGap: 75,
  },
  {
    title: 'Assess career stability over the next 2 years',
    description:
      'Is your job secure? Are you expecting a raise or role change? Stability matters for mortgage approval.',
    category: 'Life Planning',
    difficulty: 'medium',
    estimatedDuration: '1 week',
    minGap: 70,
  },
];

const DIMENSION_ACTIONS: Record<'financial' | 'emotional' | 'timing', ActionTemplate[]> = {
  financial: FINANCIAL_ACTIONS,
  emotional: EMOTIONAL_ACTIONS,
  timing: TIMING_ACTIONS,
};

// ---------------------------------------------------------------------------
// Milestone templates per dimension
// ---------------------------------------------------------------------------

interface MilestoneTemplate {
  title: string;
  targetScore: number;
  celebrationMessage: string;
}

const DIMENSION_MILESTONES: Record<'financial' | 'emotional' | 'timing', MilestoneTemplate[]> = {
  financial: [
    {
      title: 'Financial Foundation',
      targetScore: 50,
      celebrationMessage: 'You have built a solid financial foundation. The numbers are starting to work in your favour.',
    },
    {
      title: 'Financial Confidence',
      targetScore: 65,
      celebrationMessage: 'Your financial picture is looking strong. Lenders will notice the difference.',
    },
    {
      title: 'Financial Readiness',
      targetScore: 75,
      celebrationMessage: 'Your finances are in great shape. You are ready to start the mortgage conversation.',
    },
    {
      title: 'Financial Excellence',
      targetScore: 85,
      celebrationMessage: 'Outstanding financial position. You are in the strongest possible position to buy.',
    },
  ],
  emotional: [
    {
      title: 'Clarity Achieved',
      targetScore: 50,
      celebrationMessage: 'You have named your fears and started to work through them. Clarity is power.',
    },
    {
      title: 'Partnership Aligned',
      targetScore: 65,
      celebrationMessage: 'You and your partner are on the same page. That alignment will carry you through.',
    },
    {
      title: 'Emotionally Ready',
      targetScore: 75,
      celebrationMessage: 'You feel confident and clear about this decision. Trust that feeling.',
    },
    {
      title: 'Full Conviction',
      targetScore: 85,
      celebrationMessage: 'You are emotionally certain. This is not just a house; it is your next chapter.',
    },
  ],
  timing: [
    {
      title: 'Market Aware',
      targetScore: 50,
      celebrationMessage: 'You understand the market landscape. Knowledge is your competitive advantage.',
    },
    {
      title: 'Timeline Set',
      targetScore: 65,
      celebrationMessage: 'Your timeline is clear and realistic. You know when to act.',
    },
    {
      title: 'Timing Optimised',
      targetScore: 75,
      celebrationMessage: 'Your timing is excellent. All the external factors are aligning for you.',
    },
    {
      title: 'Perfect Window',
      targetScore: 85,
      celebrationMessage: 'The timing could not be better. Life, market, and finances are all in sync.',
    },
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function rankDimensions(scores: {
  financial: number;
  emotional: number;
  timing: number;
}): Array<'financial' | 'emotional' | 'timing'> {
  return (
    ['financial', 'emotional', 'timing'] as const
  )
    .slice()
    .sort((a, b) => scores[a] - scores[b]);
}

function calculateReassessmentDays(gapToReady: number): number {
  if (gapToReady <= 15) return 30;
  if (gapToReady <= 30) return 60;
  return 90;
}

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------

export function generateTransformationPath(scores: {
  financial: number;
  emotional: number;
  timing: number;
  verdict: string;
}): TransformationPath {
  const ranked = rankDimensions(scores);
  const weakest = ranked[0];

  // Determine which dimensions need work (score < 75)
  const weakDimensions = ranked.filter((d) => scores[d] < 75);

  // If all dimensions are strong, still provide some guidance on the weakest
  const targetDimensions = weakDimensions.length > 0 ? weakDimensions : [weakest];

  // Build action items: prioritise weakest dimension, then secondary
  const actionItems: ActionItem[] = [];
  let order = 0;

  for (const dim of targetDimensions) {
    const score = scores[dim];
    const templates = DIMENSION_ACTIONS[dim];

    // Filter actions relevant to this score gap
    const relevant = templates.filter((t) => score < t.minGap);

    // Take up to 4 from the weakest, 3 from secondary, 2 from tertiary
    const limit = dim === weakest ? 4 : dim === targetDimensions[1] ? 3 : 2;
    const selected = relevant.slice(0, limit);

    for (const template of selected) {
      order += 1;
      actionItems.push({
        id: generateId(),
        title: template.title,
        description: template.description,
        dimension: dim,
        category: template.category,
        difficulty: template.difficulty,
        estimatedDuration: template.estimatedDuration,
        completed: false,
        order,
      });
    }
  }

  // Build milestones for weak dimensions
  const milestones: Milestone[] = [];
  for (const dim of targetDimensions) {
    const score = scores[dim];
    const templates = DIMENSION_MILESTONES[dim];
    const relevant = templates.filter((m) => m.targetScore > score);

    for (const template of relevant) {
      milestones.push({
        id: generateId(),
        title: template.title,
        targetDimension: dim,
        targetScore: template.targetScore,
        achieved: false,
        celebrationMessage: template.celebrationMessage,
      });
    }
  }

  // Sort milestones by target score
  milestones.sort((a, b) => a.targetScore - b.targetScore);

  // Calculate reassessment date
  const avgScore = (scores.financial + scores.emotional + scores.timing) / 3;
  const gapToReady = Math.max(0, 75 - avgScore);
  const reassessmentDays = calculateReassessmentDays(gapToReady);
  const reassessmentDate = new Date();
  reassessmentDate.setDate(reassessmentDate.getDate() + reassessmentDays);

  return {
    id: generateId(),
    assessmentId: generateId(),
    status: 'active',
    weakestDimension: weakest,
    actionItems,
    milestones,
    reassessmentDate: reassessmentDate.toISOString().split('T')[0],
    daysOnPath: 0,
    completionPercentage: 0,
  };
}
