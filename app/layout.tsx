import { Toaster } from 'react-hot-toast'

import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Sans_Thai_Looped } from 'next/font/google'

import '@/app/globals.css'
import { QueryProviders } from '@/providers/QueryProviders'

import { ThemeProvider } from '@/components/ThemeProvider'

import { cn } from '@/lib/utils'

const ibmPlexSansThaiLooped = IBM_Plex_Sans_Thai_Looped({
  subsets: ['latin', 'thai'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://sitepow.store'
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Sitepow Store | ระบบจัดการร้านค้าออนไลน์ ครบวงจร',
    template: '%s | Sitepow Store',
  },
  description:
    'Sitepow ช่วยจัดการร้านค้าออนไลน์ครบวงจร ช่วยคุณจัดการสินค้า สต็อก และออเดอร์ได้ในที่เดียว เริ่มต้นเปิดร้านค้าออนไลน์ให้ง่ายในทุกขั้นตอน',
  keywords: [
    'Sitepow',
    'ระบบจัดการร้านค้าออนไลน์',
    'จัดการสต็อกสินค้า',
    'ระบบหลังบ้านร้านค้า',
    'ขายของออนไลน์',
    'โปรแกรมสต็อกสินค้า',
    'POS',
    'ตรวจสลิปอัตโนมัติ',
  ],
  authors: [{ name: 'Sitepow Store' }],
  creator: 'Sitepow Store',
  publisher: 'Sitepow Store',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    url: BASE_URL,
    siteName: 'Sitepow Store',
    title: 'Sitepow Store | ระบบจัดการร้านค้าออนไลน์ ครบวงจร',
    description:
      'Sitepow ช่วยจัดการร้านค้าออนไลน์ครบวงจร ช่วยคุณจัดการสินค้า สต็อก และออเดอร์ได้ในที่เดียว',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sitepow Store | ระบบจัดการร้านค้าออนไลน์ ครบวงจร',
    description:
      'Sitepow ช่วยจัดการร้านค้าออนไลน์ครบวงจร ช่วยคุณจัดการสินค้า สต็อก และออเดอร์ได้ในที่เดียว',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({
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
      )}
      suppressHydrationWarning
    >
      <body className="bg-background flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster />
          <QueryProviders>{children}</QueryProviders>
        </ThemeProvider>
      </body>
    </html>
  )
}
