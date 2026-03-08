export const siteConfig = {
  name: 'HōMI',
  tagline: 'The Emotionally Intelligent Decision OS',
  description: 'Make life\'s biggest decisions with clarity and confidence. HōMI evaluates your readiness across Financial Reality, Emotional Truth, and Perfect Timing.',
  url: 'https://homi.io',
  ogImage: 'https://homi.io/og-image.png',
  twitter: '@homi_io',
  email: 'hello@homi.io',
}

export const defaultMetadata = {
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'decision making',
    'readiness assessment',
    'home buying',
    'career change',
    'financial planning',
    'emotional intelligence',
    'decision support',
    'life decisions',
  ],
  authors: [{ name: 'HōMI' }],
  creator: 'HōMI',
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: siteConfig.twitter,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export const pageMetadata: Record<string, { title: string; description: string }> = {
  home: {
    title: 'Make Life\'s Biggest Decisions with Confidence',
    description: 'HōMI evaluates your readiness across Financial Reality, Emotional Truth, and Perfect Timing. Get your personalized decision readiness score.',
  },
  dashboard: {
    title: 'Your Dashboard',
    description: 'View your decision readiness scores, track progress, and access your assessments.',
  },
  assessments: {
    title: 'Your Assessments',
    description: 'Review your past assessments and track your decision readiness journey.',
  },
  pricing: {
    title: 'Pricing',
    description: 'Choose the plan that fits your needs. Free, Plus, Pro, and Family plans available.',
  },
  login: {
    title: 'Sign In',
    description: 'Sign in to your HōMI account to access your assessments and track your progress.',
  },
  signup: {
    title: 'Get Started',
    description: 'Create your free HōMI account and start making better decisions today.',
  },
  transformation: {
    title: 'Your Transformation Path',
    description: 'Follow your personalized action plan to improve your decision readiness.',
  },
  trinity: {
    title: 'Trinity Engine',
    description: 'Get three AI perspectives on your decision from the Rationalist, Intuitive, and Pragmatist.',
  },
  couples: {
    title: 'Couples Mode',
    description: 'Take assessments with your partner and see how aligned you are on your big decisions.',
  },
  privacy: {
    title: 'Privacy Policy',
    description: 'Learn how HōMI protects your data and privacy.',
  },
  terms: {
    title: 'Terms of Service',
    description: 'Read the terms and conditions for using HōMI.',
  },
}

export function generatePageMetadata(page: keyof typeof pageMetadata) {
  const meta = pageMetadata[page]
  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
    },
    twitter: {
      title: meta.title,
      description: meta.description,
    },
  }
}
