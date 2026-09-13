import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { getStore } from '@/actions/store'
import { BASE_FAVICON } from '@/constants/favicon'
import { StoreStatus } from '@/generated/prisma/enums'
import {
  buildRobots,
  getStorePreviewImage,
  getStoreUrl,
  toAbsoluteUrl,
} from '@/utils/storefront-seo'

import { AlertLayout } from '@/components/layout/AlertLayout'

import { StoreInitializer } from './_components/layout/StoreInitializer'

type Props = {
  params: Promise<{ domain: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain } = await params
  const store = await getStore({ domain })

  if (!store) {
    notFound()
  }

  const t = await getTranslations('storefront.metadata')
  const url = getStoreUrl(store, domain)

  const storeName = store.seoTitle || store.name
  const storeDescription =
    store.seoDescription ||
    store.description ||
    t('defaultDescription', { name: store.name })

  const keywords = store.seoKeywords
    ? store.seoKeywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean)
    : undefined

  const previewImage = getStorePreviewImage(store, null, url)

  return {
    metadataBase: new URL(url),
    title: {
      default: store.seoTitle || t('welcome', { name: store.name }),
      template: `%s | ${store.name}`,
    },
    description: storeDescription,
    keywords,
    icons: {
      icon: store.logo || BASE_FAVICON,
      shortcut: BASE_FAVICON,
      apple: BASE_FAVICON,
    },
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: storeName,
      description: storeDescription,
      url,
      siteName: store.name,
      locale: 'th_TH',
      images: [
        {
          url: previewImage,
          width: 1200,
          height: 630,
          alt: storeName,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: storeName,
      description: storeDescription,
      images: [previewImage],
    },
    robots: buildRobots(store),
  }
}

export default async function StoreLayout({ children, params }: Props) {
  const { domain } = await params
  const store = await getStore({ domain })
  const t = await getTranslations('storefront.alerts')

  if (!store) {
    return <AlertLayout title={t('storeNotFound')} />
  }

  if (store.status === StoreStatus.MAINTENANCE) {
    return <AlertLayout title={t('storeMaintenance')} />
  }

  if (store.status === StoreStatus.SUSPENDED) {
    return <AlertLayout title={t('storeSuspended')} />
  }

  const url = getStoreUrl(store, domain)
  const previewImage = getStorePreviewImage(store, null, url)

  const storeJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${url}/#website`,
        url,
        name: store.seoTitle || store.name,
        description: store.seoDescription || store.description || undefined,
      },
      {
        '@type': 'OnlineStore',
        '@id': `${url}/#store`,
        name: store.name,
        url,
        logo: store.logo ? toAbsoluteUrl(store.logo, url) : undefined,
        image: previewImage,
        description: store.seoDescription || store.description || undefined,
        currenciesAccepted: store.baseCurrency || 'THB',
      },
      {
        '@type': 'Organization',
        '@id': `${url}/#organization`,
        name: store.name,
        url,
        logo: store.logo ? toAbsoluteUrl(store.logo, url) : undefined,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }}
      />
      <StoreInitializer store={store} />
      {children}
    </>
  )
}
