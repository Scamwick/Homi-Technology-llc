'use client'

interface ThresholdCompassProps {
  size?: number
  animated?: boolean
  showLabels?: boolean
  showWordmark?: boolean
}

export function ThresholdCompass({ 
  size = 400, 
  animated = true, 
  showLabels = true,
  showWordmark = false 
}: ThresholdCompassProps) {
  // showWordmark reserved for future use
  return (
    <div className="threshold-compass" style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 200 200"
        className="compass-svg"
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          <filter id="glowCyan" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feFlood floodColor="#22d3ee" floodOpacity="0.5"/>
            <feComposite in2="blur" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <filter id="glowEmerald" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feFlood floodColor="#34d399" floodOpacity="0.5"/>
            <feComposite in2="blur" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <filter id="glowYellow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feFlood floodColor="#facc15" floodOpacity="0.5"/>
            <feComposite in2="blur" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <filter id="keyholeGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feFlood floodColor="#facc15" floodOpacity="0.6"/>
            <feComposite in2="blur" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <style>{`
            .ring-outer {
              animation: ${animated ? 'rotateOuter 20s linear infinite' : 'none'};
              transform-origin: center;
            }
            .ring-middle {
              animation: ${animated ? 'rotateMiddle 15s linear infinite' : 'none'};
              transform-origin: center;
            }
            .ring-inner {
              animation: ${animated ? 'rotateInner 10s linear infinite' : 'none'};
              transform-origin: center;
            }
            .keyhole-glow {
              animation: ${animated ? 'keyholeGlow 4s ease-in-out infinite' : 'none'};
            }
            @keyframes rotateOuter {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes rotateMiddle {
              from { transform: rotate(0deg); }
              to { transform: rotate(-360deg); }
            }
            @keyframes rotateInner {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes keyholeGlow {
              0%, 100% { opacity: 0.8; }
              50% { opacity: 1; }
            }
          `}</style>
        </defs>

        {/* Outer Ring (Cyan) - Financial Reality */}
        <g className="ring-outer">
          <circle cx="100" cy="100" r="90" fill="none" stroke="#22d3ee" strokeWidth="1.5" opacity="0.4"/>
          <circle cx="100" cy="100" r="85" fill="none" stroke="#22d3ee" strokeWidth="2" opacity="0.7" filter="url(#glowCyan)"/>
          
          <g stroke="#22d3ee" strokeWidth="1.5" opacity="0.8">
            <line x1="100" y1="5" x2="100" y2="12"/>
            <line x1="195" y1="100" x2="188" y2="100"/>
            <line x1="100" y1="195" x2="100" y2="188"/>
            <line x1="5" y1="100" x2="12" y2="100"/>
          </g>

          <circle cx="100" cy="10" r="3.5" fill="#22d3ee" filter="url(#glowCyan)"/>
          <circle cx="190" cy="100" r="3.5" fill="#22d3ee" filter="url(#glowCyan)"/>
          <circle cx="100" cy="190" r="3.5" fill="#22d3ee" filter="url(#glowCyan)"/>
          <circle cx="10" cy="100" r="3.5" fill="#22d3ee" filter="url(#glowCyan)"/>

          <circle cx="163.6" cy="36.4" r="2" fill="#22d3ee" opacity="0.6"/>
          <circle cx="163.6" cy="163.6" r="2" fill="#22d3ee" opacity="0.6"/>
          <circle cx="36.4" cy="163.6" r="2" fill="#22d3ee" opacity="0.6"/>
          <circle cx="36.4" cy="36.4" r="2" fill="#22d3ee" opacity="0.6"/>
        </g>

        {/* Middle Ring (Emerald) - Emotional Truth */}
        <g className="ring-middle">
          <circle cx="100" cy="100" r="65" fill="none" stroke="#34d399" strokeWidth="1" opacity="0.3"/>
          <circle cx="100" cy="100" r="60" fill="none" stroke="#34d399" strokeWidth="2" opacity="0.8" filter="url(#glowEmerald)"/>

          <circle cx="100" cy="40" r="3" fill="#34d399" filter="url(#glowEmerald)"/>
          <circle cx="160" cy="100" r="3" fill="#34d399" filter="url(#glowEmerald)"/>
          <circle cx="100" cy="160" r="3" fill="#34d399" filter="url(#glowEmerald)"/>
          <circle cx="40" cy="100" r="3" fill="#34d399" filter="url(#glowEmerald)"/>

          <circle cx="142.4" cy="57.6" r="1.5" fill="#34d399" opacity="0.5"/>
          <circle cx="142.4" cy="142.4" r="1.5" fill="#34d399" opacity="0.5"/>
          <circle cx="57.6" cy="142.4" r="1.5" fill="#34d399" opacity="0.5"/>
          <circle cx="57.6" cy="57.6" r="1.5" fill="#34d399" opacity="0.5"/>
        </g>

        {/* Inner Ring (Yellow) - Perfect Timing */}
        <g className="ring-inner">
          <circle cx="100" cy="100" r="38" fill="none" stroke="#facc15" strokeWidth="1" opacity="0.3"/>
          <circle cx="100" cy="100" r="35" fill="none" stroke="#facc15" strokeWidth="2" opacity="0.9" filter="url(#glowYellow)"/>

          <circle cx="100" cy="65" r="2" fill="#facc15" opacity="0.8"/>
          <circle cx="135" cy="100" r="2" fill="#facc15" opacity="0.8"/>
          <circle cx="100" cy="135" r="2" fill="#facc15" opacity="0.8"/>
          <circle cx="65" cy="100" r="2" fill="#facc15" opacity="0.8"/>
        </g>

        {/* Center Keyhole */}
        <g className="keyhole-glow" filter="url(#keyholeGlow)">
          <circle cx="100" cy="94" r="14" fill="none" stroke="#facc15" strokeWidth="2"/>
          <path d="M94 102 L94 120 Q94 124 98 124 L102 124 Q106 124 106 120 L106 102" fill="none" stroke="#facc15" strokeWidth="2"/>
          <circle cx="100" cy="94" r="6" fill="#facc15"/>
          <rect x="96" y="94" width="8" height="18" rx="1" fill="#facc15"/>
        </g>

        {/* Labels */}
        {showLabels && (
          <>
            <text x="100" y="8" textAnchor="middle" fill="#22d3ee" fontSize="6" fontWeight="600" opacity="0.8">FINANCIAL</text>
            <text x="100" y="195" textAnchor="middle" fill="#34d399" fontSize="6" fontWeight="600" opacity="0.8">EMOTIONAL</text>
            <text x="15" y="102" textAnchor="middle" fill="#facc15" fontSize="6" fontWeight="600" opacity="0.8">TIMING</text>
          </>
        )}
      </svg>
    </div>
  )
}
