import { Plan } from '@/generated/prisma/enums'

export interface PlanDetails {
  name: string
  price: number
  description: string
  features: string[]
  aiUsageMultiplier: number
  maxProducts: number | null
}

export const PLAN_RANK: Record<Plan, number> = {
  [Plan.FREE]: 0,
  [Plan.STARTER]: 1,
  [Plan.PRO]: 2,
  [Plan.ULTIMATE]: 3,
}

export const PLAN_DETAILS: Record<Plan, PlanDetails> = {
  FREE: {
    name: 'Free',
    price: 0,
    description: 'เปิดร้านออนไลน์วันนี้ ฟรีตลอดชีพ ไม่ต้องใส่บัตร ไม่มีหมดอายุ',
    features: [
      'จำกัดการลงสินค้าสูงสุด 5 ชิ้น',
      'สิทธิ์ใช้งาน AI อัจฉริยะ (ราคา 1.35 บาท/เครดิต)',
      'เช็คสลิปอัตโนมัติ (4.00 เครดิต/สลิป)',
    ],
    maxProducts: 5,
    aiUsageMultiplier: 1.8,
  },
  STARTER: {
    name: 'Starter',
    price: 490,
    description: 'เริ่มต้นขายออนไลน์แบบมืออาชีพ กำไรเต็ม 100% ไม่โดนหัก GP',
    features: [
      'ลงสินค้าได้สูงสุด 50 ชิ้น',
      'เชื่อมต่อโดเมนส่วนตัว (.com, .net, ฯลฯ)',
      'สิทธิ์ใช้งาน AI อัจฉริยะ (ราคา 1.15 บาท/เครดิต)',
      'เช็คสลิปอัตโนมัติ (2.67 เครดิต/สลิป)',
      'ปลดล็อกลบ Footer ลายน้ำ Sitepow Store',
    ],
    maxProducts: 50,
    aiUsageMultiplier: 1.5,
  },
  PRO: {
    name: 'Pro',
    price: 990,
    description:
      'ปลดล็อกพลัง AI และระบบเช็คสลิปอัตโนมัติ เพื่อการขายที่รวดเร็วกว่า',
    features: [
      'ลงสินค้าได้ไม่จำกัดจำนวน',
      'เชื่อมต่อโดเมนส่วนตัว (.com, .net, ฯลฯ)',
      'สิทธิ์ใช้งาน AI อัจฉริยะ (ราคา 1.00 บาท/เครดิต)',
      'เช็คสลิปอัตโนมัติ (1.60 เครดิต/สลิป)',
      'ปลดล็อกลบ Footer ลายน้ำ Sitepow Store',
    ],
    maxProducts: null,
    aiUsageMultiplier: 1.3,
  },
  ULTIMATE: {
    name: 'Ultimate',
    price: 1990,
    description:
      'เชื่อมต่อทุก Marketplace และระบบสมาชิกขั้นสูงเพื่อการขายที่ยั่งยืน',
    features: [
      'ลงสินค้าได้ไม่จำกัดจำนวน',
      'เชื่อมต่อโดเมนส่วนตัว (.com, .net, ฯลฯ)',
      'สิทธิ์ใช้งาน AI อัจฉริยะ (ราคา 0.85 บาท/เครดิต)',
      'เช็คสลิปอัตโนมัติ (1.07 เครดิต/สลิป)',
      'ปลดล็อกลบ Footer ลายน้ำ Sitepow Store',
      'Support พิเศษดูแลส่วนตัวตลอด 24 ชม.',
    ],
    maxProducts: null,
    aiUsageMultiplier: 1.1,
  },
}
