'use client';

import { MessageSquare, Pin, BookOpen } from 'lucide-react';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Internal Communications — Client Component
 *
 * Team messaging, announcements, and pinned resources.
 * Will integrate with a messaging API once implemented.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function CommsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#e2e8f0]">Communications</h1>
        <p className="mt-1 text-sm text-[#94a3b8]">Internal messaging and team resources</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Announcements */}
        <div className="rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] backdrop-blur-xl">
          <div className="flex items-center gap-2 border-b border-[rgba(34,211,238,0.1)] px-5 py-4">
            <MessageSquare className="h-4.5 w-4.5 text-[#22d3ee]" />
            <h2 className="text-sm font-semibold text-[#e2e8f0]">Announcements</h2>
          </div>
          <div className="p-5">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <MessageSquare className="h-8 w-8 text-[#94a3b8]" />
              <p className="mt-3 text-sm font-medium text-[#e2e8f0]">No announcements</p>
              <p className="mt-1 text-xs text-[#94a3b8]">
                Company announcements will appear here once the messaging system is connected.
              </p>
            </div>
          </div>
        </div>

        {/* Pinned Resources */}
        <div className="rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] backdrop-blur-xl">
          <div className="flex items-center gap-2 border-b border-[rgba(34,211,238,0.1)] px-5 py-4">
            <Pin className="h-4.5 w-4.5 text-[#34d399]" />
            <h2 className="text-sm font-semibold text-[#e2e8f0]">Pinned Resources</h2>
          </div>
          <div className="p-5">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BookOpen className="h-8 w-8 text-[#94a3b8]" />
              <p className="mt-3 text-sm font-medium text-[#e2e8f0]">No resources pinned</p>
              <p className="mt-1 text-xs text-[#94a3b8]">
                Team documents, guides, and policies will be accessible here.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Chat Placeholder */}
      <div className="rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] backdrop-blur-xl">
        <div className="flex items-center gap-2 border-b border-[rgba(34,211,238,0.1)] px-5 py-4">
          <MessageSquare className="h-4.5 w-4.5 text-[#facc15]" />
          <h2 className="text-sm font-semibold text-[#e2e8f0]">Team Chat</h2>
        </div>
        <div className="p-6 text-center">
          <MessageSquare className="mx-auto h-10 w-10 text-[#94a3b8]" />
          <p className="mt-3 text-sm font-medium text-[#e2e8f0]">Team Chat</p>
          <p className="mt-1 text-xs text-[#94a3b8]">
            Real-time team messaging will be available once the communications API is integrated.
          </p>
        </div>
      </div>
    </div>
  );
}
