import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/about', '/homi-score', '/pricing', '/auth/signup', '/auth/login'],
        disallow: ['/dashboard', '/assess', '/agent', '/tools', '/settings', '/admin', '/partner', '/api', '/couples', '/notifications', '/onboarding'],
      },
    ],
    sitemap: 'https://homitechnology.com/sitemap.xml',
  }
}
