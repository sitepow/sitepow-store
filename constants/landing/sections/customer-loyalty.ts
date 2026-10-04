import { ComponentType } from 'react'

import { Award, Camera, Gift, Star, Users } from 'lucide-react'

export interface CustomerLoyaltyFeature {
  title: string
  description: string
  icon?: ComponentType<{ className?: string; size?: number }>
}

export const CUSTOMER_LOYALTY_FEATURES: CustomerLoyaltyFeature[] = [
  {
    title: 'ระบบคะแนนสะสม (Reward Points)',
    description:
      'ลูกค้าได้รับแต้มจากการซื้อสินค้าและสามารถนำแต้มมาใช้เป็นส่วนลดออเดอร์ถัดไป <hilight>กระตุ้นการซื้อซ้ำได้อย่างมีประสิทธิภาพ</hilight>',
    icon: Award,
  },
  {
    title: 'กระตุ้นรีวิวด้วย Review Rewards',
    description:
      'ให้แต้มโบนัสเพิ่มพิเศษเมื่อลูกค้าเขียนรีวิวยาว แนบรูปภาพ หรืออัปโหลดวิดีโอรีวิว <hilight>เพิ่ม Social Proof ให้ร้านค้าดูน่าเชื่อถือ</hilight>',
    icon: Camera,
  },
  {
    title: 'คูปองส่วนลดและโค้ดโปรโมชัน',
    description:
      'สร้างคูปองส่วนลดทั้งแบบเปอร์เซ็นต์และยอดเงินคงที่ กำหนดขั้นต่ำการสั่งซื้อ และจำกัดการใช้ต่อคนได้ยืดหยุ่น',
    icon: Gift,
  },
  {
    title: 'ระบบจัดกลุ่มลูกค้าและ Merchant Note',
    description:
      'บันทึกยอดซื้อสะสม (Total Spent) ติด Tag จัดกลุ่มลูกค้า และบันทึกโน้ตดูแลลูกค้า VIP รายบุคคลได้อย่างใส่ใจ',
    icon: Users,
  },
  {
    title: 'จัดการคะแนนและคูปองเฉพาะรายสาขา',
    description:
      'ผูกการแจกคูปองและคะแนนสะสมเข้ากับสาขาที่กำหนด <hilight>สร้างแคมเปญการตลาดเฉพาะพื้นที่ได้อย่างตรงจุด</hilight>',
    icon: Star,
  },
]
