import { Toaster } from 'react-hot-toast'

import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { IBM_Plex_Sans_Thai } from 'next/font/google'
import localFont from 'next/font/local'

import '@/app/globals.css'
import { QueryProviders } from '@/providers/QueryProviders'

import { ThemeProvider } from '@/components/ThemeProvider'

import { cn } from '@/lib/utils'

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  subsets: ['thai', 'latin'],
  variable: '--font-sans',
  display: 'swap',
})

const pgHomeplace = localFont({
  src: [
    {
      path: './fonts/PG Homeplace Thin.ttf',
      weight: '100',
      style: 'normal',
    },
    {
      path: './fonts/PG Homeplace Thin.ttf',
      weight: '200',
      style: 'normal',
    },
    {
      path: './fonts/PG Homeplace Thin.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: './fonts/PG Homeplace.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/PG Homeplace.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/PG Homeplace Bold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: './fonts/PG Homeplace Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/PG Homeplace Bold.ttf',
      weight: '800',
      style: 'normal',
    },
    {
      path: './fonts/PG Homeplace Bold.ttf',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-landing',
  display: 'swap',
  declarations: [{ prop: 'size-adjust', value: '140%' }],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://sitepow.store'),
  applicationName: 'Sitepow Store',
  title: {
    default:
      'Sitepow Store — ระบบจัดการร้านค้าออนไลน์ ครบวงจร โปรแกรม POS สต็อกสินค้า 0% GP',
    template: '%s — Sitepow Store',
  },
  description:
    'Sitepow Store แพลตฟอร์มระบบจัดการร้านค้าออนไลน์ครบวงจร รวมระบบหลังบ้าน จัดการสต็อกสินค้าหลายสาขา โปรแกรม POS หน้าร้าน AI ตรวจสลิปโอนเงิน ระบบตัวแทนจำหน่าย ขายฟรี 0% GP สมัครเปิดร้านฟรี',
  keywords: [
    'Sitepow',
    'Sitepow Store',
    'ไซต์พาว',
    'ระบบจัดการร้านค้าออนไลน์',
    'เปิดร้านค้าออนไลน์ฟรี',
    'โปรแกรมจัดการร้านค้า',
    'ระบบหลังบ้านร้านค้าออนไลน์',
    'ระบบขายของออนไลน์',
    'เว็บบอร์ดขายของออนไลน์',
    'แพลตฟอร์มขายของออนไลน์',
    'ขายของออนไลน์ 0% GP',
    'เว็บขายของไม่หัก GP',

    'โปรแกรม POS',
    'ระบบ POS หน้าร้าน',
    'โปรแกรมคิดเงินหน้าร้าน',
    'ระบบขายหน้าร้าน',
    'เครื่องคิดเงิน POS',
    'พิมพ์ใบเสร็จความร้อน',
    'ระบบ POS สแกนบาร์โค้ด',

    'ระบบจัดการสต็อกสินค้า',
    'โปรแกรมสต็อกสินค้า',
    'จัดการสต็อกสินค้าหลายสาขา',
    'ระบบตัดสต็อกอัตโนมัติ',
    'เช็กสต็อกสินค้า',
    'ระบบโอนย้ายสินค้า',
    'Stock Transfer',
    'Stock Adjustment',
    'บริหารคลังสินค้า',

    'ระบบจัดการออเดอร์',
    'รวมออเดอร์ทุกช่องทาง',
    'พิมพ์ใบปะหน้าพัสดุ',
    'โปรแกรมพิมพ์ใบปะหน้า',
    'ระบบแจ้งสถานะพัสดุ',
    'เช็คเลขพัสดุอัตโนมัติ',

    'AI ตรวจสลิป',
    'ระบบตรวจสลิปโอนเงิน',
    'สแกนสลิปโอนเงินอัตโนมัติ',
    'เช็กสลิปปลอม',
    'ระบบรับชำระเงิน QR PromptPay',
    'บันทึกรายรับรายจ่ายร้านค้า',
    'คำนวณกำไรสุทธิ',

    'ระบบตัวแทนจำหน่าย',
    'ระบบขายส่ง B2B',
    'ตั้งราคาส่งตัวแทน',
    'สัญญาตัวแทนจำหน่าย',

    'ระบบสะสมแต้ม',
    'ระบบสมาชิก CRM',
    'คูปองส่วนลดร้านค้า',
    'โปรโมชั่น Flash Sale',
    'รีวิวสะสมคะแนน',

    'ระบบขายสินค้าดิจิทัล',
    'ขายคีย์เกมอัตโนมัติ',
    'ระบบส่งไฟล์ดาวน์โหลด',
    'ระบบจัดการสิทธิ์พนักงาน',
  ],
  authors: [{ name: 'Sitepow Store', url: 'https://sitepow.store' }],
  creator: 'Sitepow Store',
  publisher: 'Sitepow Store',
  category: 'ecommerce',
  classification:
    'Business & Productivity Software, E-Commerce SaaS, POS System',
  alternates: {
    canonical: '/',
    languages: {
      th: '/?lang=th',
      en: '/?lang=en',
    },
  },
  openGraph: {
    title:
      'Sitepow Store | ระบบจัดการร้านค้าออนไลน์ ครบวงจร โปรแกรม POS สต็อกสินค้า 0% GP',
    description:
      'Sitepow Store แพลตฟอร์มระบบจัดการร้านค้าออนไลน์ครบวงจร รวมระบบหลังบ้าน จัดการสต็อกสินค้าหลายสาขา โปรแกรม POS หน้าร้าน AI ตรวจสลิปโอนเงิน ระบบตัวแทนจำหน่าย ขายฟรี 0% GP สมัครเปิดร้านฟรี',
    url: 'https://sitepow.store',
    siteName: 'Sitepow Store',
    locale: 'th_TH',
    type: 'website',
    images: [
      {
        url: '/images/seo-cover.png',
        width: 1200,
        height: 630,
        alt: 'Sitepow Store - All-in-One eCommerce SaaS Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'Sitepow Store — ระบบจัดการร้านค้าออนไลน์ ครบวงจร โปรแกรม POS สต็อกสินค้า 0% GP',
    description:
      'Sitepow Store แพลตฟอร์มระบบจัดการร้านค้าออนไลน์ครบวงจร รวมระบบหลังบ้าน จัดการสต็อกสินค้าหลายสาขา โปรแกรม POS หน้าร้าน AI ตรวจสลิปโอนเงิน ระบบตัวแทนจำหน่าย ขายฟรี 0% GP สมัครเปิดร้านฟรี',
    images: ['/images/seo-cover.png'],
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
        'Sitepow Store แพลตฟอร์มระบบจัดการร้านค้าออนไลน์ครบวงจร รวมระบบหลังบ้าน สต็อกสินค้าหลายสาขา โปรแกรม POS หน้าร้าน AI ตรวจสลิปโอนเงิน และระบบตัวแทนจำหน่าย 0% GP',
      inLanguage: ['th', 'en'],
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://sitepow.store/blogs?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': 'https://sitepow.store/#organization',
      name: 'Sitepow Store',
      url: 'https://sitepow.store',
      logo: 'https://sitepow.store/favicon.ico',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        availableLanguage: ['Thai', 'English'],
        url: 'https://sitepow.store/contact',
      },
      sameAs: [
        'https://web.facebook.com/profile.php?id=61584675643468',
        'https://www.instagram.com/sitepow.store',
        'https://line.me/ti/p/~@830sdfow',
      ],
    },
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://sitepow.store/#software',
      name: 'Sitepow Store',
      operatingSystem:
        'All (Cloud-based Web Application, Windows, macOS, Android, iOS)',
      applicationCategory: 'BusinessApplication',
      applicationSubCategory: 'E-commerce & POS Management Software',
      description:
        'Sitepow Store ระบบจัดการร้านค้าออนไลน์ครบวงจร รวมระบบหลังบ้าน สต็อกสินค้าหลายสาขา โปรแกรม POS หน้าร้าน AI ตรวจสลิปโอนเงิน และระบบตัวแทนจำหน่าย 0% GP',
      url: 'https://sitepow.store',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'THB',
        priceValidUntil: '2028-12-31',
        availability: 'https://schema.org/InStock',
        description: 'เริ่มต้นใช้งานฟรี 0% GP ไม่มีค่าคอมมิชชั่น',
      },
      featureList: [
        'ระบบจัดการร้านค้าออนไลน์และหน้าเว็บส่วนตัว 0% GP',
        'โปรแกรม POS ขายหน้าร้านพร้อมตัดสต็อก Real-time',
        'ระบบจัดการสต็อกสินค้าหลายสาขา (Multi-Branch Inventory & Stock Transfer)',
        'AI ตรวจสอบสลิปโอนเงินอัตโนมัติ ป้องกันสลิปปลอม (Slip Verification)',
        'ระบบจัดการออเดอร์รวมศูนย์และพิมพ์ใบปะหน้าพัสดุ',
        'ระบบตัวแทนจำหน่ายและราคาส่ง B2B (Reseller System)',
        'ระบบสะสมแต้ม CRM และคูปองโปรโมชัน',
        'รองรับสินค้าทั่วไปและสินค้าดิจิทัล (Digital Keys & Downloads)',
      ],
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '128',
        bestRating: '5',
        worstRating: '1',
      },
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
          name: 'ฟีเจอร์และระบบทั้งหมด',
          description:
            'สำรวจฟีเจอร์ทั้งหมดของ Sitepow Store ทั้งระบบคิดเงินหน้าร้าน POS, สต็อก Real-time, AI ช่วยลงสินค้าและตรวจสลิป',
          url: 'https://sitepow.store/features',
        },
        {
          '@type': 'SiteNavigationElement',
          position: 3,
          name: 'ราคาและแพ็กเกจ',
          description:
            'ดูราคาและแพ็กเกจจัดการร้านค้าออนไลน์ Sitepow Store เริ่มต้นฟรี 0% GP',
          url: 'https://sitepow.store/pricing',
        },
        {
          '@type': 'SiteNavigationElement',
          position: 4,
          name: 'ดาวน์โหลดโปรแกรม POS',
          description:
            'ดาวน์โหลดโปรแกรมขายหน้าร้าน Sitepow POS สำหรับ Windows, macOS, Android และ iPadOS',
          url: 'https://sitepow.store/download-pos',
        },
        {
          '@type': 'SiteNavigationElement',
          position: 5,
          name: 'บทความและคู่มือ',
          description:
            'บทความ เทคนิคการขายของออนไลน์ และคู่มือใช้งานระบบร้านค้าออนไลน์ Sitepow Store',
          url: 'https://sitepow.store/blogs',
        },
        {
          '@type': 'SiteNavigationElement',
          position: 6,
          name: 'ติดต่อเรา',
          description:
            'ติดต่อทีมงาน Sitepow Store เพื่อขอคำปรึกษาการใช้งานระบบ หรือสอบถามแพ็กเกจ Enterprise',
          url: 'https://sitepow.store/contact',
        },
        {
          '@type': 'SiteNavigationElement',
          position: 7,
          name: 'สมัครเปิดร้านค้าฟรี',
          description:
            'เริ่มต้นเปิดร้านค้าออนไลน์ฟรี ครบทุกระบบจัดการสินค้า สต็อก ออเดอร์ และ POS',
          url: 'https://sitepow.store/register',
        },
        {
          '@type': 'SiteNavigationElement',
          position: 8,
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
        ibmPlexSansThai.variable,
        pgHomeplace.variable,
        'font-sans',
      )}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-background flex min-h-full flex-col font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster
            toastOptions={{
              style: {
                letterSpacing: '-0.025em',
              },
            }}
          />
          <NextIntlClientProvider locale={locale} messages={messages}>
            <QueryProviders>{children}</QueryProviders>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
