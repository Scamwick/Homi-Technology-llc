'use client';

import { useState } from 'react';
import { ListTodo, Plus } from 'lucide-react';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Task Management — Client Component
 *
 * Kanban-style task board. Task data will be stored in a dedicated tasks
 * table once the task management API is implemented. For now, the board
 * renders empty and allows adding tasks locally.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in_progress' | 'done';
  dueDate: string;
}

const COLUMNS = [
  { key: 'todo' as const, label: 'To Do', color: '#22d3ee' },
  { key: 'in_progress' as const, label: 'In Progress', color: '#facc15' },
  { key: 'done' as const, label: 'Done', color: '#34d399' },
];

const PRIORITY_STYLES: Record<string, string> = {
  high: 'bg-[rgba(239,68,68,0.1)] text-[#ef4444] border-[#ef4444]',
  medium: 'bg-[rgba(250,204,21,0.1)] text-[#facc15] border-[#facc15]',
  low: 'bg-[rgba(148,163,184,0.1)] text-[#94a3b8] border-[#94a3b8]',
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#e2e8f0]">Task Management</h1>
          <p className="mt-1 text-sm text-[#94a3b8]">{tasks.length} tasks</p>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);
          return (
            <div key={col.key} className="rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] backdrop-blur-xl">
              <div className="flex items-center gap-2 border-b border-[rgba(34,211,238,0.1)] px-4 py-3">
                <span className="size-2 rounded-full" style={{ backgroundColor: col.color }} />
                <h3 className="text-sm font-semibold text-[#e2e8f0]">{col.label}</h3>
                <span className="ml-auto rounded-full bg-[rgba(34,211,238,0.1)] px-2 py-0.5 text-[11px] font-bold text-[#94a3b8]">
                  {colTasks.length}
                </span>
              </div>
              <div className="min-h-[200px] space-y-3 p-4">
                {colTasks.length > 0 ? (
                  colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-lg border border-[rgba(34,211,238,0.05)] bg-[rgba(10,22,40,0.5)] p-3"
                    >
                      <p className="text-sm font-medium text-[#e2e8f0]">{task.title}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${PRIORITY_STYLES[task.priority]}`}>
                          {task.priority}
                        </span>
                        <span className="text-[11px] text-[#94a3b8]">{task.dueDate}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex h-[160px] items-center justify-center">
                    <p className="text-xs text-[#94a3b8]">
                      {col.key === 'todo'
                        ? 'No tasks yet. Task management API pending.'
                        : 'No tasks in this column.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-[rgba(34,211,238,0.1)] bg-[rgba(15,23,42,0.6)] p-6 text-center backdrop-blur-xl">
        <ListTodo className="mx-auto h-8 w-8 text-[#94a3b8]" />
        <p className="mt-3 text-sm font-medium text-[#e2e8f0]">Task System</p>
        <p className="mt-1 text-xs text-[#94a3b8]">
          Task management will be powered by a dedicated tasks table in Supabase.
          Create, assign, and track tasks once the API is connected.
        </p>
      </div>
    </div>
  );
}
