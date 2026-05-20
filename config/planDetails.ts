import { Plan } from '@/generated/prisma/enums'

export interface PlanDetails {
  name: string
  price: number
  description: string
  features: string[]
  isAiSupported: boolean
}

export const PLAN_DETAILS: Record<Plan, PlanDetails> = {
  STARTER: {
    name: 'Starter',
    price: 490,
    description: 'เริ่มต้นขายออนไลน์แบบมืออาชีพ กำไรเต็ม 100% ไม่โดนหัก GP',
    features: [
      'ลงสินค้าได้สูงสุด 50 ชิ้น',
      'ระบบหน้าร้านออนไลน์ส่วนตัว',
      'รองรับการรับเงินโอน (เช็คสลิปเอง)',
      'ระบบจัดการขนส่งและพิมพ์ใบปะหน้ามาตรฐาน',
      '0% ค่าคอมมิชชั่นทุกออเดอร์',
    ],
    isAiSupported: false,
  },
  PRO: {
    name: 'Pro',
    price: 990,
    description:
      'ปลดล็อกพลัง AI และระบบเช็คสลิปอัตโนมัติ เพื่อการขายที่รวดเร็วกว่า',
    features: [
      'AI Vision ช่วยลงของ (100 ครั้ง/เดือน)',
      'AI Visual Search ช่วยพนักงานหาของ (100 ครั้ง/เดือน)',
      'เช็คสลิปอัตโนมัติด้วย Easy Slip',
      'เชื่อมต่อ GB Prime Pay (บัตร/PromptPay)',
      'ลงสินค้าได้ไม่จำกัดจำนวน',
      'ระบบวิเคราะห์กำไร-ขาดทุนรายวัน',
    ],
    isAiSupported: true,
  },
  ULTIMATE: {
    name: 'Ultimate',
    price: 1990,
    description:
      'เชื่อมต่อทุก Marketplace และระบบสมาชิกขั้นสูงเพื่อการขายที่ยั่งยืน',
    features: [
      'AI Vision ช่วยลงของ (500 ครั้ง/เดือน)',
      'AI Visual Search ช่วยพนักงานหาของ (ไม่จำกัด)',
      'ส่งออกข้อมูลสินค้าไป Lazada/Shopee (CSV/JSON)',
      'ระบบสมาชิก & สะสมแต้ม (CRM)',
      'Support พิเศษดูแลส่วนตัวตลอด 24 ชม.',
    ],
    isAiSupported: true,
  },
}
