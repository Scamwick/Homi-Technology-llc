import { MessageRole, MessageMetadata } from './database'

export type { MessageMetadata }

export interface Conversation {
  id: string
  user_id: string
  assessment_id: string | null
  title: string | null
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  role: MessageRole
  content: string
  metadata: MessageMetadata | null
  created_at: string
}

export interface AdvisorContext {
  assessmentId?: string
  scores?: {
    financial: number
    emotional: number
    timing: number
    overall: number
  }
  verdict?: string
  recentAssessments?: Array<{
    id: string
    decision_type: string
    verdict: string
    completed_at: string
  }>
}

export interface SuggestedPrompt {
  id: string
  label: string
  prompt: string
  category: 'general' | 'financial' | 'emotional' | 'timing' | 'next_steps'
}
