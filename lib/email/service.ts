import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  if (!resend) {
    console.warn('[Email] RESEND_API_KEY not configured. Email not sent:', { to, subject })
    return { success: false, error: 'Email service not configured' }
  }

  const { data, error } = await resend.emails.send({
    from:
      process.env.RESEND_FROM_EMAIL || 'H\u014dMI <noreply@homitechnology.com>',
    to,
    subject,
    html,
  })

  if (error) throw error
  return { success: true, id: data?.id }
}
