/**
 * Waitlist confirmation email — sent immediately when someone joins the HōMI waitlist.
 * Brand: navy bg, HōMI logo (H=cyan, ō=emerald, M=yellow, I=cyan), Inter font stack.
 */
export function waitlistConfirmationEmail(data: {
  email: string
  appUrl: string
}): { subject: string; html: string } {
  const { email, appUrl } = data

  const subject = "You're on the list — HōMI is coming"

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
      <td align="center" style="padding: 48px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; width: 100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding: 0 0 40px 0;">
              <span style="font-size: 40px; font-weight: 800; letter-spacing: -1px;">
                <span style="color: #22d3ee;">H</span><span style="color: #34d399;">\u014d</span><span style="color: #facc15;">M</span><span style="color: #22d3ee;">I</span>
              </span>
              <br />
              <span style="font-size: 12px; color: #94a3b8; letter-spacing: 2px; text-transform: uppercase;">
                Decision Readiness Intelligence\u2122
              </span>
            </td>
          </tr>

          <!-- Main card -->
          <tr>
            <td style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 48px 40px;">

              <!-- Heading -->
              <h1 style="margin: 0 0 16px 0; font-size: 28px; font-weight: 700; color: #e2e8f0; line-height: 1.3;">
                You\u2019re on the list.
              </h1>

              <p style="margin: 0 0 24px 0; font-size: 16px; color: #94a3b8; line-height: 1.7;">
                Thanks for joining the H\u014dMI waitlist. We\u2019re building something that doesn\u2019t exist yet \u2014 a platform that tells you <span style="color: #e2e8f0; font-weight: 600;">if</span> you\u2019re ready for a major life decision, not just how to execute one.
              </p>

              <!-- Three dimensions -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 32px 0;">
                <tr>
                  <td style="padding: 12px 16px; border-left: 3px solid #22d3ee; background-color: rgba(34, 211, 238, 0.05); border-radius: 0 8px 8px 0; margin-bottom: 8px;">
                    <span style="font-size: 13px; font-weight: 700; color: #22d3ee;">Financial Reality</span>
                    <span style="font-size: 13px; color: #64748b;"> \u2014 Can you actually afford it?</span>
                  </td>
                </tr>
                <tr><td style="height: 8px;"></td></tr>
                <tr>
                  <td style="padding: 12px 16px; border-left: 3px solid #34d399; background-color: rgba(52, 211, 153, 0.05); border-radius: 0 8px 8px 0;">
                    <span style="font-size: 13px; font-weight: 700; color: #34d399;">Emotional Truth</span>
                    <span style="font-size: 13px; color: #64748b;"> \u2014 Are you deciding for the right reasons?</span>
                  </td>
                </tr>
                <tr><td style="height: 8px;"></td></tr>
                <tr>
                  <td style="padding: 12px 16px; border-left: 3px solid #facc15; background-color: rgba(250, 204, 21, 0.05); border-radius: 0 8px 8px 0;">
                    <span style="font-size: 13px; font-weight: 700; color: #facc15;">Perfect Timing</span>
                    <span style="font-size: 13px; color: #64748b;"> \u2014 Is now the right moment?</span>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 32px 0; font-size: 16px; color: #94a3b8; line-height: 1.7;">
                We tell approximately <span style="color: #facc15; font-weight: 700;">70% of users to wait</span>. That\u2019s not a flaw \u2014 it\u2019s the feature. Honesty is our competitive advantage.
              </p>

              <!-- CTA -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 0 0 32px 0;">
                    <a href="${appUrl}/homi-score" style="display: inline-block; background-color: #34d399; color: #0a1628; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 10px;">
                      Learn About the H\u014dMI-Score \u2192
                    </a>
                  </td>
                </tr>
              </table>

              <!-- What to expect -->
              <div style="border-top: 1px solid #1e293b; padding-top: 24px;">
                <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #e2e8f0;">
                  What to expect:
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding: 4px 0; font-size: 14px; color: #94a3b8;">
                      \u2713 &nbsp;Early access when we launch
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; font-size: 14px; color: #94a3b8;">
                      \u2713 &nbsp;Product updates (no spam \u2014 ever)
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; font-size: 14px; color: #94a3b8;">
                      \u2713 &nbsp;First look at the H\u014dMI-Score
                    </td>
                  </tr>
                </table>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 32px 0 0 0;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b;">
                Your homie, not your banker.
              </p>
              <p style="margin: 0 0 16px 0; font-size: 12px; color: #475569;">
                \u00a9 2026 HOMI TECHNOLOGIES LLC. All rights reserved.
              </p>
              <p style="margin: 0; font-size: 11px; color: #334155;">
                You\u2019re receiving this because ${email} joined the waitlist at
                <a href="${appUrl}" style="color: #22d3ee; text-decoration: none;">homitechnology.com</a>.
              </p>
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
