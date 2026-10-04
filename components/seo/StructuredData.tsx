import { PRICING_PLANS } from '@/constants/billing/pricing'

const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://sitepow.store'
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

interface StructuredDataProps {
  url?: string
}

export function StructuredData({ url = BASE_URL }: StructuredDataProps) {
  const softwareApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Sitepow Store',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    url,
    description:
      'ระบบร้านค้าออนไลน์ ครบวงจร บริหารสต็อกสินค้าหลายสาขา ระบบ POS หน้าร้าน ตรวจสอบสลิปโอนเงินอัตโนมัติด้วย AI จัดการขนส่ง 0% GP ไร้ค่าคอมมิชชั่น',
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
        seller: {
          '@type': 'Organization',
          name: 'Sitepow Store',
        },
      })),
    },
    featureList: [
      'ระบบร้านค้าออนไลน์และหน้าร้านสำเร็จรูปเชื่อมต่อ Multi-tenant Domain',
      'ระบบสต็อกสินค้าหลายสาขา (Multi-Branch Inventory) พร้อมระบบแจ้งเตือน Min Stock',
      'ระบบโอนย้ายสินค้าระหว่างสาขา (Stock Transfer & Adjustment)',
      'ระบบขายหน้าร้าน (POS) ตัดสต็อกอัตโนมัติแบบ Real-time',
      'ระบบตรวจสลิปโอนเงินอัตโนมัติ ป้องกันสลิปปลอมและสลิปซ้ำ 100% (AI Slip Verification)',
      '0% ค่าคอมมิชชั่นทุกออเดอร์ ไม่มีหัก GP รับรายได้เต็มจำนวน',
      'ระบบคำนวณค่าส่งอัจฉริยะตาม Matrix Big Data และพิมพ์ใบปะหน้ามาตรฐาน',
      'ระบบตัวแทนจำหน่าย (Reseller) และราคาส่ง B2B ตามระดับลูกค้า',
      'ระบบสมาชิก สะสมแต้ม (Reward Points) และเปลี่ยนรีวิวเป็นแต้มส่วนลด',
      'โครงสร้างพื้นฐานระดับ Enterprise บน CPU AMD EPYC พร้อม Redis Distributed Cache ในไทย Latency ต่ำกว่า 10ms',
    ],
    screenshot: `${url}/images/landing/landing-orders-managers.jpeg`,
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
          text: 'Sitepow Store คิดค่าธรรมเนียมคอมมิชชั่น 0% ในทุกออเดอร์ ร้านค้ารับกำไรเต็มจำนวน 100% โดยไม่มีการหักเปอร์เซ็นต์ยอดขาย พร้อมปรัชญาค่าบริการ "ไม่มีขาย ไม่ต้องจ่าย" เพื่อให้ธุรกิจเติบโตได้อย่างยั่งยืน',
        },
      },
      {
        '@type': 'Question',
        name: 'ระบบตรวจสลิปอัตโนมัติ (AI Slip Verification) ช่วยป้องกันการโกงได้อย่างไร?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'ระบบตรวจสลิปอัตโนมัติเชื่อมต่อ API ข้อมูลธุรกรรมธนาคารโดยตรง สามารถตรวจสอบยอดเงิน ชื่อบัญชีผู้รับ วันที่และเวลาโอน พร้อมตรวจจับสลิปซ้ำและสลิปปลอมได้ 100% ภายในไม่กี่วินาที ช่วยให้ยืนยันออเดอร์ได้ทันทีโดยไม่ต้องใช้แอดมินตรวจมือ',
        },
      },
      {
        '@type': 'Question',
        name: 'รองรับการบริหารสต็อกสินค้าหลายสาขา และการโอนย้ายสินค้าระหว่างสาขาหรือไม่?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'รองรับระบบจัดการสต็อกแยกตามสาขา (Multi-Branch) แบบ Real-time สามารถตั้งค่าสต็อกขั้นต่ำ (Min Stock) เพื่อแจ้งเตือนเมื่อสินค้าใกล้หมด และมีระบบใบส่งคำขอโอนย้ายสินค้าระหว่างสาขา (Stock Transfer) พร้อมระบบบันทึกเหตุผลการปรับสต็อก (Stock Adjustment)',
        },
      },
      {
        '@type': 'Question',
        name: 'ระบบ POS หน้าร้าน เชื่อมต่อกับระบบร้านค้าออนไลน์อย่างไร?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'ระบบ POS ของ Sitepow Store ทำงานบน Cloud-Native ซิงค์ข้อมูลกับคลังสินค้ากลางแบบ Real-time ทันทีที่มีการยิงบาร์โค้ดขายหน้าร้าน ระบบจะตัดสต็อกทั้งหน้าร้านและออนไลน์ทันที รองรับการรับเงินโอน QR Code และพิมพ์ใบเสร็จผ่านเครื่องพิมพ์ความร้อน',
        },
      },
      {
        '@type': 'Question',
        name: 'ความปลอดภัยและความเสถียรของเซิร์ฟเวอร์ Sitepow Store เป็นอย่างไร?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'ระบบทำงานบน CPU AMD EPYC™ ระดับ Enterprise ในศูนย์ข้อมูล ReadyIDC ประเทศไทย ให้ Latency ต่ำกว่า 10ms มีระบบ Redis Distributed Caching เพื่อการโหลดที่รวดเร็วทันใจ พร้อมการเข้ารหัสความปลอดภัยระดับมาตรฐานธนาคารและสำรองข้อมูลอัตโนมัติ',
        },
      },
    ],
  }

  const renderSafeJsonLd = (schema: object) => ({
    __html: JSON.stringify(schema).replace(/</g, '\\u003c'),
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={renderSafeJsonLd(softwareApplicationSchema)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={renderSafeJsonLd(organizationSchema)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={renderSafeJsonLd(faqSchema)}
      />
    </>
  )
}
