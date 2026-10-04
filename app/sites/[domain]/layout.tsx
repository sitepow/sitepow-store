import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getStoreByDomain } from '@/lib/tenant/store'
import { BASE_FAVICON } from '@/constants/favicon'
import { StoreStatus } from '@/generated/prisma/enums'

import { cleanDescription, getTenantBaseUrl } from '@/lib/tenant/seo'

import { AlertLayout } from '@/components/layout/AlertLayout'

import { StoreInitializer } from './_components/layout/StoreInitializer'

type Props = {
  params: Promise<{ domain: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain } = await params
  const store = await getStoreByDomain(domain)

  if (!store) {
    notFound()
  }

  const baseUrl = await getTenantBaseUrl(domain)
  const storeName = store.name
  const storeDescription =
    cleanDescription(store.description) ||
    `เลือกซื้อสินค้าคุณภาพจาก ${storeName} บนระบบร้านค้าออนไลน์ สั่งซื้อง่าย จัดส่งรวดเร็ว ปลอดภัย`
  const storeImage =
    store.coverImage || store.logo || '/images/default-store-banner.jpg'
  const isStoreActive = store.status === StoreStatus.ACTIVE

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: `${storeName} - ร้านค้าออนไลน์คุณภาพ`,
      template: `%s | ${storeName}`,
    },
    description: storeDescription,
    icons: {
      icon: store.logo || BASE_FAVICON,
      shortcut: BASE_FAVICON,
      apple: store.logo || BASE_FAVICON,
    },
    alternates: {
      canonical: baseUrl,
    },
    openGraph: {
      type: 'website',
      locale: 'th_TH',
      url: baseUrl,
      siteName: storeName,
      title: `${storeName} | ร้านค้าออนไลน์`,
      description: storeDescription,
      images: [
        {
          url: storeImage,
          width: 1200,
          height: 630,
          alt: storeName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${storeName} | ร้านค้าออนไลน์`,
      description: storeDescription,
      images: [storeImage],
    },
    robots: {
      index: isStoreActive,
      follow: isStoreActive,
      nocache: !isStoreActive,
      googleBot: {
        index: isStoreActive,
        follow: isStoreActive,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export default async function StoreLayout({ children, params }: Props) {
  const { domain } = await params
  const store = await getStoreByDomain(domain)

  if (!store) {
    return (
      <AlertLayout title="ไม่พบร้านค้านี้ในระบบ กรุณาตรวจสอบชื่อโดเมนอีกครั้ง" />
    )
  }

  if (store.status === StoreStatus.MAINTENANCE) {
    return (
      <AlertLayout title="ร้านค้านี้กำลังปิดปรับปรุงชั่วคราว ขออภัยในความไม่สะดวกครับ" />
    )
  }

  if (store.status === StoreStatus.SUSPENDED) {
    return (
      <AlertLayout
        title={
          <>
            ร้านค้านี้หมดระยะเวลาบริการชั่วคราว หากคุณเป็นเจ้าของร้าน
            โปรดติดต่อผู้ให้บริการเพื่อเปิดใช้งานอีกครั้ง
          </>
        }
      />
    )
  }

  return (
    <>
      <StoreInitializer store={store} />
      {children}
    </>
  )
}
