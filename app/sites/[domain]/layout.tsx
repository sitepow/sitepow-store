import { Metadata } from 'next'

import { BASE_FAVICON } from '@/constants/favicon'

type Props = {
  params: Promise<{ domain: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain } = await params
  const url = `https://${domain}.sitepow.store`

  return {
    title: {
      default: `ยินดีต้อนรับสู่ร้าน ${domain}`,
      template: `%s | ${domain}`,
    },
    description: `เลือกซื้อสินค้าคุณภาพจาก ${domain} บนระบบของเรา`,
    icons: {
      icon: BASE_FAVICON,
      shortcut: BASE_FAVICON,
      apple: BASE_FAVICON,
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default function StoreLayout({ children }: Props) {
  return <div>{children}</div>
}
