import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Button,
  Section,
} from '@react-email/components'

interface CoupleInviteEmailProps {
  inviterName: string
  inviterEmail: string
  inviteUrl: string
  expiresInDays: number
}

export default function CoupleInviteEmail({
  inviterName = 'Someone',
  inviterEmail = 'partner@example.com',
  inviteUrl = 'https://homi.io/couples/join?token=xxx',
  expiresInDays = 7,
}: CoupleInviteEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{inviterName} invited you to join Couples Mode on HōMI</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Text style={headerText}>💑 COUPLES MODE INVITATION</Text>
          </Section>

          <Heading style={h1}>You&apos;ve Been Invited!</Heading>
          
          <Text style={text}>
            <strong>{inviterName}</strong> ({inviterEmail}) has invited you to join them in HōMI Couples Mode.
          </Text>

          <Section style={infoSection}>
            <Text style={infoTitle}>What is Couples Mode?</Text>
            
            <div style={feature}>
              <Text style={featureTitle}>🤝 Joint Assessments</Text>
              <Text style={featureText}>
                Take assessments together and see your combined readiness scores.
              </Text>
            </div>
            
            <div style={feature}>
              <Text style={featureTitle}>📊 Alignment Analysis</Text>
              <Text style={featureText}>
                Discover how aligned you are across Financial, Emotional, and Timing dimensions.
              </Text>
            </div>
            
            <div style={feature}>
              <Text style={featureTitle}>💬 Discussion Prompts</Text>
              <Text style={featureText}>
                Get personalized conversation starters to help you align your thinking.
              </Text>
            </div>
          </Section>

          <Text style={text}>
            Making big decisions together requires being on the same page. Couples Mode helps you get there.
          </Text>

          <Section style={ctaSection}>
            <Button href={inviteUrl} style={button}>
              Accept Invitation
            </Button>
          </Section>

          <Text style={expiryText}>
            This invitation expires in {expiresInDays} days.
          </Text>

          <Text style={footer}>
            If you weren&apos;t expecting this invitation, you can safely ignore this email.
            <br /><br />
            This email was sent by HōMI — The Emotionally Intelligent Decision OS.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#0a1628',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px',
  maxWidth: '600px',
}

const headerSection = {
  backgroundColor: '#8b5cf6',
  borderRadius: '12px 12px 0 0',
  padding: '16px',
  textAlign: 'center' as const,
  margin: '-20px -20px 24px',
}

const headerText = {
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  letterSpacing: '2px',
  margin: '0',
}

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 20px',
  textAlign: 'center' as const,
}

const text = {
  color: '#cbd5e1',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px',
}

const infoSection = {
  backgroundColor: '#1e293b',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
}

const infoTitle = {
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px',
}

const feature = {
  margin: '16px 0',
}

const featureTitle = {
  color: '#c4b5fd',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 4px',
}

const featureText = {
  color: '#94a3b8',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0',
}

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#8b5cf6',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  borderRadius: '8px',
  padding: '14px 32px',
  display: 'inline-block',
}

const expiryText = {
  color: '#94a3b8',
  fontSize: '14px',
  textAlign: 'center' as const,
  margin: '16px 0 0',
}

const footer = {
  color: '#64748b',
  fontSize: '12px',
  textAlign: 'center' as const,
  marginTop: '32px',
}
