import { Resend } from 'resend'
import { ReactElement } from 'react'
import { render } from '@react-email/render'

// Initialize Resend (lazy - only when needed)
let resend: Resend | null = null
function getResendClient() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

const FROM_EMAIL = 'HōMI <notifications@homi.io>'

interface SendEmailOptions {
  to: string | string[]
  subject: string
  react: ReactElement
  text?: string
}

export async function sendEmail({ to, subject, react, text }: SendEmailOptions) {
  try {
    const client = getResendClient()
    if (!client) {
      throw new Error('Resend API key is not configured')
    }

    // Render React email to HTML
    const html = await render(react)

    const { data, error } = await client.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text: text || '',
    })

    if (error) {
      console.error('Error sending email:', error)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    return { success: true, id: data?.id }
  } catch (error) {
    console.error('Error in sendEmail:', error)
    throw error
  }
}

// Email sending functions for specific events
export async function sendWelcomeEmail(userEmail: string, userName: string) {
  const WelcomeEmail = (await import('../../../emails/welcome')).default
  
  return sendEmail({
    to: userEmail,
    subject: 'Welcome to HōMI — Your Decision Readiness Journey Starts Now',
    react: WelcomeEmail({ userName, dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard` }),
  })
}

export async function sendVerdictReadyEmail(
  userEmail: string,
  userName: string,
  verdict: 'ready' | 'not_yet',
  scores: {
    financial: number
    emotional: number
    timing: number
    overall: number
  },
  assessmentId: string
) {
  const VerdictReadyEmail = (await import('../../../emails/verdict-ready')).default
  
  return sendEmail({
    to: userEmail,
    subject: verdict === 'ready' 
      ? '🎉 You\'re READY! Your Assessment Results Are In'
      : '🌱 Your Assessment Results & Transformation Path',
    react: VerdictReadyEmail({
      userName,
      verdict,
      financialScore: scores.financial,
      emotionalScore: scores.emotional,
      timingScore: scores.timing,
      overallScore: scores.overall,
      assessmentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/assessments/${assessmentId}`,
    }),
  })
}

export async function sendMilestoneAchievedEmail(
  userEmail: string,
  userName: string,
  milestone: {
    title: string
    description: string
    celebration_message: string
    target_dimension: 'financial' | 'emotional' | 'timing'
  }
) {
  const MilestoneAchievedEmail = (await import('../../../emails/milestone-achieved')).default
  
  return sendEmail({
    to: userEmail,
    subject: `🎉 Milestone Achieved: ${milestone.title}`,
    react: MilestoneAchievedEmail({
      userName,
      milestoneTitle: milestone.title,
      milestoneDescription: milestone.description,
      celebrationMessage: milestone.celebration_message,
      dimension: milestone.target_dimension,
      transformationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/transformation`,
    }),
  })
}

export async function sendReassessReminderEmail(
  userEmail: string,
  userName: string,
  daysSinceLastAssessment: number,
  lastAssessmentDate: string,
  currentScores: {
    financial: number
    emotional: number
    timing: number
  }
) {
  const ReassessReminderEmail = (await import('../../../emails/reassess-reminder')).default
  
  return sendEmail({
    to: userEmail,
    subject: 'Time to Check Your Progress — Reassess Your Decision Readiness',
    react: ReassessReminderEmail({
      userName,
      daysSinceLastAssessment,
      lastAssessmentDate,
      currentScores,
      reassessUrl: `${process.env.NEXT_PUBLIC_APP_URL}/assessments/new`,
    }),
  })
}

export async function sendCoupleInviteEmail(
  partnerEmail: string,
  inviterName: string,
  inviterEmail: string,
  inviteToken: string
) {
  const CoupleInviteEmail = (await import('../../../emails/couple-invite')).default
  
  return sendEmail({
    to: partnerEmail,
    subject: `${inviterName} invited you to join Couples Mode on HōMI`,
    react: CoupleInviteEmail({
      inviterName,
      inviterEmail,
      inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL}/couples/join?token=${inviteToken}`,
      expiresInDays: 7,
    }),
  })
}

// Batch email functions for cron jobs
export async function sendBatchReassessReminders(users: Array<{
  email: string
  name: string
  daysSinceLastAssessment: number
  lastAssessmentDate: string
  scores: { financial: number; emotional: number; timing: number }
}>) {
  const results = []
  
  for (const user of users) {
    try {
      const result = await sendReassessReminderEmail(
        user.email,
        user.name,
        user.daysSinceLastAssessment,
        user.lastAssessmentDate,
        user.scores
      )
      results.push({ email: user.email, success: true, id: result.id })
    } catch (error) {
      results.push({ email: user.email, success: false, error })
    }
  }
  
  return results
}
