type OrganizationData = {
  name?: string
  url?: string
  logo?: string
  description?: string
  sameAs?: string[]
}

type SoftwareApplicationData = {
  name?: string
  description?: string
  url?: string
  applicationCategory?: string
  operatingSystem?: string
  offers?: {
    price: string
    priceCurrency: string
  }
}

type FAQData = {
  questions: { question: string; answer: string }[]
}

type JsonLdProps =
  | { type: 'Organization'; data?: OrganizationData }
  | { type: 'SoftwareApplication'; data?: SoftwareApplicationData }
  | { type: 'FAQPage'; data: FAQData }

export function JsonLd(props: JsonLdProps) {
  let structuredData: Record<string, unknown>

  switch (props.type) {
    case 'Organization': {
      const d = props.data ?? {}
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: d.name ?? 'HOMI TECHNOLOGIES LLC',
        url: d.url ?? 'https://homitechnology.com',
        logo: d.logo ?? 'https://homitechnology.com/api/og?title=H%C5%8DMI',
        description:
          d.description ??
          'Decision Readiness Intelligence\u2122 \u2014 The first AI that tells you IF you\u2019re ready, not just HOW.',
        sameAs: d.sameAs ?? ['https://x.com/Homi_Tech'],
        foundingDate: '2024',
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          url: 'https://homitechnology.com',
        },
      }
      break
    }

    case 'SoftwareApplication': {
      const d = props.data ?? {}
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: d.name ?? 'H\u014DMI',
        description:
          d.description ??
          'Decision Readiness Intelligence\u2122 \u2014 AI-powered assessments that evaluate financial, emotional, and timing readiness for major life decisions.',
        url: d.url ?? 'https://homitechnology.com',
        applicationCategory: d.applicationCategory ?? 'FinanceApplication',
        operatingSystem: d.operatingSystem ?? 'Web',
        offers: d.offers ?? {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      }
      break
    }

    case 'FAQPage': {
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: props.data.questions.map((q) => ({
          '@type': 'Question',
          name: q.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: q.answer,
          },
        })),
      }
      break
    }
  }

  // JSON-LD structured data is safe to inject as it's
  // constructed from controlled application data, not user input.
  const jsonString = JSON.stringify(structuredData)

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonString }}
    />
  )
}
