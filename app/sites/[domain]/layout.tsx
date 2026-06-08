import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getStore } from '@/actions/store'
import { BASE_FAVICON } from '@/constants/favicon'
import { StoreStatus } from '@/generated/prisma/enums'

import { AlertLayout } from '@/components/layout/AlertLayout'

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

  const url = `https://${domain}.sitepow.store`
  const storeName = store.name

  return {
    title: {
      default: `ยินดีต้อนรับสู่ร้าน ${storeName}`,
      template: `%s | ${storeName}`,
    },
    description:
      store.description || `เลือกซื้อสินค้าคุณภาพจาก ${storeName} บนระบบของเรา`,
    icons: {
      icon: store.logo || BASE_FAVICON,
      shortcut: BASE_FAVICON,
      apple: BASE_FAVICON,
    },
    alternates: {
      canonical: url,
    },
    // robots: {
    //   index: store.status === StoreStatus.ACTIVE,
    //   follow: store.status === StoreStatus.ACTIVE,
    // },
    robots: {
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

  if (!store) {
    return (
      <AlertLayout
        title={`คุณสามารถเปิดร้านค้าด้วยชื่อ domain นี้ได้ในระบบ ชื่อโดเมนนี้ยังไม่ได้เปิดใช้งานในระบบของเรา คุณเองก็สามารถเป็นเจ้าของร้านค้าออนไลน์ที่สวยงามแบบนี้ได้ง่ายๆ ภายใน 5 นาที!`}
      />
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

  return children
}
