import { Toaster } from 'react-hot-toast'

import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
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
  metadataBase: new URL('https://sitepow.store'),
  title: {
    default: 'Sitepow Store: ทุกเรื่องการค้าออนไลน์ จัดการให้ง่ายแค่ปลายนิ้ว',
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
  ],
  alternates: {
    canonical: '/',
    languages: {
      th: '/?lang=th',
      en: '/?lang=en',
      zh: '/?lang=cn',
    },
  },
  openGraph: {
    title: 'Sitepow Store: ทุกเรื่องการค้าออนไลน์ จัดการให้ง่ายแค่ปลายนิ้ว',
    description:
      'Sitepow ช่วยจัดการร้านค้าออนไลน์ครบวงจร ช่วยคุณจัดการสินค้า สต็อก และออเดอร์ได้ในที่เดียว เริ่มต้นเปิดร้านค้าออนไลน์ให้ง่ายในทุกขั้นตอน',
    url: 'https://sitepow.store',
    siteName: 'Sitepow Store',
    locale: 'th_TH',
    type: 'website',
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

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://sitepow.store/#website',
      url: 'https://sitepow.store',
      name: 'Sitepow Store',
      alternateName: ['Sitepow', 'ไซต์พาว'],
      description:
        'Sitepow ช่วยจัดการร้านค้าออนไลน์ครบวงจร ช่วยคุณจัดการสินค้า สต็อก และออเดอร์ได้ในที่เดียว',
      inLanguage: ['th', 'en'],
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://sitepow.store/?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': 'https://sitepow.store/#organization',
      name: 'Sitepow Store',
      url: 'https://sitepow.store',
      logo: 'https://sitepow.store/favicon.ico',
      sameAs: [
        'https://web.facebook.com/profile.php?id=61584675643468',
        'https://www.instagram.com/sitepow.store',
        'https://line.me/ti/p/~@830sdfow',
      ],
    },
    {
      '@type': 'ItemList',
      '@id': 'https://sitepow.store/#sitelinks',
      name: 'Sitepow Store Navigation',
      description: 'เมนูและหน้าสำคัญของ Sitepow Store',
      itemListElement: [
        {
          '@type': 'SiteNavigationElement',
          position: 1,
          name: 'หน้าแรก',
          description:
            'ระบบจัดการร้านค้าออนไลน์ครบวงจร จัดการสินค้า สต็อก และออเดอร์',
          url: 'https://sitepow.store',
        },
        {
          '@type': 'SiteNavigationElement',
          position: 2,
          name: 'ราคาและแพ็กเกจ',
          description:
            'ดูราคาและแพ็กเกจจัดการร้านค้าออนไลน์ Sitepow Store เริ่มต้นฟรี 0% GP',
          url: 'https://sitepow.store/pricing',
        },
        {
          '@type': 'SiteNavigationElement',
          position: 3,
          name: 'สมัครเปิดร้านค้าฟรี',
          description:
            'เริ่มต้นเปิดร้านค้าออนไลน์ฟรี ครบทุกระบบจัดการสินค้า สต็อก ออเดอร์ และ POS',
          url: 'https://sitepow.store/register',
        },
        {
          '@type': 'SiteNavigationElement',
          position: 4,
          name: 'เข้าสู่ระบบ',
          description:
            'เข้าสู่ระบบจัดการร้านค้าหลังบ้าน POS และสินค้าของ Sitepow Store',
          url: 'https://sitepow.store/login',
        },
      ],
    },
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html
      lang={locale}
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-background flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster />
          <NextIntlClientProvider locale={locale} messages={messages}>
            <QueryProviders>{children}</QueryProviders>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
