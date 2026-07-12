import { Plan } from '@/generated/prisma/enums'

export interface PlanDetails {
  name: string
  price: number
  description: string
  features: string[]
  isAiSupported: boolean
  aiUsageMultiplier: number
}

export const PLAN_DETAILS: Record<Plan, PlanDetails> = {
  FREE: {
    name: 'Free',
    price: 0,
    description: 'เปิดร้านออนไลน์วันนี้ ฟรีตลอดชีพ ไม่ต้องใส่บัตร ไม่มีหมดอายุ',
    features: [
      'ลงสินค้าได้สูงสุด 5 ชิ้น',
      'สิทธิ์ใช้งาน AI อัจฉริยะ แชทตอบลูกค้า, ช่วยค้นหาสินค้า, และร่างรายละเอียดสินค้า (ในราคา 1.35 บาท/เครดิต)',
      'หน้าร้านออนไลน์ส่วนตัว',
      'รับเงินโอนแบบ Manual',
      '0% ค่าคอมมิชชั่นทุกออเดอร์',
    ],
    isAiSupported: true,
    aiUsageMultiplier: 1.8,
  },
  STARTER: {
    name: 'Starter',
    price: 490,
    description: 'เริ่มต้นขายออนไลน์แบบมืออาชีพ กำไรเต็ม 100% ไม่โดนหัก GP',
    features: [
      'ลงสินค้าได้สูงสุด 50 ชิ้น',
      'สิทธิ์ใช้งาน AI อัจฉริยะ แชทตอบลูกค้า, ช่วยค้นหาสินค้า, และร่างรายละเอียดสินค้า (ในราคา 1.15 บาท/เครดิต)',
      'ระบบหน้าร้านออนไลน์ส่วนตัว',
      'รองรับการรับเงินโอน (เช็คสลิปเอง)',
      'ระบบจัดการขนส่งและพิมพ์ใบปะหน้ามาตรฐาน',
      '0% ค่าคอมมิชชั่นทุกออเดอร์',
    ],
    isAiSupported: true,
    aiUsageMultiplier: 1.5,
  },
  PRO: {
    name: 'Pro',
    price: 990,
    description:
      'ปลดล็อกพลัง AI และระบบเช็คสลิปอัตโนมัติ เพื่อการขายที่รวดเร็วกว่า',
    features: [
      'สิทธิ์ใช้งาน AI อัจฉริยะ แชทตอบลูกค้า, ช่วยค้นหาสินค้า, และร่างรายละเอียดสินค้า (ในราคา 1.00 บาท/เครดิต)',
      'เช็คสลิปอัตโนมัติ',
      'เชื่อมต่อ Stripe (บัตร/PromptPay)',
      'ลงสินค้าได้ไม่จำกัดจำนวน',
      'ระบบวิเคราะห์กำไร-ขาดทุนรายวัน',
    ],
    isAiSupported: true,
    aiUsageMultiplier: 1.3,
  },
  ULTIMATE: {
    name: 'Ultimate',
    price: 1990,
    description:
      'เชื่อมต่อทุก Marketplace และระบบสมาชิกขั้นสูงเพื่อการขายที่ยั่งยืน',
    features: [
      'สิทธิ์ใช้งาน AI อัจฉริยะ แชทตอบลูกค้า, ช่วยค้นหาสินค้า, และร่างรายละเอียดสินค้า (ในราคา 0.85 บาท/เครดิต)',
      'ส่งออกข้อมูลสินค้าไป Lazada/Shopee (CSV/JSON)',
      'ระบบสมาชิก & สะสมแต้ม (CRM)',
      'Support พิเศษดูแลส่วนตัวตลอด 24 ชม.',
    ],
    isAiSupported: true,
    aiUsageMultiplier: 1.1,
  },
}
