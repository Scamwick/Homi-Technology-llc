export const HOMI_MESSAGING = {
  brand: {
    name: "HōMI",
    entity: "HOMI TECHNOLOGIES LLC",
    tagline: "Decision Readiness Intelligence",
    oneLiner: "The voice nobody else provides. Now here."
  },

  hero: {
    headline: "Every major purchase you make has one person missing from the table.",
    subhead:
      "Someone with no incentive to push you forward. Someone who asks only: Are you actually ready?",
    ctaPrimary: "Check my readiness",
    ctaSecondary: "How it works"
  },

  problem: {
    headline: "The problem nobody talks about",
    body:
      "In every major decision—home, car, education, business, marriage, career—there’s a consistent pattern: the people advising you profit when you act. Nobody profits from your readiness.",
    markets: [
      {
        title: "Real Estate",
        line:
          "Realtors profit when you buy. Lenders profit when you borrow. Nobody profits from your readiness."
      },
      {
        title: "Automotive",
        line:
          "Dealers profit when you sign. Finance companies profit from your loan. Nobody is paid to tell you to wait."
      },
      {
        title: "Education",
        line:
          "Schools profit from enrollment. Loan providers profit from debt. Your readiness is irrelevant."
      },
      {
        title: "Career",
        line:
          "Recruiters profit from placements. Nobody measures if you are ready for the jump."
      }
    ],
    coreProblem:
      "Every market has a seller with incentives. None have a buyer’s advocate asking one question: Are you actually ready for this?"
  },

  missingPiece: {
    headline: "The missing piece",
    body:
      "Someone who only profits from your clarity. Someone with zero incentive to push you either way. Someone who can tell you the truth you’re not hearing anywhere else.",
    examples: [
      "You can afford it. But you’re not emotionally ready yet. Wait.",
      "You’re emotionally ready. But the timing is wrong. Wait.",
      "Everything aligns. Now you’re ready. Go.",
      "Nobody else will tell you this. But I’m on your side."
    ]
  },

  whatHomiIs: {
    headline: "HōMI is that missing voice",
    body:
      "HōMI is a readiness intelligence platform. It tells you if you’re ready to make a major decision—not just how to do it. No commissions. No referral fees. No incentive to push you forward.",
    principles: [
      "We measure readiness, not affordability.",
      "We validate emotions, not suppress them.",
      "We protect you from pressure, not push you into action."
    ]
  },

  model: {
    headline: "Three dimensions. One verdict.",
    body:
      "HōMI measures readiness across three dimensions. When all three align, you’re READY. When they don’t, we tell you the truth: NOT YET—and exactly what needs to change.",
    dimensions: [
      {
        key: "financial",
        name: "Financial Reality",
        weight: 0.35,
        color: "cyan",
        description:
          "Can you actually afford this? Cash flow, reserves, and true affordability."
      },
      {
        key: "emotional",
        name: "Emotional Truth",
        weight: 0.35,
        color: "emerald",
        description:
          "Are you psychologically ready? Stress capacity, values alignment, and support."
      },
      {
        key: "timing",
        name: "Perfect Timing",
        weight: 0.3,
        color: "yellow",
        description:
          "Is now the right moment? Stability, opportunity windows, and trajectory."
      }
    ],
    verdictRules: [
      "READY: All three dimensions aligned.",
      "NOT YET: One or more dimensions need attention.",
      "NOT YET is not rejection. It’s protection."
    ]
  },

  trust: {
    headline: "Trust over transaction",
    body:
      "HōMI does not earn money when you buy, borrow, or sign. HōMI earns when you choose clarity. That’s the only incentive we keep.",
    line:
      "We tell most people to wait. Because honesty is rarer than you think."
  },

  footer: {
    line1: "HōMI — A Decision Companion",
    line2: "HOMI TECHNOLOGIES LLC",
    copyright: "© 2026 HōMI",
    domain: "www.hōmi.com"
  },

  voiceRules: {
    calmAuthority: "Declarative. No hedging.",
    precisionEmpathy: "Direct, human, no pity.",
    cinematicClarity: "Short sentences. No filler.",
    protectionFraming: "Systems succeed. Buffers work."
  }
} as const
