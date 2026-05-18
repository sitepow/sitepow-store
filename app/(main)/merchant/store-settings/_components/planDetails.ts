export type PlanType = 'STARTER' | 'PRO' | 'ULTIMATE'

export interface PlanDetails {
  name: string
  price: number
  features: string[]
  isAiSupported: boolean
}

export const PLAN_DETAILS: Record<PlanType, PlanDetails> = {
  STARTER: {
    name: 'Starter Plan',
    price: 0,
    features: ['ลงสินค้าได้จำกัด', 'ระบบจัดการออเดอร์พื้นฐาน', 'ไม่มีระบบ AI'],
    isAiSupported: false,
  },
  PRO: {
    name: 'Pro Plan',
    price: 490,
    features: [
      'เพิ่มจำนวนสินค้า',
      'ระบบ Easy Slip ตรวจสลิปอัตโนมัติ',
      'ระบบ AI Vision พื้นฐาน',
    ],
    isAiSupported: true,
  },
  ULTIMATE: {
    name: 'Ultimate Plan',
    price: 1290,
    features: [
      'ลงสินค้าได้ไม่จำกัด (Unlimited)',
      'ระบบ AI ครบวงจร (Vision & Search)',
      'ระบบ CRM เต็มรูปแบบ',
    ],
    isAiSupported: true,
  },
}
