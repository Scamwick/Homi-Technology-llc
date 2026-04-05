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
          const response = await fetch('/api/agent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: content,
              conversationHistory: get().messages.slice(-20).map((m) => ({
                role: m.role,
                content: m.content,
              })),
              installedSkills: get().installedSkills,
              trustLevel: Math.max(...Object.values(get().trustLevels), 1),
            }),
          });

          if (!response.ok) throw new Error('Agent request failed');
          if (!response.body) throw new Error('No response stream');

          // Parse SSE stream
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let fullText = '';
          let buffer = '';
          const agentMessageId = crypto.randomUUID();

          // Add empty agent message that we'll update
          const agentMessage: AgentMessage = {
            id: agentMessageId,
            role: 'agent',
            content: '',
            skill_id: null,
            trust_level: null,
            created_at: new Date().toISOString(),
          };
          set(
            (state) => ({ messages: [...state.messages, agentMessage] }),
            false,
            'agent/agentMessage',
          );

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';

            for (const line of lines) {
              if (line.startsWith('event: ')) {
                const eventType = line.slice(7).trim();
                // Next line should be the data
                continue;
              }
              if (!line.startsWith('data: ')) continue;
              const jsonStr = line.slice(6).trim();
              if (!jsonStr) continue;

              try {
                const data = JSON.parse(jsonStr);

                if (data.text !== undefined) {
                  // delta event — append text
                  fullText += data.text;
                  set(
                    (state) => ({
                      messages: state.messages.map((m) =>
                        m.id === agentMessageId ? { ...m, content: fullText } : m,
                      ),
                    }),
                    false,
                    'agent/delta',
                  );
                } else if (data.id && data.clarity !== undefined) {
                  // receipt event
                  const receipt: CompletionReceipt = {
                    id: data.id,
                    action: data.action ?? '',
                    skill_id: '',
                    status: 'completed',
                    trust_level: 1,
                    timestamp: data.timestamp ?? new Date().toISOString(),
                    details: data.reasoning ?? '',
                    reversible: data.undoable ?? false,
                  };
                  set(
                    (state) => ({
                      activityLog: [receipt, ...state.activityLog],
                      messages: state.messages.map((m) =>
                        m.id === agentMessageId
                          ? { ...m, metadata: { receipt: data } }
                          : m,
                      ),
                    }),
                    false,
                    'agent/receipt',
                  );
                }
              } catch {
                // Skip malformed JSON lines
              }
            }
          }
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
