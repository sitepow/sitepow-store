import React from 'react'

interface TenantStoreJsonLdProps {
  store: {
    name: string
    description?: string | null
    logo?: string | null
    phone?: string | null
    email?: string | null
    facebookPage?: string | null
    lineId?: string | null
  }
  baseUrl: string
}

function safeSerialize(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

export function TenantStoreJsonLd({ store, baseUrl }: TenantStoreJsonLdProps) {
  const sameAs: string[] = []
  if (store.facebookPage) {
    sameAs.push(
      store.facebookPage.startsWith('http')
        ? store.facebookPage
        : `https://facebook.com/${store.facebookPage}`,
    )
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    name: store.name,
    url: baseUrl,
    ...(store.logo && { logo: store.logo, image: store.logo }),
    ...(store.description && { description: store.description }),
    ...(sameAs.length > 0 && { sameAs }),
    ...(store.phone || store.email
      ? {
          contactPoint: {
            '@type': 'ContactPoint',
            ...(store.phone && { telephone: store.phone }),
            ...(store.email && { email: store.email }),
            contactType: 'customer service',
            availableLanguage: ['Thai', 'English'],
          },
        }
      : {}),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeSerialize(schema) }}
    />
  )
}
