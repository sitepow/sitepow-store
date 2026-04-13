import { PricingOption, PricingPlanProps } from '@/types/pricing'
import {
  InfinityIcon,
  BarChart3Icon,
  CreditCardIcon,
  GlobeIcon,
  HeadphonesIcon,
  LayersIcon,
  LayoutDashboardIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  StoreIcon,
  TrophyIcon,
  Users2Icon,
  ZapIcon,
} from 'lucide-react'

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
    discount: '20% OFF',
  },
]

export const PRICING_PLANS: PricingPlanProps[] = [
  {
    title: 'Free',
    description: 'เริ่มต้นสร้างตัวตนและทดลองระบบการจัดการพื้นฐาน',
    price: '0.00',
    currency: 'THB',
    seed: 'tester',
    features: [
      {
        text: 'ลงสินค้าได้สูงสุด 15 ชิ้น',
        icon: <LayersIcon size={18} />,
      },
      {
        text: 'ระบบจัดการออเดอร์พื้นฐาน',
        icon: <LayoutDashboardIcon size={18} />,
      },
      {
        text: 'เชื่อมต่อ Social Login (SSO)',
        icon: <Users2Icon size={18} />,
      },
      {
        text: 'รองรับการชำระเงินโอนผ่านธนาคาร',
        icon: <CreditCardIcon size={18} />,
      },
    ],
    buttonText: 'เริ่มต้นใช้ฟรี',
  },
  {
    title: 'Pro',
    description: 'ปลดล็อกทุกขีดจำกัดเพื่อยอดขายแบบมืออาชีพ',
    price: '990.00',
    currency: 'THB / เดือน',
    isPopular: true,
    seed: 'expert',
    features: [
      {
        text: 'ลงสินค้าได้ไม่จำกัดจำนวน',
        icon: <InfinityIcon size={18} />,
      },
      {
        text: '0% คอมมิชชั่น ทุกช่องทาง',
        icon: <ZapIcon size={18} />,
      },
      {
        text: 'ระบบ Stock & คลังสินค้าเต็มรูปแบบ',
        icon: <StoreIcon size={18} />,
      },
      {
        text: 'เชื่อมต่อ Payment Gateway & ขนส่ง',
        icon: <GlobeIcon size={18} />,
      },
      {
        text: 'รายงานวิเคราะห์กำไร - ขาดทุน',
        icon: <BarChart3Icon size={18} />,
      },
    ],
    buttonText: 'อัปเกรดเป็น Pro เลย',
  },
  {
    title: 'Ultimate',
    description: 'ที่สุดของการตลาดขั้นสูงและการขายแบบ Omnichannel',
    price: '2,890.00',
    currency: 'THB / เดือน',
    seed: 'legend',
    features: [
      {
        text: 'เชื่อมต่อ E-Marketplace (Shopee, Lazada)',
        icon: <ShoppingBagIcon size={18} />,
      },
      {
        text: 'ระบบสมาชิก & Digital Member Card',
        icon: <TrophyIcon size={18} />,
      },
      {
        text: 'ระบบสะสมแต้มแลกของรางวัล',
        icon: <ShieldCheckIcon size={18} />,
      },
      {
        text: 'เพิ่มผู้ดูแลร้านได้สูงสุด 50 คน',
        icon: <Users2Icon size={18} />,
      },
      {
        text: 'Customer Support ลำดับพิเศษ',
        icon: <HeadphonesIcon size={18} />,
      },
    ],
    buttonText: 'จัดเต็มทุกฟีเจอร์กับ Ultimate',
  },
]

export const PRICING_TABLES = {
  tiers: ['Free', 'Pro', 'Ultimate'],
  categories: [
    {
      name: 'ช่องทางการขาย',
      features: [
        {
          label: 'Website (Traffic สูงสุด 3,000 pageviews/ชม.)',
          access: [true, true, true],
        },
        {
          label: 'Mobile Site / Facebook Shop / Instagram / Line Shopping',
          access: [true, true, true],
        },
        {
          label: 'ระบบ Cashier สร้างใบสั่งซื้อด้วยตนเอง',
          access: [false, true, true],
        },
        {
          label: 'CheckoutPage (จำนวนลิงก์พิเศษ)',
          access: ['-', '1', '5'],
        },
        {
          label: 'Affiliate ระบบติดตามออเดอร์จากผู้แนะนำ',
          access: [false, false, '5'],
        },
        {
          label: 'E-Marketplace (Lazada, Shopee, TikTok Shop)',
          access: [false, false, true],
        },
      ],
    },
    {
      name: 'การจัดการสินค้า',
      features: [
        {
          label: 'จำนวนสินค้าในร้าน',
          access: ['15', 'Unlimited', 'Unlimited'],
        },
        {
          label: 'จำนวนรูปต่อ 1 สินค้า',
          access: ['1', '10', '10'],
        },
        {
          label: 'ระบบ Stock & คลังสินค้าเต็มรูปแบบ',
          access: [false, true, true],
        },
        {
          label: 'ระบบจัดการตัวเลือกสินค้า (Add-on/Attribution)',
          access: [false, true, true],
        },
        {
          label: 'Import/Export ข้อมูลผ่าน Excel',
          access: [false, true, true],
        },
      ],
    },
    {
      name: 'การตั้งค่าและจัดการร้าน',
      features: [
        {
          label: 'จำนวนผู้ดูแลร้าน',
          access: ['1', '10', '50'],
        },
        {
          label: 'ตรวจสอบความเคลื่อนไหวของผู้ดูแลร้าน',
          access: [false, true, true],
        },
        {
          label: 'รองรับหลายภาษา (ไทย, อังกฤษ, จีน, ญี่ปุ่น, ลาว)',
          access: [true, true, true],
        },
        {
          label: 'ออกใบกำกับภาษีเต็มรูป / e-Tax',
          access: [true, true, true],
        },
        {
          label: 'จำกัดการเข้าถึงร้าน (Member Gate)',
          access: [false, false, true],
        },
      ],
    },
    {
      name: 'การตลาด และ CRM',
      features: [
        {
          label: 'ติดตั้ง Third party plugin (Pixel, GA, TikTok Tag)',
          access: [true, true, true],
        },
        {
          label: 'ระบบสมาชิก พร้อม Digital Member Card',
          access: [false, false, true],
        },
        {
          label: 'ระบบสะสมแต้มแลกของรางวัล',
          access: [false, false, true],
        },
        {
          label: 'รหัสส่วนลด / Super Discount',
          access: [true, true, true],
        },
        {
          label: 'Flash Sale / Dynamic Pricing',
          access: [false, true, true],
        },
      ],
    },
    {
      name: 'การจัดส่งและชำระเงิน',
      features: [
        {
          label: 'โอนเงินธนาคาร / เก็บเงินปลายทาง (COD)',
          access: [true, true, true],
        },
        {
          label: 'เชื่อมต่อ Payment Gateway & ขนส่งชั้นนำ',
          access: [false, true, true],
        },
        {
          label: 'คำนวณค่าส่งอัตโนมัติตามน้ำหนัก',
          access: [false, true, true],
        },
        {
          label: 'พิมพ์ใบปะหน้าผ่าน Thermal Printer',
          access: [false, true, true],
        },
      ],
    },
  ],
}
