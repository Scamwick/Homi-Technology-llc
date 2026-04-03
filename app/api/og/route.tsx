import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const title = searchParams.get('title') || 'Decision Readiness Intelligence\u2122'
  const subtitle = searchParams.get('subtitle') || 'The first AI that tells you IF you\u2019re ready, not just HOW.'
  const verdict = searchParams.get('verdict')
  const financial = searchParams.get('financial')
  const emotional = searchParams.get('emotional')
  const timing = searchParams.get('timing')

  const hasScores = financial && emotional && timing

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px',
          backgroundColor: '#0a1628',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top section: Logo + Verdict */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {/* Logo */}
          <div style={{ display: 'flex', fontSize: '52px', fontWeight: 800, letterSpacing: '-1px' }}>
            <span style={{ color: '#22d3ee' }}>H</span>
            <span style={{ color: '#34d399' }}>\u014D</span>
            <span style={{ color: '#facc15' }}>M</span>
            <span style={{ color: '#22d3ee' }}>I</span>
          </div>

          {/* Verdict badge */}
          {verdict && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 20px',
                borderRadius: '9999px',
                fontSize: '18px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: '#0a1628',
                backgroundColor:
                  verdict.toLowerCase() === 'ready'
                    ? '#34d399'
                    : verdict.toLowerCase() === 'not ready'
                      ? '#f87171'
                      : '#facc15',
              }}
            >
              {verdict}
            </div>
          )}
        </div>

        {/* Middle section: Title + Subtitle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              fontSize: '48px',
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.1,
              maxWidth: '900px',
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: '24px',
              color: 'rgba(255, 255, 255, 0.6)',
              maxWidth: '800px',
            }}
          >
            {subtitle}
          </div>
        </div>

        {/* Score bars (if provided) */}
        {hasScores && (
          <div style={{ display: 'flex', gap: '24px', width: '100%' }}>
            {/* Financial */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
                <span>Financial</span>
                <span style={{ color: '#22d3ee' }}>{financial}%</span>
              </div>
              <div style={{ display: 'flex', width: '100%', height: '12px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <div style={{ width: `${financial}%`, height: '100%', borderRadius: '6px', backgroundColor: '#22d3ee' }} />
              </div>
            </div>

            {/* Emotional */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
                <span>Emotional</span>
                <span style={{ color: '#34d399' }}>{emotional}%</span>
              </div>
              <div style={{ display: 'flex', width: '100%', height: '12px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <div style={{ width: `${emotional}%`, height: '100%', borderRadius: '6px', backgroundColor: '#34d399' }} />
              </div>
            </div>

            {/* Timing */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
                <span>Timing</span>
                <span style={{ color: '#facc15' }}>{timing}%</span>
              </div>
              <div style={{ display: 'flex', width: '100%', height: '12px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <div style={{ width: `${timing}%`, height: '100%', borderRadius: '6px', backgroundColor: '#facc15' }} />
              </div>
            </div>
          </div>
        )}

        {/* Bottom tagline */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.4)', letterSpacing: '0.5px' }}>
            Decision Readiness Intelligence\u2122
          </div>
          <div style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.3)' }}>
            homitechnology.com
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
      },
    },
  )
}
