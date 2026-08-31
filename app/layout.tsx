import { Toaster } from 'react-hot-toast'

import type { Metadata } from 'next'
// import { NextIntlClientProvider } from 'next-intl'
// import { getMessages } from 'next-intl/server'
import { Dancing_Script, IBM_Plex_Sans_Thai, Inter } from 'next/font/google'

import '@/app/globals.css'
import { QueryProviders } from '@/providers/QueryProviders'

import { ThemeProvider } from '@/components/ThemeProvider'

import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

const ibmPlexSansThaiLooped = IBM_Plex_Sans_Thai({
  subsets: ['latin', 'thai'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
})

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  variable: '--font-signature',
})

export const metadata: Metadata = {
  title: 'FAOS Olive Oil & Honey | Premium Greek Extra Virgin Olive Oil & Organic Honey',
  description:
    'Discover FAOS premium Greek Extra Virgin Olive Oil, pure organic fir & chestnut honey. Authentic Mediterranean diet products for healthy living and fine dining.',
  keywords: [
    // แบรนด์ & จุดขายหลัก
    'FAOS',
    'FAOS Siam',
    'FAOS Olive Oil',
    'FAOS Honey',
    'FAOS Olive Oil and Honey',
    // ภาษาอังกฤษ (Global & Expat Search)
    'Greek Extra Virgin Olive Oil',
    'Organic Greek Honey',
    'Greek Fir Honey',
    'Chestnut Honey',
    'Mediterranean Diet Products',
    'Healthy Cooking Oil',
    'Premium Cold Pressed Olive Oil',
    // ภาษาไทย (Thai Local Search Target)
    'น้ำมันมะกอกกรีก',
    'น้ำมันมะกอก Extra Virgin',
    'น้ำมันมะกอกเพื่อสุขภาพ',
    'น้ำผึ้งกรีก',
    'น้ำผึ้งออร์แกนิค',
    'น้ำผึ้งดอกสนกรีก',
    'อาหารเมดิเตอร์เรเนียน',
    'น้ำมันมะกอกพรีเมียม',
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
          <QueryProviders>{children}</QueryProviders>
          {/* </NextIntlClientProvider> */}
        </ThemeProvider>
      </body>
    </html>
  )
}
