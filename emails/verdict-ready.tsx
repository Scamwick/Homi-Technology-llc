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
  Hr,
} from '@react-email/components'

interface VerdictReadyEmailProps {
  userName: string
  verdict: 'ready' | 'not_yet'
  financialScore: number
  emotionalScore: number
  timingScore: number
  overallScore: number
  assessmentUrl: string
}

export default function VerdictReadyEmail({
  userName = 'There',
  verdict = 'not_yet',
  financialScore = 65,
  emotionalScore = 70,
  timingScore = 60,
  overallScore = 65,
  assessmentUrl = 'https://homi.io/assessments',
}: VerdictReadyEmailProps) {
  const isReady = verdict === 'ready'
  
  return (
    <Html>
      <Head />
      <Preview>
        Your HōMI Decision Readiness Assessment is Complete!
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>
            {isReady ? '🎉 You\'re READY!' : '🌱 Your Journey Begins'}
          </Heading>
          
          <Text style={text}>Hi {userName},</Text>
          
          <Text style={text}>
            {isReady 
              ? 'Great news! Your decision readiness assessment is complete, and you\'ve achieved a READY verdict. You\'re well-positioned to move forward with confidence.'
              : 'Your decision readiness assessment is complete. While you\'re not quite ready yet, we\'ve created a personalized transformation path to help you get there.'}
          </Text>

          <Section style={scoreSection}>
            <Heading style={h2}>Your Scores</Heading>
            
            <div style={scoreRow}>
              <Text style={scoreLabel}>Financial Reality</Text>
              <Text style={{ ...scoreValue, color: getScoreColor(financialScore) }}>
                {financialScore}%
              </Text>
            </div>
            
            <div style={scoreRow}>
              <Text style={scoreLabel}>Emotional Truth</Text>
              <Text style={{ ...scoreValue, color: getScoreColor(emotionalScore) }}>
                {emotionalScore}%
              </Text>
            </div>
            
            <div style={scoreRow}>
              <Text style={scoreLabel}>Perfect Timing</Text>
              <Text style={{ ...scoreValue, color: getScoreColor(timingScore) }}>
                {timingScore}%
              </Text>
            </div>
            
            <Hr style={divider} />
            
            <div style={scoreRow}>
              <Text style={scoreLabel}>Overall Readiness</Text>
              <Text style={{ ...scoreValue, color: getScoreColor(overallScore), fontSize: '24px' }}>
                {overallScore}%
              </Text>
            </div>
          </Section>

          <Section style={ctaSection}>
            <Button
              href={assessmentUrl}
              style={{
                ...button,
                backgroundColor: isReady ? '#10b981' : '#06b6d4',
              }}
            >
              {isReady ? 'View Full Report' : 'View Your Transformation Path'}
            </Button>
          </Section>

          <Text style={footer}>
            This email was sent by HōMI — The Emotionally Intelligent Decision OS.
            <br />
            If you have questions, reply to this email or contact us at support@homi.io
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#10b981'
  if (score >= 65) return '#f59e0b'
  if (score >= 50) return '#f97316'
  return '#ef4444'
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
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 20px',
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

const scoreSection = {
  backgroundColor: '#1e293b',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
}

const scoreRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  margin: '12px 0',
}

const scoreLabel = {
  color: '#94a3b8',
  fontSize: '14px',
  margin: '0',
}

const scoreValue = {
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0',
}

const divider = {
  borderColor: '#334155',
  margin: '16px 0',
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
