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

interface ReassessReminderEmailProps {
  userName: string
  daysSinceLastAssessment: number
  lastAssessmentDate: string
  currentScores: {
    financial: number
    emotional: number
    timing: number
  }
  reassessUrl: string
}

export default function ReassessReminderEmail({
  userName = 'There',
  daysSinceLastAssessment = 30,
  lastAssessmentDate = '30 days ago',
  currentScores = { financial: 65, emotional: 70, timing: 60 },
  reassessUrl = 'https://homi.io/assessments/new',
}: ReassessReminderEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Time to Check Your Progress — Reassess Your Decision Readiness</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Time to Reassess?</Heading>
          
          <Text style={text}>Hi {userName},</Text>
          
          <Text style={text}>
            It&apos;s been {daysSinceLastAssessment} days since your last assessment on {lastAssessmentDate}. 
            A lot can change in that time — let&apos;s see how your decision readiness has evolved!
          </Text>

          <Section style={scoreSection}>
            <Heading style={h2}>Your Last Scores</Heading>
            
            <div style={scoreRow}>
              <Text style={scoreLabel}>Financial Reality</Text>
              <Text style={{ ...scoreValue, color: getScoreColor(currentScores.financial) }}>
                {currentScores.financial}%
              </Text>
            </div>
            
            <div style={scoreRow}>
              <Text style={scoreLabel}>Emotional Truth</Text>
              <Text style={{ ...scoreValue, color: getScoreColor(currentScores.emotional) }}>
                {currentScores.emotional}%
              </Text>
            </div>
            
            <div style={scoreRow}>
              <Text style={scoreLabel}>Perfect Timing</Text>
              <Text style={{ ...scoreValue, color: getScoreColor(currentScores.timing) }}>
                {currentScores.timing}%
              </Text>
            </div>
          </Section>

          <Text style={text}>
            Regular reassessment helps you track your progress and stay on course toward your goals. 
            It only takes a few minutes!
          </Text>

          <Section style={ctaSection}>
            <Button href={reassessUrl} style={button}>
              Take New Assessment
            </Button>
          </Section>

          <Text style={tipText}>
            💡 <strong>Tip:</strong> Users who reassess monthly are 3x more likely to achieve their readiness goals.
          </Text>

          <Text style={footer}>
            This email was sent by HōMI — The Emotionally Intelligent Decision OS.
            <br />
            You can manage your notification preferences in your account settings.
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

const tipText = {
  color: '#94a3b8',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '24px 0 0',
  padding: '16px',
  backgroundColor: '#1e293b',
  borderRadius: '8px',
}

const footer = {
  color: '#64748b',
  fontSize: '12px',
  textAlign: 'center' as const,
  marginTop: '32px',
}
