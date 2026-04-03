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
    console.log('[H\u014dMI Email] Would send:', { to, subject })
    return { success: true, mock: true }
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
