import { ComponentType } from 'react'

import {
  IconHeartHandshake,
  IconMoodSmile,
  IconTrendingUp,
} from '@tabler/icons-react'

export interface PricingPhilosophyFeature {
  title: string
  description: string
  icon?: ComponentType<{ className?: string; size?: number }>
}

export const PHILOSOPHY_FEATURES: PricingPhilosophyFeature[] = [
  {
    title: 'จ่ายครั้งแรกครั้งเดียว',
    description:
      'สมัครเริ่มต้นเพียงเดือนแรก เพื่อให้เราเซตอัปทุกอย่างให้คุณพร้อมขายทันที',
    icon: IconHeartHandshake,
  },
  {
    title: 'ระบบคิดตามยอดขาย',
    description:
      'ถ้าเดือนไหนร้านคุณขายได้ ระบบจะหักค่าบริการตามแพ็กเกจปกติทันที มั่นใจได้ว่าเงินหมุนเวียนคล่องตัว',
    icon: IconTrendingUp,
  },
  {
    title: 'ไม่มีขาย ไม่ต้องจ่าย',
    description:
      'ถ้ายอดขายเป็นศูนย์ ระบบจะหยุดเก็บค่าเช่าและต่ออายุให้อัตโนมัติ ไม่มีการหักค่า GP เพิ่มให้กวนใจ',
    icon: IconMoodSmile,
  },
]
