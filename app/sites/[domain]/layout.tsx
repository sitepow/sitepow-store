import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { getStore } from '@/actions/store'
import { BASE_FAVICON } from '@/constants/favicon'
import { StoreStatus } from '@/generated/prisma/enums'

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
  const storeDomain = store.customDomain || domain
  const url = storeDomain.includes('.')
    ? `https://${storeDomain}`
    : `https://${storeDomain}.sitepow.store`

  const storeName = store.name

  const isSearchable =
    store.status === StoreStatus.ACTIVE &&
    Boolean(store.allowSearchEngineIndex ?? true)

  return {
    title: {
      default: t('welcome', { name: storeName }),
      template: `%s | ${storeName}`,
    },
    description:
      store.description || t('defaultDescription', { name: storeName }),
    icons: {
      icon: store.logo || BASE_FAVICON,
      shortcut: BASE_FAVICON,
      apple: BASE_FAVICON,
    },
    alternates: {
      canonical: url,
    },
    robots: isSearchable
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        }
      : {
          index: false,
          follow: false,
          nocache: true,
          googleBot: {
            index: false,
            follow: false,
          },
        },
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

  return (
    <>
      <StoreInitializer store={store} />
      {children}
    </>
  )
}
