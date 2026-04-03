import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// TODO: Replace with actual types when @/types/agent is available
// import type { AgentMessage, CompletionReceipt } from '@/types/agent';

type TrustLevel = 1 | 2 | 3;

interface AgentMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  skill_id: string | null;
  trust_level: TrustLevel | null;
  created_at: string;
  metadata?: Record<string, unknown>;
}

interface CompletionReceipt {
  id: string;
  action: string;
  skill_id: string;
  status: 'completed' | 'undone' | 'failed';
  trust_level: TrustLevel;
  timestamp: string;
  details: string;
  reversible: boolean;
}

interface AgentState {
  messages: AgentMessage[];
  trustLevels: Record<string, TrustLevel>;
  installedSkills: string[];
  activityLog: CompletionReceipt[];
  typing: boolean;
  error: string | null;
}

interface AgentActions {
  sendMessage: (content: string) => Promise<void>;
  addMessage: (message: AgentMessage) => void;
  clearMessages: () => void;
  undoAction: (receiptId: string) => Promise<void>;
  installSkill: (skillId: string) => void;
  removeSkill: (skillId: string) => void;
  setTrustLevel: (skillId: string, level: TrustLevel) => void;
  setTyping: (typing: boolean) => void;
  clearError: () => void;
}

export type AgentStore = AgentState & AgentActions;

export const useAgentStore = create<AgentStore>()(
  devtools(
    (set, get) => ({
      // --- State ---
      messages: [],
      trustLevels: {},
      installedSkills: [],
      activityLog: [],
      typing: false,
      error: null,

      // --- Actions ---
      sendMessage: async (content) => {
        const userMessage: AgentMessage = {
          id: crypto.randomUUID(),
          role: 'user',
          content,
          skill_id: null,
          trust_level: null,
          created_at: new Date().toISOString(),
        };

        set(
          (state) => ({ messages: [...state.messages, userMessage] }),
          false,
          'agent/sendMessage',
        );
        set({ typing: true, error: null }, false, 'agent/typing');

        try {
          // TODO: Send to agent API endpoint
          // const response = await fetch('/api/agent/chat', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify({
          //     message: content,
          //     trust_levels: get().trustLevels,
          //   }),
          // });
          // if (!response.ok) throw new Error('Agent request failed');
          // const agentResponse: AgentMessage = await response.json();
          // set((state) => ({
          //   messages: [...state.messages, agentResponse],
          // }));

          // If the response includes a completion receipt, add it to the log
          // if (agentResponse.metadata?.receipt) {
          //   const receipt = agentResponse.metadata.receipt as CompletionReceipt;
          //   set((state) => ({
          //     activityLog: [receipt, ...state.activityLog],
          //   }));
          // }
          throw new Error('Not implemented: wire up agent API');
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Message failed';
          set({ error: message }, false, 'agent/sendMessage/error');
        } finally {
          set({ typing: false }, false, 'agent/typing/done');
        }
      },

      addMessage: (message) => {
        set(
          (state) => ({ messages: [...state.messages, message] }),
          false,
          'agent/addMessage',
        );
      },

      clearMessages: () => {
        set({ messages: [] }, false, 'agent/clearMessages');
      },

      undoAction: async (receiptId) => {
        const receipt = get().activityLog.find((r) => r.id === receiptId);
        if (!receipt) return;
        if (!receipt.reversible) {
          set(
            { error: 'This action cannot be undone' },
            false,
            'agent/undoAction/irreversible',
          );
          return;
        }

        try {
          // TODO: Call undo API
          // const response = await fetch(`/api/agent/undo/${receiptId}`, {
          //   method: 'POST',
          // });
          // if (!response.ok) throw new Error('Undo failed');

          set(
            (state) => ({
              activityLog: state.activityLog.map((r) =>
                r.id === receiptId ? { ...r, status: 'undone' as const } : r,
              ),
            }),
            false,
            'agent/undoAction',
          );
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Undo failed';
          set({ error: message }, false, 'agent/undoAction/error');
        }
      },

      installSkill: (skillId) => {
        const { installedSkills } = get();
        if (installedSkills.includes(skillId)) return;

        set(
          (state) => ({
            installedSkills: [...state.installedSkills, skillId],
            trustLevels: { ...state.trustLevels, [skillId]: 1 as TrustLevel },
          }),
          false,
          'agent/installSkill',
        );
      },

      removeSkill: (skillId) => {
        set(
          (state) => {
            const { [skillId]: _, ...remainingTrust } = state.trustLevels;
            return {
              installedSkills: state.installedSkills.filter((id) => id !== skillId),
              trustLevels: remainingTrust,
            };
          },
          false,
          'agent/removeSkill',
        );
      },

      setTrustLevel: (skillId, level) => {
        set(
          (state) => ({
            trustLevels: { ...state.trustLevels, [skillId]: level },
          }),
          false,
          'agent/setTrustLevel',
        );
      },

      setTyping: (typing) => set({ typing }, false, 'agent/setTyping'),

      clearError: () => set({ error: null }, false, 'agent/clearError'),
    }),
    { name: 'AgentStore' },
  ),
);
