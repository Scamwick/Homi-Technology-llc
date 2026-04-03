export function coupleInviteEmail(data: {
  name: string
  inviteToken: string
  appUrl: string
}): { subject: string; html: string } {
  const { name, inviteToken, appUrl } = data

  const subject = `${name} wants to align with you on H\u014dMI`

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a1628; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0a1628;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; width: 100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding: 0 0 32px 0;">
              <span style="font-size: 36px; font-weight: 800; letter-spacing: 2px;">
                <span style="color: #22d3ee;">H</span><span style="color: #34d399;">\u014d</span><span style="color: #facc15;">M</span><span style="color: #22d3ee;">I</span>
              </span>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="background-color: #111d32; border-radius: 12px; padding: 40px 32px;">
              <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: #ffffff; line-height: 1.3;">
                ${name} invited you to H\u014dMI Couples Mode
              </h1>
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
                <strong style="color: #22d3ee;">${name}</strong> wants to explore readiness together with you. H\u014dMI Couples Mode lets both partners take the same assessment independently, then reveals a shared alignment view.
              </p>
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
                You'll each get your own private H\u014dMI-Score across three dimensions \u2014 Self, Relational, and Practical \u2014 and then see where you align and where you can grow together. No scores are shared without both partners' consent.
              </p>
              <p style="margin: 0 0 32px 0; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
                Accept the invite to create your account and begin your assessment.
              </p>

              <!-- CTA -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${appUrl}/invite/${inviteToken}" target="_blank" style="display: inline-block; padding: 16px 40px; background-color: #34d399; color: #0a1628; font-size: 16px; font-weight: 700; text-decoration: none; border-radius: 8px; letter-spacing: 0.5px;">
                      Accept Invite
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Privacy note -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 24px;">
                <tr>
                  <td style="border-top: 1px solid #1e293b; padding-top: 16px;">
                    <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                      <strong style="color: #94a3b8;">Privacy first:</strong> Your individual responses and scores remain private. Only the shared alignment view is visible to both partners, and only after you both opt in.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 0 0 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="font-size: 12px; color: #64748b; line-height: 1.6;">
                    &copy; 2026 HOMI TECHNOLOGIES LLC
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-size: 12px; color: #64748b; line-height: 1.6; padding: 4px 0 0 0;">
                    You're receiving this because you signed up at homitechnology.com
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 8px 0 0 0;">
                    <a href="${appUrl}/unsubscribe" target="_blank" style="color: #64748b; font-size: 12px; text-decoration: underline;">Unsubscribe</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  return { subject, html }
}
