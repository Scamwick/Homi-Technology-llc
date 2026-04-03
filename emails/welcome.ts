export function welcomeEmail(data: {
  name: string
  appUrl: string
}): { subject: string; html: string } {
  const { name, appUrl } = data

  const subject =
    'Welcome to H\u014dMI \u2014 Your decision clarity starts here'

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

          <!-- Hero -->
          <tr>
            <td style="background-color: #111d32; border-radius: 12px; padding: 40px 32px;">
              <h1 style="margin: 0 0 24px 0; font-size: 28px; font-weight: 700; color: #ffffff; line-height: 1.3;">
                Welcome to H\u014dMI, ${name}!
              </h1>
              <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #cbd5e1;">
                H\u014dMI is your personal readiness compass for life's biggest decisions. We use research-backed assessments across three dimensions to give you a clear, honest picture of where you stand.
              </p>
              <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #cbd5e1;">
                Your H\u014dMI-Score isn't a judgment \u2014 it's a mirror. Whether you're evaluating a major commitment or checking in on your growth, we help you see what's really there.
              </p>
              <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: #cbd5e1;">
                Ready to discover your readiness? Take your first assessment and get your personalized score in minutes.
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${appUrl}/assessment" target="_blank" style="display: inline-block; padding: 16px 40px; background-color: #34d399; color: #0a1628; font-size: 16px; font-weight: 700; text-decoration: none; border-radius: 8px; letter-spacing: 0.5px;">
                      Take Your First Assessment
                    </a>
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
                  <td align="center" style="padding: 0 0 12px 0;">
                    <a href="https://x.com/Homi_Tech" target="_blank" style="color: #22d3ee; font-size: 13px; text-decoration: none;">Follow us on X</a>
                  </td>
                </tr>
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
