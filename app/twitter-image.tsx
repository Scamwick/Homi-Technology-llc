import { ImageResponse } from 'next/og'

export const alt = 'HōMI — Decision Readiness Intelligence™'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function TwitterImage() {
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
        {/* Logo */}
        <div style={{ display: 'flex', fontSize: '52px', fontWeight: 800, letterSpacing: '-1px' }}>
          <span style={{ color: '#22d3ee' }}>H</span>
          <span style={{ color: '#34d399' }}>ō</span>
          <span style={{ color: '#facc15' }}>M</span>
          <span style={{ color: '#22d3ee' }}>I</span>
        </div>

        {/* Title + Subtitle */}
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
            Decision Readiness Intelligence™
          </div>
          <div
            style={{
              fontSize: '24px',
              color: 'rgba(255, 255, 255, 0.6)',
              maxWidth: '800px',
            }}
          >
          The first AI that tells you IF you&apos;re ready, not just HOW.
          </div>
        </div>

        {/* Bottom tagline */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.4)', letterSpacing: '0.5px' }}>
            Decision Readiness Intelligence™
          </div>
          <div style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.3)' }}>
            homitechnology.com
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
