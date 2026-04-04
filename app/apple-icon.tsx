import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a1628',
          borderRadius: '40px',
        }}
      >
        <svg
          viewBox="0 0 200 200"
          width="150"
          height="150"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer ring — Financial (cyan) */}
          <circle cx="100" cy="100" r="85" stroke="#22d3ee" strokeWidth="4" opacity="0.6" />
          {/* Cardinal dots on outer ring */}
          <circle cx="100" cy="15" r="5" fill="#22d3ee" opacity="0.6" />
          <circle cx="185" cy="100" r="5" fill="#22d3ee" opacity="0.6" />
          <circle cx="100" cy="185" r="5" fill="#22d3ee" opacity="0.6" />
          <circle cx="15" cy="100" r="5" fill="#22d3ee" opacity="0.6" />

          {/* Middle ring — Emotional (emerald) */}
          <circle cx="100" cy="100" r="60" stroke="#34d399" strokeWidth="4" opacity="0.7" />
          {/* Cardinal dots on middle ring */}
          <circle cx="100" cy="40" r="4" fill="#34d399" opacity="0.7" />
          <circle cx="160" cy="100" r="4" fill="#34d399" opacity="0.7" />
          <circle cx="100" cy="160" r="4" fill="#34d399" opacity="0.7" />
          <circle cx="40" cy="100" r="4" fill="#34d399" opacity="0.7" />

          {/* Inner ring — Timing (yellow) */}
          <circle cx="100" cy="100" r="35" stroke="#facc15" strokeWidth="4" opacity="0.8" />

          {/* Keyhole center */}
          <circle cx="100" cy="96" r="12" stroke="#facc15" strokeWidth="3" fill="none" />
          <rect x="94" y="104" width="12" height="16" rx="2" stroke="#facc15" strokeWidth="3" fill="none" />
          <circle cx="100" cy="96" r="5" fill="#facc15" />
          <rect x="97" y="96" width="6" height="12" fill="#facc15" />
        </svg>
      </div>
    ),
    { ...size },
  )
}
