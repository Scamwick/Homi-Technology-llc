/**
 * Temporal Twin Service - Future Self Messaging System
 * 
 * Allows users to write messages to their future selves
 * that get delivered at a specified future date.
 */

export interface FutureMessage {
  id: string
  userId: string
  content: string
  scheduledFor: string
  delivered: boolean
  deliveredAt: string | null
  createdAt: string
  category: 'reminder' | 'encouragement' | 'goal' | 'reflection' | 'question'
  assessmentId?: string
}

export interface CreateMessageInput {
  content: string
  scheduledFor: string // ISO date string
  category: FutureMessage['category']
  assessmentId?: string
}

// Message templates for users who need inspiration
export const MESSAGE_TEMPLATES: Record<string, string[]> = {
  reminder: [
    "Remember why you started this journey. Your goals are worth the effort.",
    "Don't forget to check your emergency fund. Is it still at 6 months of expenses?",
    "Reminder: Review your decision readiness scores and celebrate progress!",
  ],
  encouragement: [
    "You've come so far since you wrote this. Keep pushing forward!",
    "No matter where you are right now, you have the strength to keep going.",
    "Believe in the person you're becoming, not just who you were.",
  ],
  goal: [
    "By now, you should have saved $X toward your goal. How are you tracking?",
    "Your target was to improve your Financial score by 10 points. Did you make it?",
    "Remember: Small steps every day lead to big achievements.",
  ],
  reflection: [
    "What has changed since you wrote this message? Are you closer to your goal?",
    "Take a moment to reflect on your decision-making journey so far.",
    "How do you feel about your decision now compared to when you wrote this?",
  ],
  question: [
    "Are you still unsure about your decision? What's holding you back?",
    "Have your priorities shifted since you started this journey?",
    "What would you tell yourself from 3 months ago?",
  ],
}

/**
 * Get a random message template
 */
export function getRandomTemplate(category: keyof typeof MESSAGE_TEMPLATES): string {
  const templates = MESSAGE_TEMPLATES[category]
  return templates[Math.floor(Math.random() * templates.length)]
}

/**
 * Calculate suggested delivery dates
 */
export function getSuggestedDates(): Array<{ label: string; date: string }> {
  const now = new Date()
  
  const addDays = (days: number) => {
    const date = new Date(now)
    date.setDate(date.getDate() + days)
    return date.toISOString()
  }
  
  const addMonths = (months: number) => {
    const date = new Date(now)
    date.setMonth(date.getMonth() + months)
    return date.toISOString()
  }
  
  return [
    { label: '30 Days', date: addDays(30) },
    { label: '3 Months', date: addMonths(3) },
    { label: '6 Months', date: addMonths(6) },
    { label: '1 Year', date: addMonths(12) },
  ]
}

/**
 * Format delivery date for display
 */
export function formatDeliveryDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) {
    return 'Overdue'
  } else if (diffDays === 0) {
    return 'Today'
  } else if (diffDays === 1) {
    return 'Tomorrow'
  } else if (diffDays < 30) {
    return `In ${diffDays} days`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `In ${months} month${months > 1 ? 's' : ''}`
  } else {
    const years = Math.floor(diffDays / 365)
    return `In ${years} year${years > 1 ? 's' : ''}`
  }
}

/**
 * Check if a message should be delivered
 */
export function shouldDeliverMessage(message: FutureMessage): boolean {
  if (message.delivered) return false
  
  const scheduledDate = new Date(message.scheduledFor)
  const now = new Date()
  
  return scheduledDate <= now
}

/**
 * Generate an AI response from "future self" (mock implementation)
 * In production, this would call an LLM API
 */
export async function generateFutureSelfResponse(
  _message: FutureMessage,
  _userContext: {
    currentScores?: { financial: number; emotional: number; timing: number }
    goals?: string[]
  }
): Promise<string> {
  const responses = [
    "Hey there, past me! Reading your message brought back so many memories. Let me tell you how things turned out...",
    "Wow, I remember writing this! So much has changed since then. Here's what happened...",
    "Thanks for leaving this message for me. It really helped me stay focused on what matters.",
    "Reading this now, I can see how far I've come. Here's an update from your future self...",
  ]
  
  return responses[Math.floor(Math.random() * responses.length)]
}
