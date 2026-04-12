import type { Metadata } from 'next'
import { IBM_Plex_Sans_Thai_Looped, Inter } from 'next/font/google'

import { QueryProviders } from '@/providers/QueryProviders'

import { cn } from '@/lib/utils'

import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

const ibmPlexSansThaiLooped = IBM_Plex_Sans_Thai_Looped({
  subsets: ['latin', 'thai'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Sitepow Store: ทุกเรื่องการค้าออนไลน์ จัดการให้ง่ายแค่ปลายนิ้ว',
  description:
    'Sitepow ช่วยจัดการร้านค้าออนไลน์ครบวงจร ช่วยคุณจัดการสินค้า สต็อก และออเดอร์ได้ในที่เดียว เริ่มต้นเปิดร้านค้าออนไลน์ให้ง่ายในทุกขั้นตอน',
  keywords: [
    'Sitepow',
    'ระบบจัดการร้านค้าออนไลน์',
    'จัดการสต็อกสินค้า',
    'ระบบหลังบ้านร้านค้า',
    'ขายของออนไลน์',
    'โปรแกรมสต็อกสินค้า',
    'E-commerce Platform Thailand',
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="th"
      className={cn(
        'h-full',
        'antialiased',
        ibmPlexSansThaiLooped.variable,
        'font-sans',
        inter.variable,
      )}
    >
      <body className="flex min-h-full flex-col">
        <QueryProviders>{children}</QueryProviders>
      </body>
    </html>
  )
}
