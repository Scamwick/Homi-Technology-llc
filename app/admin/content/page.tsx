'use client';

import { useState } from 'react';
import { Plus, Mail, ToggleLeft, ToggleRight } from 'lucide-react';

/* ── Mock Data ────────────────────────────────────────────────────────────── */

interface MockQuestion {
  id: string;
  dimension: string;
  question: string;
  type: 'Likert' | 'Multiple Choice' | 'Open Text' | 'Numeric';
  weight: number;
  active: boolean;
}

const MOCK_QUESTIONS: MockQuestion[] = [
  {
    id: 'Q001',
    dimension: 'Financial',
    question: 'How many months of expenses do you have saved as an emergency fund?',
    type: 'Numeric',
    weight: 1.2,
    active: true,
  },
  {
    id: 'Q002',
    dimension: 'Financial',
    question: 'What percentage of your monthly income goes toward debt payments?',
    type: 'Numeric',
    weight: 1.1,
    active: true,
  },
  {
    id: 'Q003',
    dimension: 'Emotional',
    question: 'How confident do you feel about making this decision right now?',
    type: 'Likert',
    weight: 1.0,
    active: true,
  },
  {
    id: 'Q004',
    dimension: 'Emotional',
    question: 'Have you experienced any major life stressors in the past 6 months?',
    type: 'Multiple Choice',
    weight: 0.9,
    active: true,
  },
  {
    id: 'Q005',
    dimension: 'Knowledge',
    question: 'How well do you understand the key risks involved in this decision?',
    type: 'Likert',
    weight: 1.0,
    active: true,
  },
  {
    id: 'Q006',
    dimension: 'Knowledge',
    question: 'Have you consulted with a professional advisor about this decision?',
    type: 'Multiple Choice',
    weight: 0.8,
    active: true,
  },
  {
    id: 'Q007',
    dimension: 'Timing',
    question: 'What is driving the urgency of this decision?',
    type: 'Open Text',
    weight: 1.0,
    active: true,
  },
  {
    id: 'Q008',
    dimension: 'Timing',
    question: 'Are there any upcoming deadlines or time-sensitive factors?',
    type: 'Multiple Choice',
    weight: 1.1,
    active: false,
  },
  {
    id: 'Q009',
    dimension: 'Support',
    question: 'Do you have a support system (partner, family, mentor) backing this decision?',
    type: 'Likert',
    weight: 0.9,
    active: true,
  },
  {
    id: 'Q010',
    dimension: 'Support',
    question: 'How aligned is your partner/co-decision-maker on this choice?',
    type: 'Likert',
    weight: 1.0,
    active: true,
  },
];

const EMAIL_TEMPLATES = [
  {
    id: 'e1',
    name: 'Welcome Email',
    subject: 'Welcome to H\u014DMI - Your Decision Journey Starts Now',
    status: 'Active',
  },
  {
    id: 'e2',
    name: 'Assessment Complete',
    subject: 'Your H\u014DMI Assessment Results Are Ready',
    status: 'Active',
  },
  {
    id: 'e3',
    name: 'Verdict: READY',
    subject: 'Congratulations! You\'re READY',
    status: 'Active',
  },
  {
    id: 'e4',
    name: 'Verdict: BUILD_FIRST',
    subject: 'Your Personalized Growth Plan is Ready',
    status: 'Active',
  },
  {
    id: 'e5',
    name: 'Weekly Nudge',
    subject: 'Check In: How\'s Your Decision Journey Going?',
    status: 'Draft',
  },
];

const DIMENSION_STYLES: Record<string, string> = {
  Financial: 'bg-[rgba(34,211,238,0.1)] text-[#22d3ee]',
  Emotional: 'bg-[rgba(52,211,153,0.1)] text-[#34d399]',
  Knowledge: 'bg-[rgba(250,204,21,0.1)] text-[#facc15]',
  Timing: 'bg-[rgba(251,146,60,0.1)] text-[#fb923c]',
  Support: 'bg-[rgba(148,163,184,0.1)] text-[#94a3b8]',
};

/* ── Page ──────────────────────────────────────────────────────────────────── */

export default function AdminContent() {
  const [questions, setQuestions] = useState(MOCK_QUESTIONS);

  function toggleQuestion(id: string) {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, active: !q.active } : q)),
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#e2e8f0]">
          Content Management
        </h1>
        <p className="mt-1 text-sm text-[#94a3b8]">
          Question bank and email templates
        </p>
      </div>

      {/* Question Bank */}
      <div className="rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-[rgba(34,211,238,0.1)] px-5 py-4">
          <h2 className="text-sm font-semibold text-[#e2e8f0]">
            Question Bank ({questions.length})
          </h2>
          <button className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#22d3ee] to-[#34d399] px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90">
            <Plus className="h-3.5 w-3.5" />
            Add Question
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(34,211,238,0.1)]">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                  ID
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                  Dimension
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                  Question
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                  Type
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                  Weight
                </th>
                <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                  Active
                </th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q, idx) => (
                <tr
                  key={q.id}
                  className={`border-b border-[rgba(34,211,238,0.05)] ${
                    idx % 2 === 0
                      ? 'bg-[rgba(10,22,40,0.3)]'
                      : 'bg-[rgba(15,23,42,0.3)]'
                  }`}
                >
                  <td className="px-5 py-3 font-mono text-xs text-[#94a3b8]">
                    {q.id}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${DIMENSION_STYLES[q.dimension]}`}
                    >
                      {q.dimension}
                    </span>
                  </td>
                  <td className="max-w-md px-5 py-3 text-[#e2e8f0]">
                    {q.question}
                  </td>
                  <td className="px-5 py-3 text-[#94a3b8]">{q.type}</td>
                  <td className="px-5 py-3 font-medium text-[#22d3ee]">
                    {q.weight.toFixed(1)}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <button
                      onClick={() => toggleQuestion(q.id)}
                      className="transition-colors"
                    >
                      {q.active ? (
                        <ToggleRight className="h-6 w-6 text-[#34d399]" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-[#94a3b8]" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Email Templates */}
      <div className="rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] backdrop-blur-xl">
        <div className="border-b border-[rgba(34,211,238,0.1)] px-5 py-4">
          <h2 className="text-sm font-semibold text-[#e2e8f0]">
            Email Templates
          </h2>
        </div>
        <div className="divide-y divide-[rgba(34,211,238,0.05)]">
          {EMAIL_TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-[rgba(34,211,238,0.02)]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[rgba(34,211,238,0.1)]">
                  <Mail className="h-4.5 w-4.5 text-[#22d3ee]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#e2e8f0]">
                    {tpl.name}
                  </p>
                  <p className="mt-0.5 text-xs text-[#94a3b8]">
                    {tpl.subject}
                  </p>
                </div>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  tpl.status === 'Active'
                    ? 'bg-[rgba(52,211,153,0.1)] text-[#34d399]'
                    : 'bg-[rgba(250,204,21,0.1)] text-[#facc15]'
                }`}
              >
                {tpl.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
