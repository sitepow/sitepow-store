import { PricingOption, PricingPlanProps, PricingTables } from '@/types/pricing'
import {
  IconBolt,
  IconBoxSeam,
  IconBrandNextjs,
  IconBuildingStore,
  IconChartBar,
  IconCircleCheck,
  IconCpu,
  IconCreditCard,
  IconDatabaseExport,
  IconDeviceDesktopAnalytics,
  IconHeadset,
  IconInfinity,
  IconLayersIntersect,
  IconPalette,
  IconPrinter,
  IconShieldCheck,
  IconSparkles,
  IconTicket,
  IconTrophy,
  IconTruckDelivery,
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
        text: 'สิทธิ์ใช้งานเช็คสลิปอัตโนมัติ ราคา 4.00 เครดิต/สลิป',
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
        text: 'ระบบปลอดภัยมาตรฐานธนาคาร, Cloud-Native, และสำรองข้อมูลอัตโนมัติ',
        icon: <IconShieldCheck size={18} stroke={1.5} />,
      },
      {
        text: 'รองรับสินค้าครบวงจร สินค้าทั่วไป, คีย์ดิจิทัล, ลิงก์ดาวน์โหลด และงานบริการ',
        icon: <IconBoxSeam size={18} stroke={1.5} />,
      },
      {
        text: 'ระบบ POS ครบวงจร ขายหน้าร้าน, ตัดสต็อก Real-time, ตรวจสลิป, และออกใบเสร็จ',
        icon: <IconDeviceDesktopAnalytics size={18} stroke={1.5} />,
      },
      {
        text: 'ระบบขนส่งครบวงจร คำนวณค่าส่งอัจฉริยะ, พิมพ์ใบปะหน้า, และอัปเดต Tracking อัตโนมัติ',
        icon: <IconTruckDelivery size={18} stroke={1.5} />,
      },
      {
        text: 'โครงสร้างพื้นฐานระดับ Enterprise รวดเร็ว, เสถียร, ปลอดภัย และเซิร์ฟเวอร์ในไทย',
        icon: <IconCpu size={18} stroke={1.5} />,
      },
      {
        text: 'เครื่องมือสร้างโปรโมชั่น/คูปองเร่งยอดขาย',
        icon: <IconTicket size={18} stroke={1.5} />,
      },
      {
        text: 'ระบบคำนวณค่าส่งอัจฉริยะ (Rate Matrix) ตั้งราคาสมดุลไม่ขาดทุน ลดปัญหาลูกค้าบ่นค่าส่งแพง',
        icon: <IconTruckDelivery size={18} stroke={1.5} />,
      },
      {
        text: 'ปรับแต่งหน้าร้านได้อย่างอิสระ เลือกธีมสี, ใส่สื่อมัลติมีเดีย, และออกแบบ Header ให้เข้ากับแบรนด์',
        icon: <IconPalette size={18} stroke={1.5} />,
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
        text: 'สิทธิ์ใช้งานเช็คสลิปอัตโนมัติ ราคา 2.67 เครดิต/สลิป',
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
        text: 'ระบบปลอดภัยมาตรฐานธนาคาร, Cloud-Native, และสำรองข้อมูลอัตโนมัติ',
        icon: <IconShieldCheck size={18} stroke={1.5} />,
      },
      {
        text: 'รองรับสินค้าครบวงจร สินค้าทั่วไป, คีย์ดิจิทัล, ลิงก์ดาวน์โหลด และงานบริการ',
        icon: <IconBoxSeam size={18} stroke={1.5} />,
      },
      {
        text: 'ระบบ POS ครบวงจร ขายหน้าร้าน, ตัดสต็อก Real-time, ตรวจสลิป, และออกใบเสร็จ',
        icon: <IconDeviceDesktopAnalytics size={18} stroke={1.5} />,
      },
      {
        text: 'ระบบขนส่งครบวงจร คำนวณค่าส่งอัจฉริยะ, พิมพ์ใบปะหน้า, และอัปเดต Tracking อัตโนมัติ',
        icon: <IconTruckDelivery size={18} stroke={1.5} />,
      },
      {
        text: 'โครงสร้างพื้นฐานระดับ Enterprise รวดเร็ว, เสถียร, ปลอดภัย และเซิร์ฟเวอร์ในไทย',
        icon: <IconCpu size={18} stroke={1.5} />,
      },
      {
        text: 'เครื่องมือสร้างโปรโมชั่น/คูปองเร่งยอดขาย',
        icon: <IconTicket size={18} stroke={1.5} />,
      },
      {
        text: 'ระบบคำนวณค่าส่งอัจฉริยะ (Rate Matrix) ตั้งราคาสมดุลไม่ขาดทุน ลดปัญหาลูกค้าบ่นค่าส่งแพง',
        icon: <IconTruckDelivery size={18} stroke={1.5} />,
      },
      {
        text: 'ปรับแต่งหน้าร้านได้อย่างอิสระ เลือกธีมสี, ใส่สื่อมัลติมีเดีย, และออกแบบ Header ให้เข้ากับแบรนด์',
        icon: <IconPalette size={18} stroke={1.5} />,
      },
      {
        text: 'สิทธิ์ลบ Footer ลายน้ำ Sitepow Store เพื่อสร้างแบรนด์ของคุณเองได้อย่างเต็มที่',
        icon: <IconBrandNextjs size={18} stroke={1.5} />,
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
        text: 'สิทธิ์ใช้งานเช็คสลิปอัตโนมัติ ราคา 1.60 เครดิต/สลิป',
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
        text: 'ระบบปลอดภัยมาตรฐานธนาคาร, Cloud-Native, และสำรองข้อมูลอัตโนมัติ',
        icon: <IconShieldCheck size={18} stroke={1.5} />,
      },
      {
        text: 'รองรับสินค้าครบวงจร สินค้าทั่วไป, คีย์ดิจิทัล, ลิงก์ดาวน์โหลด และงานบริการ',
        icon: <IconBoxSeam size={18} stroke={1.5} />,
      },
      {
        text: 'ระบบ POS ครบวงจร ขายหน้าร้าน, ตัดสต็อก Real-time, ตรวจสลิป, และออกใบเสร็จ',
        icon: <IconDeviceDesktopAnalytics size={18} stroke={1.5} />,
      },
      {
        text: 'ระบบขนส่งครบวงจร คำนวณค่าส่งอัจฉริยะ, พิมพ์ใบปะหน้า, และอัปเดต Tracking อัตโนมัติ',
        icon: <IconTruckDelivery size={18} stroke={1.5} />,
      },
      {
        text: 'โครงสร้างพื้นฐานระดับ Enterprise รวดเร็ว, เสถียร, ปลอดภัย และเซิร์ฟเวอร์ในไทย',
        icon: <IconCpu size={18} stroke={1.5} />,
      },
      {
        text: 'เครื่องมือสร้างโปรโมชั่น/คูปองเร่งยอดขาย',
        icon: <IconTicket size={18} stroke={1.5} />,
      },
      {
        text: 'ระบบคำนวณค่าส่งอัจฉริยะ (Rate Matrix) ตั้งราคาสมดุลไม่ขาดทุน ลดปัญหาลูกค้าบ่นค่าส่งแพง',
        icon: <IconTruckDelivery size={18} stroke={1.5} />,
      },
      {
        text: 'ปรับแต่งหน้าร้านได้อย่างอิสระ เลือกธีมสี, ใส่สื่อมัลติมีเดีย, และออกแบบ Header ให้เข้ากับแบรนด์',
        icon: <IconPalette size={18} stroke={1.5} />,
      },
      {
        text: 'สิทธิ์ลบ Footer ลายน้ำ Sitepow Store เพื่อสร้างแบรนด์ของคุณเองได้อย่างเต็มที่',
        icon: <IconBrandNextjs size={18} stroke={1.5} />,
      },
    ],
    buttonText: 'ทดลองใช้ Pro',
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
        text: 'สิทธิ์ใช้งานเช็คสลิปอัตโนมัติ ราคา 1.07 เครดิต/สลิป',
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
        text: 'ระบบปลอดภัยมาตรฐานธนาคาร, Cloud-Native, และสำรองข้อมูลอัตโนมัติ',
        icon: <IconShieldCheck size={18} stroke={1.5} />,
      },
      {
        text: 'รองรับสินค้าครบวงจร สินค้าทั่วไป, คีย์ดิจิทัล, ลิงก์ดาวน์โหลด และงานบริการ',
        icon: <IconBoxSeam size={18} stroke={1.5} />,
      },
      {
        text: 'ระบบ POS ครบวงจร ขายหน้าร้าน, ตัดสต็อก Real-time, ตรวจสลิป, และออกใบเสร็จ',
        icon: <IconDeviceDesktopAnalytics size={18} stroke={1.5} />,
      },
      {
        text: 'ระบบขนส่งครบวงจร คำนวณค่าส่งอัจฉริยะ, พิมพ์ใบปะหน้า, และอัปเดต Tracking อัตโนมัติ',
        icon: <IconTruckDelivery size={18} stroke={1.5} />,
      },
      {
        text: 'โครงสร้างพื้นฐานระดับ Enterprise รวดเร็ว, เสถียร, ปลอดภัย และเซิร์ฟเวอร์ในไทย',
        icon: <IconCpu size={18} stroke={1.5} />,
      },
      {
        text: 'เครื่องมือสร้างโปรโมชั่น/คูปองเร่งยอดขาย',
        icon: <IconTicket size={18} stroke={1.5} />,
      },
      {
        text: 'ระบบคำนวณค่าส่งอัจฉริยะ (Rate Matrix) ตั้งราคาสมดุลไม่ขาดทุน ลดปัญหาลูกค้าบ่นค่าส่งแพง',
        icon: <IconTruckDelivery size={18} stroke={1.5} />,
      },
      {
        text: 'ปรับแต่งหน้าร้านได้อย่างอิสระ เลือกธีมสี, ใส่สื่อมัลติมีเดีย, และออกแบบ Header ให้เข้ากับแบรนด์',
        icon: <IconPalette size={18} stroke={1.5} />,
      },
      {
        text: 'สิทธิ์ลบ Footer ลายน้ำ Sitepow Store เพื่อสร้างแบรนด์ของคุณเองได้อย่างเต็มที่',
        icon: <IconBrandNextjs size={18} stroke={1.5} />,
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
      name: 'ข้อจำกัดการใช้งาน',
      features: [
        {
          label: 'จำนวนสินค้าที่ลงได้ไม่จำกัด',
          access: [false, false, true, true],
        },
      ],
    },
    {
      name: 'ฟีเจอร์ AI อัจฉริยะ (ราคาสิทธิการใช้งานเครดิต)',
      features: [
        {
          label: 'AI ช่วยตอบแชทและเขียนรายละเอียดสินค้า',
          access: [true, true, true, true],
        },
      ],
    },
    {
      name: 'ระบบรับชำระเงินและสลิป',
      features: [
        {
          label: 'เชื่อมต่อ Stripe (บัตร/PromptPay)',
          access: [true, true, true, true],
        },
        {
          label: 'ระบบตรวจสอบสลิปอัตโนมัติ',
          access: [true, true, true, true],
        },
        {
          label: '0% ค่าคอมมิชชั่นทุกออเดอร์',
          access: [true, true, true, true],
        },
      ],
    },
    {
      name: 'การจัดการร้านค้าและสต็อก',
      features: [
        {
          label: 'ระบบจัดการสต็อกและ POS หน้าร้าน',
          access: [true, true, true, true],
        },
        {
          label: 'ระบบวิเคราะห์กำไร-ขาดทุนรายวัน',
          access: [true, true, true, true],
        },
        {
          label: 'ส่งออกข้อมูลสินค้า (CSV/JSON)',
          access: [true, true, true, true],
        },
      ],
    },
    {
      name: 'การตลาดและขนส่ง',
      features: [
        {
          label: 'ระบบสมาชิก & สะสมแต้ม (CRM)',
          access: [true, true, true, true],
        },
        {
          label: 'ระบบจัดการขนส่งและพิมพ์ใบปะหน้า',
          access: [true, true, true, true],
        },
        {
          label: 'ระบบคำนวณค่าส่งอัจฉริยะ (Rate Matrix)',
          access: [true, true, true, true],
        },
        {
          label: 'เครื่องมือสร้างโปรโมชั่น/คูปอง',
          access: [true, true, true, true],
        },
      ],
    },
    {
      name: 'การปรับแต่งและความเป็นมืออาชีพ',
      features: [
        {
          label: 'ปรับแต่งดีไซน์หน้าร้านและ Header',
          access: [true, true, true, true],
        },
        {
          label: 'เชื่อมโดเมนส่วนตัว (.com, .net, ...)',
          access: [false, true, true, true],
        },
        {
          label: 'ลบ Footer ลายน้ำ Sitepow Store',
          access: [false, true, true, true],
        },
        {
          label: 'Support พิเศษดูแลส่วนตัว 24 ชม.',
          access: [false, false, false, true],
        },
      ],
    },
  ],
}

export const PROFIT_COMPARISON = {
  columns: [
    'จุดเปรียบเทียบ',
    'ขายใน Marketplace',
    'SaaS ร้านค้าเจ้าอื่น',
    'Sitepow Store',
  ],
  categories: [
    {
      name: 'ต้นทุนและการเงิน',
      features: [
        {
          label: 'ค่าธรรมเนียม (GP/Transaction)',
          values: [
            '15% - 25% (หักทุกออเดอร์)',
            'อาจมีค่าธรรมเนียมแอบแฝง',
            '0% (ไม่หักเลยสักบาท)',
          ],
        },
        {
          label: 'โมเดลราคา',
          values: [
            'หัก % จากยอดขาย',
            'จ่ายรายเดือน/รายปีคงที่',
            'ไม่มีขาย ไม่ต้องจ่าย (แฟร์ที่สุด)',
          ],
        },
      ],
    },
    {
      name: 'ประสิทธิภาพของ AI และเทคโนโลยี',
      features: [
        {
          label: 'การจัดการสินค้าด้วย AI',
          values: [
            'นั่งพิมพ์เอง',
            'กรอกข้อมูลเอง',
            'AI Vision ถ่ายรูปปุ๊บ เจนรายละเอียดให้ปั๊บ',
          ],
        },
        {
          label: 'การค้นหาสินค้า (Visual Search)',
          values: ['ไม่มี', 'ไม่มี', 'มี (ถ่ายรูปปุ๊บ หาของในคลังเจอทันที)'],
        },
        {
          label: 'โครงสร้างพื้นฐาน',
          values: [
            'ทั่วไป',
            'Shared Hosting',
            'Enterprise (Cloud-Native + Redis Caching)',
          ],
        },
      ],
    },
    {
      name: 'ระบบจัดการร้านค้าและหน้าร้าน',
      features: [
        {
          label: 'ระบบจัดการหน้าร้าน (POS)',
          values: ['ไม่มี', 'มีพื้นฐาน', 'ครบวงจร (POS + ตัดสต็อก Real-time)'],
        },
        {
          label: 'การปรับแต่งหน้าร้าน',
          values: ['ตามแบบ Platform', 'จำกัด', 'อิสระ 100% (สี, สื่อ, Header)'],
        },
        {
          label: 'ความปลอดภัย',
          values: [
            'ตามมาตรฐานแพลตฟอร์ม',
            'มาตรฐานทั่วไป',
            'ระดับธนาคาร + สำรองข้อมูลอัตโนมัติ',
          ],
        },
      ],
    },
    {
      name: 'การตลาดและการขนส่งอัจฉริยะ',
      features: [
        {
          label: 'ระบบจัดการค่าส่ง',
          values: [
            'เรทแพลตฟอร์ม',
            'เรทบริษัทฯ ตายตัว',
            'Rate Matrix (ตั้งราคาอิสระไม่ขาดทุน)',
          ],
        },
        {
          label: 'ระบบ CRM และโปรโมชั่น',
          values: ['จำกัด', 'มีบ้าง', 'ระบบสมาชิก + คูปองเร่งยอด (ครบวงจร)'],
        },
        {
          label: 'การจัดการออเดอร์',
          values: [
            'ในระบบ',
            'จัดการทั่วไป',
            'รวมศูนย์ทุกช่องทาง + พิมพ์ใบปะหน้ามาตรฐาน',
          ],
        },
      ],
    },
    {
      name: 'Case Study: ร้านค้ามือโปร (ยอดขาย 500,000.-/เดือน)',
      features: [
        {
          label: 'เงินที่โดนหักไปฟรีๆ ต่อปี',
          values: [
            '~1,200,000 บาท',
            'ค่าระบบรายปี + GP บางส่วน',
            '0 บาท (จ่ายแค่ค่าระบบ)',
          ],
        },
        {
          label: 'กำไรสุทธิที่เหลือจริง',
          values: ['น้อย', 'ปานกลาง', 'สูงที่สุด (รับเต็ม 5 แสน/เดือน)'],
        },
      ],
    },
  ],
}
