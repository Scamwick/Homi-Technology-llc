'use client';

import { FileText, Mail, Settings } from 'lucide-react';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Content Management — Placeholder for CMS integration.
 *
 * Question bank, email templates, and scoring weights will be managed
 * through a dedicated CMS once the admin API is wired up.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function AdminContentContent() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#e2e8f0]">Content Management</h1>
        <p className="mt-1 text-sm text-[#94a3b8]">Question bank, templates, and scoring configuration</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {[
          {
            icon: FileText,
            title: 'Question Bank',
            description: 'Manage assessment questions, dimensions, types, and scoring weights. Changes take effect on the next assessment.',
            status: 'Pending API integration',
            color: '#22d3ee',
          },
          {
            icon: Mail,
            title: 'Email Templates',
            description: 'Configure automated emails — welcome sequences, verdict notifications, reassessment reminders, and nurture flows.',
            status: 'Pending API integration',
            color: '#34d399',
          },
          {
            icon: Settings,
            title: 'Scoring Configuration',
            description: 'Adjust dimension weights, READY threshold, confidence bands, and Monte Carlo simulation parameters.',
            status: 'Pending API integration',
            color: '#facc15',
          },
        ].map((section) => (
          <div
            key={section.title}
            className="rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] p-6 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${section.color}15` }}
              >
                <section.icon className="h-5 w-5" style={{ color: section.color }} />
              </div>
              <h3 className="text-base font-semibold text-[#e2e8f0]">{section.title}</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#94a3b8]">{section.description}</p>
            <div className="mt-4 rounded-lg bg-[rgba(10,22,40,0.5)] px-3 py-2">
              <p className="text-xs font-medium text-[#facc15]">{section.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
