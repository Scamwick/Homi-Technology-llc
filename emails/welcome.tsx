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

interface WelcomeEmailProps {
  userName: string
  dashboardUrl: string
}

export default function WelcomeEmail({
  userName = 'There',
  dashboardUrl = 'https://homi.io/dashboard',
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to HōMI — Your Decision Readiness Journey Starts Now</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to HōMI</Heading>
          
          <Text style={text}>Hi {userName},</Text>
          
          <Text style={text}>
            Thank you for joining HōMI — The Emotionally Intelligent Decision OS. 
            We&apos;re excited to help you make life&apos;s biggest decisions with clarity and confidence.
          </Text>

          <Section style={featureSection}>
            <Heading style={h2}>What You Can Do</Heading>
            
            <div style={feature}>
              <Text style={featureTitle}>📊 Take an Assessment</Text>
              <Text style={featureText}>
                Evaluate your readiness across Financial Reality, Emotional Truth, and Perfect Timing.
              </Text>
            </div>
            
            <div style={feature}>
              <Text style={featureTitle}>🎯 Get Your Verdict</Text>
              <Text style={featureText}>
                Receive a clear READY or NOT YET verdict based on your unique situation.
              </Text>
            </div>
            
            <div style={feature}>
              <Text style={featureTitle}>🌱 Transform Your Readiness</Text>
              <Text style={featureText}>
                Follow your personalized action plan to improve in areas that need attention.
              </Text>
            </div>
          </Section>

          <Section style={ctaSection}>
            <Button href={dashboardUrl} style={button}>
              Go to Your Dashboard
            </Button>
          </Section>

          <Text style={text}>
            Ready to get started? Take your first assessment and discover your decision readiness.
          </Text>

          <Text style={footer}>
            If you have any questions, simply reply to this email. We&apos;re here to help!
            <br /><br />
            The HōMI Team
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

const h1 = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 24px',
  textAlign: 'center' as const,
}

const h2 = {
  color: '#94a3b8',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px',
}

const text = {
  color: '#cbd5e1',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px',
}

const featureSection = {
  backgroundColor: '#1e293b',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
}

const feature = {
  margin: '16px 0',
}

const featureTitle = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 8px',
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
  backgroundColor: '#06b6d4',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  borderRadius: '8px',
  padding: '14px 32px',
  display: 'inline-block',
}

const footer = {
  color: '#64748b',
  fontSize: '14px',
  textAlign: 'center' as const,
  marginTop: '32px',
  fontStyle: 'italic',
}
