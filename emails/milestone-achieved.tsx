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

interface MilestoneAchievedEmailProps {
  userName: string
  milestoneTitle: string
  milestoneDescription: string
  celebrationMessage: string
  dimension: 'financial' | 'emotional' | 'timing'
  transformationUrl: string
}

export default function MilestoneAchievedEmail({
  userName = 'There',
  milestoneTitle = 'Financial Foundation',
  milestoneDescription = 'Achieve 70+ Financial Reality score',
  celebrationMessage = 'You\'ve built a solid financial foundation!',
  dimension = 'financial',
  transformationUrl = 'https://homi.io/transformation',
}: MilestoneAchievedEmailProps) {
  const dimensionColors = {
    financial: '#06b6d4',
    emotional: '#10b981',
    timing: '#f59e0b',
  }

  const dimensionLabels = {
    financial: 'Financial Reality',
    emotional: 'Emotional Truth',
    timing: 'Perfect Timing',
  }

  return (
    <Html>
      <Head />
      <Preview>🎉 Milestone Achieved: {milestoneTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={{ ...banner, backgroundColor: dimensionColors[dimension] }}>
            <Text style={bannerText}>🎉 MILESTONE ACHIEVED</Text>
          </Section>

          <Heading style={h1}>{milestoneTitle}</Heading>
          
          <Text style={text}>Hi {userName},</Text>
          
          <Text style={text}>
            Congratulations! You&apos;ve just achieved an important milestone on your transformation journey.
          </Text>

          <Section style={milestoneSection}>
            <Text style={milestoneLabel}>{dimensionLabels[dimension]}</Text>
            <Text style={milestoneDescription_}>{milestoneDescription}</Text>
            
            <div style={celebrationBox}>
              <Text style={celebrationText}>{celebrationMessage}</Text>
            </div>
          </Section>

          <Text style={text}>
            Keep up the great work! Every step brings you closer to being fully ready for your big decision.
          </Text>

          <Section style={ctaSection}>
            <Button 
              href={transformationUrl} 
              style={{ ...button, backgroundColor: dimensionColors[dimension] }}
            >
              View Your Progress
            </Button>
          </Section>

          <Text style={footer}>
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

const banner = {
  borderRadius: '12px 12px 0 0',
  padding: '16px',
  textAlign: 'center' as const,
  margin: '-20px -20px 24px',
}

const bannerText = {
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

const milestoneSection = {
  backgroundColor: '#1e293b',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
}

const milestoneLabel = {
  color: '#94a3b8',
  fontSize: '14px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 8px',
}

const milestoneDescription_ = {
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px',
}

const celebrationBox = {
  backgroundColor: '#0a1628',
  borderRadius: '8px',
  padding: '16px',
  marginTop: '16px',
}

const celebrationText = {
  color: '#10b981',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0',
  fontStyle: 'italic',
}

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
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
  fontSize: '12px',
  textAlign: 'center' as const,
  marginTop: '32px',
}
