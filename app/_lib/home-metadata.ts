import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'

export async function generateHomeMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const isEn = locale === 'en'

  const title = isEn
    ? 'Sitepow Store — All-in-One E-Commerce & POS Platform 0% GP'
    : 'Sitepow Store — ระบบจัดการร้านค้าออนไลน์ ครบวงจร โปรแกรม POS สต็อกสินค้า 0% GP'

  const description = isEn
    ? 'All-in-one e-commerce management platform, multi-branch inventory, omnichannel POS, automated AI slip verification, reseller system. Start free with 0% GP commission.'
    : 'Sitepow Store แพลตฟอร์มระบบจัดการร้านค้าออนไลน์ครบวงจร รวมระบบหลังบ้าน จัดการสต็อกสินค้าหลายสาขา โปรแกรม POS หน้าร้าน AI ตรวจสลิปโอนเงิน ระบบตัวแทนจำหน่าย ขายฟรี 0% GP สมัครเปิดร้านฟรี'

  return {
    title,
    description,
    alternates: {
      canonical: 'https://sitepow.store',
      languages: {
        th: 'https://sitepow.store/?lang=th',
        en: 'https://sitepow.store/?lang=en',
      },
    },
    openGraph: {
      title,
      description,
      url: 'https://sitepow.store',
      siteName: 'Sitepow Store',
      locale: isEn ? 'en_US' : 'th_TH',
      type: 'website',
      images: [
        {
          url: 'https://sitepow.store/images/seo-cover.png',
          width: 1200,
          height: 630,
          alt: 'Sitepow Store - All-in-One eCommerce SaaS Platform',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://sitepow.store/images/seo-cover.png'],
    },
  }
}
