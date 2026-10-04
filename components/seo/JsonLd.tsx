import { PRICING_PLANS } from '@/constants/billing/pricing'

export interface JsonLdProps {
  url?: string
}

const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://sitepow.store'
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

function safeSerialize(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

export function JsonLd({ url = BASE_URL }: JsonLdProps) {
  const softwareApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Sitepow Store',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser, Cloud-based',
    url,
    description:
      'Sitepow Store ระบบร้านค้าออนไลน์ ครบวงจร บริหารสต็อกสินค้าหลายสาขา ระบบจัดการออเดอร์หน้าร้านและร้านอาหาร POS ตรวจสลิปโอนเงินอัตโนมัติด้วย AI และเชื่อมต่อ Marketplace 0% GP',
    softwareVersion: '2.0',
    screenshot: `${url}/images/landing/landing-orders-managers.jpeg`,
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'THB',
      lowPrice: '0',
      highPrice: '1990',
      offerCount: PRICING_PLANS.length.toString(),
      offers: PRICING_PLANS.map((plan) => ({
        '@type': 'Offer',
        name: `Sitepow Store - แพ็กเกจ ${plan.title}`,
        price: plan.price.replace(/,/g, ''),
        priceCurrency: plan.currency,
        description: plan.description,
        url: `${url}/pricing`,
        priceValidUntil: '2026-12-31',
        seller: {
          '@type': 'Organization',
          name: 'Sitepow Store',
        },
      })),
    },
    featureList: [
      'ระบบร้านค้าออนไลน์ สำเร็จรูป เชื่อมต่อ Custom Domain และ Multi-tenant Engine',
      'ระบบสต็อกสินค้าหลายสาขา (Multi-Branch Inventory) พร้อมระบบแจ้งเตือน Min Stock',
      'ระบบจัดการออเดอร์ร้านอาหารและหน้าร้าน (POS) ตัดสต็อก Real-time',
      'ระบบโอนย้ายสินค้าระหว่างสาขา (Stock Transfer & Adjustment)',
      'ระบบตรวจสลิปโอนเงินอัตโนมัติ AI ตรวจจับสลิปปลอมและสลิปซ้ำ 100%',
      'เว็บไซต์ร้านค้าสำเร็จรูปเชื่อมต่อ Marketplace ส่งออกข้อมูลสินค้า CSV/JSON',
      '0% ค่าคอมมิชชั่นทุกออเดอร์ ไม่มีหัก GP รับรายได้เต็มจำนวน',
      'ระบบคำนวณค่าส่งอัจฉริยะตาม Matrix Big Data และพิมพ์ใบปะหน้ามาตรฐาน',
      'ระบบตัวแทนจำหน่าย (Reseller Agreement) และราคาส่ง B2B ตามระดับลูกค้า',
      'ระบบสมาชิก สะสมแต้ม (Reward Points) และเปลี่ยนรีวิวเป็นแต้มส่วนลด',
      'โครงสร้างพื้นฐานระดับ Enterprise บน CPU AMD EPYC และ Redis Caching ในไทย Latency ต่ำกว่า 10ms',
    ],
  }

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Sitepow Store',
    alternateName: ['Sitepow', 'ไซต์พาว สโตร์', 'SitepowStore'],
    url,
    logo: `${url}/images/logo-brand-green.png`,
    description:
      'Sitepow Store ผู้ให้บริการแพลตฟอร์มระบบร้านค้าออนไลน์และระบบจัดการหลังบ้าน Multi-tenant SaaS สัญชาติไทย',
    foundingDate: '2024',
    sameAs: [
      'https://www.facebook.com/sitepowstore',
      'https://twitter.com/sitepowstore',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      availableLanguage: ['Thai', 'English'],
      url: `${url}`,
    },
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'ระบบร้านค้าออนไลน์ Sitepow Store คิดค่าคอมมิชชั่น (GP) ต่อออเดอร์หรือไม่?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sitepow Store คิดค่าธรรมเนียมคอมมิชชั่น 0% ในทุกออเดอร์ ร้านค้ารับกำไรเต็มจำนวน 100% โดยไม่มีการหักเปอร์เซ็นต์ยอดขาย พร้อมปรัชญาค่าบริการ "ไม่มีขาย ไม่ต้องจ่าย" หากยอดขายเป็นศูนย์ ระบบจะไม่เก็บค่าบริการ',
        },
      },
      {
        '@type': 'Question',
        name: 'ระบบตรวจสลิปอัตโนมัติ (AI Slip Verification) ช่วยป้องกันการโกงได้อย่างไร?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'ระบบตรวจสลิปอัตโนมัติเชื่อมต่อ API ข้อมูลธุรกรรมธนาคารโดยตรง ตรวจสอบความถูกต้องของยอดเงิน ชื่อบัญชีผู้รับ วันที่และเวลาโอน พร้อมตรวจจับสลิปซ้ำและสลิปปลอมได้ 100% ภายในไม่กี่วินาที ช่วยให้ยืนยันออเดอร์ได้ทันทีโดยไม่ต้องใช้แอดมินตรวจมือ',
        },
      },
      {
        '@type': 'Question',
        name: 'รองรับการบริหารสต็อกสินค้าหลายสาขา และการโอนย้ายสินค้าระหว่างสาขาหรือไม่?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'รองรับระบบจัดการสต็อกแยกตามสาขา (Multi-Branch) แบบ Real-time สามารถตั้งค่าสต็อกขั้นต่ำ (Min Stock) เพื่อแจ้งเตือนเมื่อสินค้าใกล้หมด และมีระบบใบส่งคำขอโอนย้ายสินค้าระหว่างสาขา (Stock Transfer) พร้อมระบบบันทึกเหตุผลการปรับสต็อก (Stock Adjustment: ชำรุด/สูญหาย/หมดอายุ)',
        },
      },
      {
        '@type': 'Question',
        name: 'ระบบจัดการออเดอร์หน้าร้านและร้านอาหาร POS เชื่อมต่อกับระบบออนไลน์อย่างไร?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'ระบบ POS ของ Sitepow Store เชื่อมต่อกับฐานข้อมูลสต็อกกลางแบบ Real-time ทันทีที่มีการคิดเงินหน้าร้าน ระบบจะตัดสต็อกทั้งหน้าร้านและหน้าเว็บออนไลน์พร้อมกันทันที รองรับการสแกนบาร์โค้ด รับชำระผ่าน QR PromptPay และพิมพ์ใบเสร็จผ่านเครื่องพิมพ์ความร้อน',
        },
      },
      {
        '@type': 'Question',
        name: 'ความปลอดภัยและความเสถียรของระบบ Sitepow Store ได้มาตรฐานใด?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'ระบบทำงานบน CPU AMD EPYC™ ระดับ Enterprise ในศูนย์ข้อมูล ReadyIDC ประเทศไทย ให้ Latency ต่ำกว่า 10ms มีระบบ Redis Distributed Caching เพื่อการโหลดที่รวดเร็วทันใจ พร้อมการเข้ารหัสความปลอดภัยระดับมาตรฐานธนาคาร (SSL อัตโนมัติ) และสำรองข้อมูลอัตโนมัติทุกครั้งที่มีความเปลี่ยนแปลง',
        },
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeSerialize(softwareApplicationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeSerialize(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeSerialize(faqSchema) }}
      />
    </>
  )
}
