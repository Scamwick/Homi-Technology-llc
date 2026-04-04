'use client';

import { CalendarDays, Clock } from 'lucide-react';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Schedule — Client Component
 *
 * Weekly schedule view. Schedule data will come from a dedicated
 * schedules/shifts table or calendar integration once implemented.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function SchedulePage() {
  const today = new Date();
  const todayIdx = today.getDay() === 0 ? 6 : today.getDay() - 1; // Mon=0, Sun=6

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#e2e8f0]">Schedule</h1>
        <p className="mt-1 text-sm text-[#94a3b8]">
          Week of{' '}
          {new Date(today.getTime() - todayIdx * 86400000).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
          })}{' '}
          &mdash;{' '}
          {new Date(today.getTime() + (6 - todayIdx) * 86400000).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* Weekly Grid */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-7">
        {DAYS.map((day, idx) => {
          const isToday = idx === todayIdx;
          return (
            <div
              key={day}
              className={`rounded-xl border p-4 backdrop-blur-xl transition-all ${
                isToday
                  ? 'border-[rgba(34,211,238,0.3)] bg-[rgba(34,211,238,0.05)]'
                  : 'border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className={`text-sm font-semibold ${isToday ? 'text-[#22d3ee]' : 'text-[#e2e8f0]'}`}>
                  {day.slice(0, 3)}
                </h3>
                {isToday && (
                  <span className="rounded-full bg-[rgba(34,211,238,0.15)] px-2 py-0.5 text-[10px] font-bold text-[#22d3ee]">
                    Today
                  </span>
                )}
              </div>
              <div className="mt-3 min-h-[120px] space-y-2">
                <p className="text-xs text-[#94a3b8] text-center mt-8">
                  No events scheduled
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info */}
      <div className="rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] p-6 text-center backdrop-blur-xl">
        <CalendarDays className="mx-auto h-8 w-8 text-[#94a3b8]" />
        <p className="mt-3 text-sm font-medium text-[#e2e8f0]">Schedule System</p>
        <p className="mt-1 text-xs text-[#94a3b8]">
          Schedule management will be powered by a calendar integration.
          Shifts, meetings, and events will appear here once connected.
        </p>
      </div>
    </div>
  );
}
