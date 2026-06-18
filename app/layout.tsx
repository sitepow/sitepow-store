import { Toaster } from 'react-hot-toast'

import type { Metadata } from 'next'
import {
  Dancing_Script,
  IBM_Plex_Sans_Thai_Looped,
  Inter,
} from 'next/font/google'

import { QueryProviders } from '@/providers/QueryProviders'
import { SessionProviders } from '@/providers/SessionProviders'

import { ThemeProvider } from '@/components/ThemeProvider'

import { cn } from '@/lib/utils'

import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

const ibmPlexSansThaiLooped = IBM_Plex_Sans_Thai_Looped({
  subsets: ['latin', 'thai'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
})

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  variable: '--font-signature',
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
        dancingScript.variable,
        'font-sans',
        inter.variable,
      )}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster />
          <SessionProviders>
            <QueryProviders>{children}</QueryProviders>
          </SessionProviders>
        </ThemeProvider>
      </body>
    </html>
  )
}
