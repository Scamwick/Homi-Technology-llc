export function verdictReadyEmail(data: {
  name: string
  score: number
  dimensions: { self: number; relational: number; practical: number }
  appUrl: string
}): { subject: string; html: string } {
  const { name, score, dimensions, appUrl } = data

  const subject = `You're Ready \u2014 Your H\u014dMI-Score is ${score}/100 \uD83D\uDD11`

  const dimensionBar = (label: string, value: number, color: string) => `
    <tr>
      <td style="padding: 6px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="font-size: 13px; color: #cbd5e1; padding: 0 0 4px 0; font-weight: 600;">${label} &mdash; ${value}/100</td>
          </tr>
          <tr>
            <td>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #1e293b; border-radius: 4px; height: 8px;">
                <tr>
                  <td style="width: ${value}%; background-color: ${color}; border-radius: 4px; height: 8px; font-size: 0; line-height: 0;">&nbsp;</td>
                  <td style="font-size: 0; line-height: 0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>`

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
                ${name}, you're ready.
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
                Your assessment is complete and the verdict is in.
              </p>

              <!-- Score Display -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 24px 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="background-color: #0a1628; border: 3px solid #34d399; border-radius: 16px; padding: 24px 48px;">
                          <span style="font-size: 48px; font-weight: 800; color: #34d399; letter-spacing: 1px;">${score}</span>
                          <span style="font-size: 20px; color: #64748b; font-weight: 600;">/100</span>
                          <br />
                          <span style="font-size: 14px; color: #34d399; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">READY</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Dimension Bars -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="padding: 8px 0 24px 0;">
                ${dimensionBar('Self', dimensions.self, '#22d3ee')}
                ${dimensionBar('Relational', dimensions.relational, '#34d399')}
                ${dimensionBar('Practical', dimensions.practical, '#facc15')}
              </table>

              <!-- CTA -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${appUrl}/results" target="_blank" style="display: inline-block; padding: 16px 40px; background-color: #34d399; color: #0a1628; font-size: 16px; font-weight: 700; text-decoration: none; border-radius: 8px; letter-spacing: 0.5px;">
                      View Full Results
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
