import { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/seo/config'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/login',
    '/signup',
    '/pricing',
    '/privacy',
    '/terms',
    '/disclaimer',
    '/dashboard',
    '/assessments',
    '/transformation',
  ]

  return routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.8,
  }))
}
