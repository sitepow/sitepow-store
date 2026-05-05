import { PricingOption, PricingPlanProps, PricingTables } from '@/types/pricing'
import {
  IconBolt,
  IconBuildingStore,
  IconChartBar,
  IconCircleCheck,
  IconCreditCard,
  IconDatabaseExport,
  IconHeadset,
  IconInfinity,
  IconLayersIntersect,
  IconSparkles,
  IconTrophy,
  IconWorld,
} from '@tabler/icons-react'

export const PRICING_VALUE = {
  ONE_MONTH: '1month',
  THREE_MONTHS: '3months',
  SIX_MONTHS: '6months',
  TWELVE_MONTHS: '12months',
} as const

export const PRICING_OPTIONS: PricingOption[] = [
  { value: PRICING_VALUE.ONE_MONTH, label: '1 เดือน' },
  { value: PRICING_VALUE.THREE_MONTHS, label: '3 เดือน', discount: '10% OFF' },
  { value: PRICING_VALUE.SIX_MONTHS, label: '6 เดือน', discount: '15% OFF' },
  {
    value: PRICING_VALUE.TWELVE_MONTHS,
    label: '12 เดือน',
    discount: '25% OFF',
  },
]

export const PRICING_PLANS: PricingPlanProps[] = [
  {
    title: 'Starter',
    description: 'เริ่มต้นขายออนไลน์แบบมืออาชีพ กำไรเต็ม 100% ไม่โดนหัก GP',
    price: '490',
    currency: 'THB',
    seed: 'starter',
    features: [
      {
        text: 'ลงสินค้าได้สูงสุด 50 ชิ้น',
        icon: <IconLayersIntersect size={18} stroke={1.5} />,
      },
      {
        text: 'ระบบหน้าร้านออนไลน์ส่วนตัว',
        icon: <IconBuildingStore size={18} stroke={1.5} />,
      },
      {
        text: 'รองรับการรับเงินโอน (Manual)',
        icon: <IconCreditCard size={18} stroke={1.5} />,
      },
      {
        text: '0% ค่าคอมมิชชั่นทุกออเดอร์',
        icon: <IconBolt size={18} stroke={1.5} />,
      },
    ],
    buttonText: 'เริ่มต้นสร้างกำไร',
  },
  {
    title: 'Pro',
    description:
      'ปลดล็อกพลัง AI และระบบเช็คสลิปอัตโนมัติ เพื่อการขายที่รวดเร็วกว่า',
    price: '990',
    currency: 'THB',
    isPopular: true,
    seed: 'expert',
    features: [
      {
        text: 'AI Vision ช่วยลงของ (100 ครั้ง/เดือน)',
        icon: <IconSparkles size={18} stroke={1.5} />,
      },
      {
        text: 'เช็คสลิปอัตโนมัติด้วย Easy Slip',
        icon: <IconCircleCheck size={18} stroke={1.5} />,
      },
      {
        text: 'เชื่อมต่อ GB Prime Pay (บัตร/PromptPay)',
        icon: <IconCreditCard size={18} stroke={1.5} />,
      },
      {
        text: 'ลงสินค้าได้ไม่จำกัดจำนวน',
        icon: <IconInfinity size={18} stroke={1.5} />,
      },
      {
        text: 'ระบบวิเคราะห์กำไร-ขาดทุนรายวัน',
        icon: <IconChartBar size={18} stroke={1.5} />,
      },
    ],
    buttonText: 'อัปเกรดเป็น Pro เลย',
  },
  {
    title: 'Ultimate',
    description:
      'เชื่อมต่อทุก Marketplace และระบบสมาชิกขั้นสูงเพื่อการขายที่ยั่งยืน',
    price: '1,990',
    currency: 'THB',
    seed: 'legend',
    features: [
      {
        text: 'AI Vision ช่วยลงของ (500 ครั้ง/เดือน)',
        icon: <IconSparkles size={18} stroke={1.5} />,
      },
      {
        text: 'ส่งออกข้อมูลสินค้าไป Lazada/Shopee (CSV/JSON)',
        icon: <IconDatabaseExport size={18} stroke={1.5} />,
      },
      {
        text: 'ระบบสมาชิก & สะสมแต้ม (CRM)',
        icon: <IconTrophy size={18} stroke={1.5} />,
      },
      {
        text: 'จัดการขนส่งและพิมพ์ใบปะหน้าอัตโนมัติ',
        icon: <IconWorld size={18} stroke={1.5} />,
      },
      {
        text: 'Support พิเศษดูแลส่วนตัวตลอด 24 ชม.',
        icon: <IconHeadset size={18} stroke={1.5} />,
      },
    ],
    buttonText: 'จัดเต็มกับ Ultimate',
  },
]

export const PRICING_TABLES: PricingTables = {
  tiers: ['Starter', 'Pro', 'Ultimate'],
  categories: [
    {
      name: 'ฟีเจอร์ AI อัจฉริยะ',
      features: [
        {
          label: 'AI ช่วยตั้งชื่อสินค้าจากรูปภาพ',
          access: [false, true, true],
        },
        {
          label: 'AI ช่วยเขียน Sales Copy ภาษาไทย',
          access: [false, true, true],
        },
      ],
    },
    {
      name: 'การชำระเงินและค่าธรรมเนียม',
      features: [
        {
          label: 'รับเงินเข้าบัญชีร้านโดยตรง (0% GP)',
          access: [true, true, true],
        },
        {
          label: 'ระบบเช็คสลิปอัตโนมัติ (Easy Slip)',
          access: [false, true, true],
        },
        { label: 'เชื่อมต่อ GB Prime Pay', access: [false, true, true] },
      ],
    },
    {
      name: 'การจัดการร้านค้า',
      features: [
        { label: 'ลงสินค้าไม่จำกัดจำนวน', access: [false, true, true] },
        { label: 'ระบบจัดการสต็อกสินค้า', access: [true, true, true] },
        { label: 'รายงานวิเคราะห์ยอดขายและกำไร', access: [false, true, true] },
        {
          label: 'นำเข้าสินค้าจาก Lazada/Shopee (CSV/JSON)',
          access: [true, true, true],
        },
        {
          label: 'ส่งออกข้อมูลสินค้าไป Lazada/Shopee (CSV/JSON)',
          access: [false, false, true],
        },
      ],
    },
    {
      name: 'การตลาดและลูกค้าสัมพันธ์',
      features: [
        { label: 'ระบบคูปองส่วนลด', access: [true, true, true] },
        { label: 'ระบบสมาชิกและสะสมแต้ม', access: [false, false, true] },
      ],
    },
  ],
}

export const PROFIT_COMPARISON = {
  columns: [
    'เลือกช่องการการขาย',
    'ขายใน Marketplace (ส้ม/ฟ้า)',
    'ขายที่ Sitepow Store',
  ],
  categories: [
    {
      name: 'ต้นทุนและกำไร',
      features: [
        {
          label: 'ค่าธรรมเนียม (GP)',
          values: ['15% - 25% (หักทุกออเดอร์)', '0% (ไม่หักเลยสักบาท)'],
        },
        {
          label: 'รายได้สุทธิ',
          values: [
            'ยิ่งขายดี ยิ่งโดนหักเยอะ',
            'ยิ่งขายดี กำไรยิ่งเหลือเยอะขึ้น',
          ],
        },
      ],
    },
    {
      name: 'การจัดการร้านค้า',
      features: [
        {
          label: 'การลงสินค้า',
          values: [
            'นั่งพิมพ์เอง นึกชื่อเอง',
            'AI Vision ถ่ายรูปปุ๊บ เจนให้ปั๊บ',
          ],
        },
        {
          label: 'ฐานลูกค้า',
          values: [
            'โดนปิดกั้นการมองเห็น (ต้องจ่ายค่า Ads เพื่อดันให้ลูกค้าเห็น)',
            'เป็นเจ้าของฐานลูกค้าเอง 100%',
          ],
        },
      ],
    },
    {
      name: 'Case Study 1: ร้านค้าเริ่มต้น (ยอดขาย 100,000.-)',
      features: [
        {
          label: 'เงินที่โดนหักไปฟรีๆ',
          values: ['~20,000 บาท / เดือน', '0 บาท'],
        },
        {
          label: 'กำไรที่เหลือจริง',
          values: ['80,000 บาท', '99,010 บาท'],
        },
      ],
    },
    {
      name: 'Case Study 2: ร้านค้ามือโปร (ยอดขาย 500,000.-)',
      features: [
        {
          label: 'เงินที่โดนหักไปฟรีๆ',
          values: ['~100,000 บาท / เดือน', '0 บาท'],
        },
        {
          label: 'สิ่งที่คุณเสียไปใน 1 ปี',
          values: [
            'เงิน 1,200,000 บาท (ซื้อรถได้ 1 คัน)',
            'จ่ายแค่ค่าระบบรายปี ไม่ถึง 1.2 หมื่น',
          ],
        },
        {
          label: 'กำไรสุทธิที่ได้เพิ่มขึ้น',
          values: ['หายไป 1 แสนทุกเดือน', 'รับเต็มๆ 5 แสนทุกเดือน'],
        },
      ],
    },
  ],
}
