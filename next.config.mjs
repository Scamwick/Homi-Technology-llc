/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  experimental: {
    serverActions: { bodySizeLimit: '2mb' },
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        // Clickjacking protection
        { key: 'X-Frame-Options', value: 'DENY' },
        // MIME sniffing protection
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        // XSS filter (legacy browsers)
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        // Referrer control
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        // Disable unused browser features
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
        // HSTS — force HTTPS for 1 year, include subdomains
        { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        // Content Security Policy
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval needed by Next.js dev; tighten with nonces in future
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: https: blob:",
            "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://xn--hmi-qxa.com",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
          ].join('; '),
        },
      ],
    },
  ],
}
export default nextConfig
