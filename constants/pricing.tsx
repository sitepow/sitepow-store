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
  IconPrinter,
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
  { value: PRICING_VALUE.ONE_MONTH, label: '1 เดือน', discountPercent: 0 },
  { value: PRICING_VALUE.THREE_MONTHS, label: '3 เดือน', discountPercent: 10 },
  { value: PRICING_VALUE.SIX_MONTHS, label: '6 เดือน', discountPercent: 15 },
  {
    value: PRICING_VALUE.TWELVE_MONTHS,
    label: '12 เดือน',
    discountPercent: 25,
  },
]

export const PRICING_PLANS: PricingPlanProps[] = [
  {
    title: 'Free',
    description: 'เปิดร้านออนไลน์วันนี้ ฟรีตลอดชีพ ไม่ต้องใส่บัตร ไม่มีหมดอายุ',
    price: '0',
    currency: 'THB',
    seed: 'newcomer',
    features: [
      {
        text: 'ลงสินค้าได้สูงสุด 5 ชิ้น',
        icon: <IconLayersIntersect size={18} stroke={1.5} />,
      },
      {
        text: 'สิทธิ์ใช้งาน AI อัจฉริยะ แชทตอบลูกค้า, ช่วยค้นหาสินค้า, และร่างรายละเอียดสินค้า (ใช้ราคา 1.35 บาท/เครดิต)',
        icon: <IconSparkles size={18} stroke={1.5} />,
      },
      {
        text: 'สิทธิ์ใช้งานเช็คสลิปอัตโนมัติ ราคา 4.00 เครดิต/ครั้ง',
        icon: <IconCircleCheck size={18} stroke={1.5} />,
      },
      {
        text: 'หน้าร้านออนไลน์ส่วนตัว (ปรับแต่งได้ตามสไตล์ร้านค้าตัวเอง)',
        icon: <IconBuildingStore size={18} stroke={1.5} />,
      },
      {
        text: 'ใช้งานฟรีเชื่อมต่อ Stripe (ตัดบัตรเครดิต/PromptPay) (มีค่าธรรมเนียมจากผู้ให้บริการ)',
        icon: <IconCreditCard size={18} stroke={1.5} />,
      },
      {
        text: 'รองรับการรับเงินโอน (ตรวจสอบสลิปด้วยตัวเอง)',
        icon: <IconCreditCard size={18} stroke={1.5} />,
      },
      {
        text: '0% ค่าคอมมิชชั่นทุกออเดอร์',
        icon: <IconBolt size={18} stroke={1.5} />,
      },
      {
        text: 'ระบบวิเคราะห์กำไร-ขาดทุนรายวัน',
        icon: <IconChartBar size={18} stroke={1.5} />,
      },
      {
        text: 'ระบบจัดการขนส่งและพิมพ์ใบปะหน้ามาตรฐาน',
        icon: <IconPrinter size={18} stroke={1.5} />,
      },
      {
        text: 'ส่งออกข้อมูลสินค้าไป Lazada/Shopee (CSV/JSON)',
        icon: <IconDatabaseExport size={18} stroke={1.5} />,
      },
      {
        text: 'ระบบสมาชิก & สะสมแต้ม (CRM)',
        icon: <IconTrophy size={18} stroke={1.5} />,
      },
    ],
    buttonText: 'เริ่มฟรีเลย ไม่ต้องใส่บัตร',
  },
  {
    title: 'Starter',
    description: 'เริ่มต้นขายออนไลน์แบบมืออาชีพ กำไรเต็ม 100% ไม่โดนหัก GP',
    price: '490',
    currency: 'THB',
    seed: 'tester',
    features: [
      {
        text: 'ลงสินค้าได้สูงสุด 50 ชิ้น',
        icon: <IconLayersIntersect size={18} stroke={1.5} />,
      },
      {
        text: 'เชื่อมโดเมนที่ต้องการได้ (.com, .net, .co, และอื่นๆ)',
        icon: <IconWorld size={18} stroke={1.5} />,
      },
      {
        text: 'สิทธิ์ใช้งาน AI อัจฉริยะ แชทตอบลูกค้า, ช่วยค้นหาสินค้า, และร่างรายละเอียดสินค้า (ใช้ราคา 1.15 บาท/เครดิต)',
        icon: <IconSparkles size={18} stroke={1.5} />,
      },
      {
        text: 'สิทธิ์ใช้งานเช็คสลิปอัตโนมัติ ราคา 2.67 เครดิต/ครั้ง',
        icon: <IconCircleCheck size={18} stroke={1.5} />,
      },
      {
        text: 'หน้าร้านออนไลน์ส่วนตัว (ปรับแต่งได้ตามสไตล์ร้านค้าตัวเอง)',
        icon: <IconBuildingStore size={18} stroke={1.5} />,
      },
      {
        text: 'ใช้งานฟรีเชื่อมต่อ Stripe (ตัดบัตรเครดิต/PromptPay) (มีค่าธรรมเนียมจากผู้ให้บริการ)',
        icon: <IconCreditCard size={18} stroke={1.5} />,
      },
      {
        text: 'รองรับการรับเงินโอน (ตรวจสอบสลิปด้วยตัวเอง)',
        icon: <IconCreditCard size={18} stroke={1.5} />,
      },
      {
        text: '0% ค่าคอมมิชชั่นทุกออเดอร์',
        icon: <IconBolt size={18} stroke={1.5} />,
      },
      {
        text: 'ระบบวิเคราะห์กำไร-ขาดทุนรายวัน',
        icon: <IconChartBar size={18} stroke={1.5} />,
      },
      {
        text: 'ระบบจัดการขนส่งและพิมพ์ใบปะหน้ามาตรฐาน',
        icon: <IconPrinter size={18} stroke={1.5} />,
      },
      {
        text: 'ส่งออกข้อมูลสินค้าไป Lazada/Shopee (CSV/JSON)',
        icon: <IconDatabaseExport size={18} stroke={1.5} />,
      },
      {
        text: 'ระบบสมาชิก & สะสมแต้ม (CRM)',
        icon: <IconTrophy size={18} stroke={1.5} />,
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
        text: 'ลงสินค้าได้ไม่จำกัดจำนวน',
        icon: <IconInfinity size={18} stroke={1.5} />,
      },
      {
        text: 'เชื่อมโดเมนที่ต้องการได้ (.com, .net, .co, และอื่นๆ)',
        icon: <IconWorld size={18} stroke={1.5} />,
      },
      {
        text: 'สิทธิ์ใช้งาน AI อัจฉริยะ แชทตอบลูกค้า, ช่วยค้นหาสินค้า, และร่างรายละเอียดสินค้า (ใช้ราคา 1.00 บาท/เครดิต)',
        icon: <IconSparkles size={18} stroke={1.5} />,
      },
      {
        text: 'สิทธิ์ใช้งานเช็คสลิปอัตโนมัติ ราคา 1.60 เครดิต/ครั้ง',
        icon: <IconCircleCheck size={18} stroke={1.5} />,
      },
      {
        text: 'หน้าร้านออนไลน์ส่วนตัว (ปรับแต่งได้ตามสไตล์ร้านค้าตัวเอง)',
        icon: <IconBuildingStore size={18} stroke={1.5} />,
      },
      {
        text: 'ใช้งานฟรีเชื่อมต่อ Stripe (ตัดบัตรเครดิต/PromptPay) (มีค่าธรรมเนียมจากผู้ให้บริการ)',
        icon: <IconCreditCard size={18} stroke={1.5} />,
      },
      {
        text: 'รองรับการรับเงินโอน (ตรวจสอบสลิปด้วยตัวเอง)',
        icon: <IconCreditCard size={18} stroke={1.5} />,
      },
      {
        text: '0% ค่าคอมมิชชั่นทุกออเดอร์',
        icon: <IconBolt size={18} stroke={1.5} />,
      },
      {
        text: 'ระบบวิเคราะห์กำไร-ขาดทุนรายวัน',
        icon: <IconChartBar size={18} stroke={1.5} />,
      },
      {
        text: 'ระบบจัดการขนส่งและพิมพ์ใบปะหน้ามาตรฐาน',
        icon: <IconPrinter size={18} stroke={1.5} />,
      },
      {
        text: 'ส่งออกข้อมูลสินค้าไป Lazada/Shopee (CSV/JSON)',
        icon: <IconDatabaseExport size={18} stroke={1.5} />,
      },
      {
        text: 'ระบบสมาชิก & สะสมแต้ม (CRM)',
        icon: <IconTrophy size={18} stroke={1.5} />,
      },
    ],
    buttonText: 'ทดลองใช้ Pro ฟรี 14 วัน',
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
        text: 'ลงสินค้าได้ไม่จำกัดจำนวน',
        icon: <IconInfinity size={18} stroke={1.5} />,
      },
      {
        text: 'เชื่อมโดเมนที่ต้องการได้ (.com, .net, .co, และอื่นๆ)',
        icon: <IconWorld size={18} stroke={1.5} />,
      },
      {
        text: 'สิทธิ์ใช้งาน AI อัจฉริยะ แชทตอบลูกค้า, ช่วยค้นหาสินค้า, และร่างรายละเอียดสินค้า (ใช้ราคา 0.85 บาท/เครดิต)',
        icon: <IconSparkles size={18} stroke={1.5} />,
      },
      {
        text: 'สิทธิ์ใช้งานเช็คสลิปอัตโนมัติ ราคา 1.07 เครดิต/ครั้ง',
        icon: <IconCircleCheck size={18} stroke={1.5} />,
      },
      {
        text: 'หน้าร้านออนไลน์ส่วนตัว (ปรับแต่งได้ตามสไตล์ร้านค้าตัวเอง)',
        icon: <IconBuildingStore size={18} stroke={1.5} />,
      },
      {
        text: 'ใช้งานฟรีเชื่อมต่อ Stripe (ตัดบัตรเครดิต/PromptPay) (มีค่าธรรมเนียมจากผู้ให้บริการ)',
        icon: <IconCreditCard size={18} stroke={1.5} />,
      },
      {
        text: 'รองรับการรับเงินโอน (ตรวจสอบสลิปด้วยตัวเอง)',
        icon: <IconCreditCard size={18} stroke={1.5} />,
      },
      {
        text: '0% ค่าคอมมิชชั่นทุกออเดอร์',
        icon: <IconBolt size={18} stroke={1.5} />,
      },
      {
        text: 'ระบบวิเคราะห์กำไร-ขาดทุนรายวัน',
        icon: <IconChartBar size={18} stroke={1.5} />,
      },
      {
        text: 'ระบบจัดการขนส่งและพิมพ์ใบปะหน้ามาตรฐาน',
        icon: <IconPrinter size={18} stroke={1.5} />,
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
        text: 'Support พิเศษดูแลส่วนตัวตลอด 24 ชม.',
        icon: <IconHeadset size={18} stroke={1.5} />,
      },
    ],
    buttonText: 'จัดเต็มกับ Ultimate',
  },
]

export const PRICING_TABLES: PricingTables = {
  tiers: ['Free', 'Starter', 'Pro', 'Ultimate'],
  categories: [
    {
      name: 'ฟีเจอร์ AI อัจฉริยะ',
      features: [
        {
          label: 'AI ช่วยตั้งชื่อสินค้าจากรูปภาพ',
          access: [true, true, true, true],
        },
        {
          label: 'AI ช่วยเขียน Sales Copy ภาษาไทย',
          access: [true, true, true, true],
        },
        {
          label: 'AI Visual Search (ค้นหาสินค้าด้วยรูป)',
          access: [true, true, true, true],
        },
      ],
    },
    {
      name: 'การชำระเงินและค่าธรรมเนียม',
      features: [
        {
          label: 'รับเงินเข้าบัญชีร้านโดยตรง (0% GP)',
          access: [true, true, true, true],
        },
        {
          label: 'ระบบเช็คสลิปอัตโนมัติ',
          access: [true, true, true, true],
        },
        {
          label: 'เชื่อมต่อ Stripe (บัตร/PromptPay)',
          access: [true, true, true, true],
        },
      ],
    },
    {
      name: 'การจัดการร้านค้าและสต็อก',
      features: [
        {
          label: 'ลงสินค้าได้ตามจำนวนที่กำหนด',
          access: [true, true, true, true],
        },
        { label: 'ระบบจัดการสต็อกสินค้า', access: [true, true, true, true] },
        {
          label: 'รายงานวิเคราะห์ยอดขายและกำไร',
          access: [true, true, true, true],
        },
        {
          label: 'นำเข้า-ส่งออกข้อมูล (CSV/JSON)',
          access: [true, true, true, true],
        },
      ],
    },
    {
      name: 'การตลาดและขนส่ง',
      features: [
        {
          label: 'ระบบสมาชิกและสะสมแต้ม (CRM)',
          access: [true, true, true, true],
        },
        {
          label: 'พิมพ์ใบปะหน้าและจัดการสถานะออเดอร์',
          access: [true, true, true, true],
        },
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
          label: 'เมื่อพนักงานหาของไม่เจอ',
          values: [
            'ต้องโทรหาเจ้าของ/ซ้อ (เสียเวลาลูกค้า)',
            'AI Visual Search ถ่ายรูปแล้วหาเจอทันที',
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
