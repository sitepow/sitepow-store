import { Toaster } from 'react-hot-toast'

import type { Metadata } from 'next'
// import { NextIntlClientProvider } from 'next-intl'
// import { getMessages } from 'next-intl/server'
import {
  Dancing_Script,
  IBM_Plex_Sans_Thai_Looped,
  Inter,
} from 'next/font/google'

import '@/app/globals.css'
import { QueryProviders } from '@/providers/QueryProviders'
import { SessionProviders } from '@/providers/SessionProviders'

import { ThemeProvider } from '@/components/ThemeProvider'

import { cn } from '@/lib/utils'

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
  ],
}

export default async function RootLayout({
  children,
  // params,
}: Readonly<{
  children: React.ReactNode
  // params: Promise<{ lng: string }>
}>) {
  // const { lng } = await params
  // const messages = await getMessages({ locale: lng })

  return (
    <html
      // lang={lng}
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
      <body className="bg-background flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster />
          {/* <NextIntlClientProvider locale={lng} messages={messages}> */}
          <SessionProviders>
            <QueryProviders>{children}</QueryProviders>
          </SessionProviders>
          {/* </NextIntlClientProvider> */}
        </ThemeProvider>
      </body>
    </html>
  )
}
