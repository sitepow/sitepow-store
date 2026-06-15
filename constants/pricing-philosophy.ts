import { ComponentType } from 'react'

import {
  IconArrowsExchange,
  IconCalendarCheck,
  IconHeartHandshake,
  IconMoodSmile,
  IconRocket,
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
      'สมัครเริ่มต้นเพียงเดือนแรก เพื่อให้เราเซตอัปทุกอย่างให้คุณพร้อมขายทันที ไม่ต้องกังวลเรื่องค่าใช้จ่ายก้อนใหญ่ตั้งแต่ก้าวแรก',
    icon: IconHeartHandshake,
  },
  {
    title: 'ระบบคิดตามยอดขาย',
    description:
      'ถ้าเดือนไหนร้านคุณขายได้ ระบบจะหักค่าบริการตามแพ็กเกจปกติ มั่นใจได้ว่ากระแสเงินสดในธุรกิจคุณจะยังคงคล่องตัวอยู่เสมอ',
    icon: IconTrendingUp,
  },
  {
    title: 'ไม่มีขาย ไม่ต้องจ่าย',
    description:
      'ถ้ายอดขายเป็นศูนย์ ระบบจะหยุดเก็บค่าเช่าและต่ออายุให้โดยอัตโนมัติ เพื่อให้คุณมีเวลาตั้งหลักโดยไม่ต้องแบกรับต้นทุนคงที่',
    icon: IconMoodSmile,
  },
  {
    title: 'คุ้มค่าด้วยส่วนลดรายปี',
    description:
      'เลือกสมัครแบบรายปีเพื่อล็อคราคาประหยัดกว่าเดิม พร้อมการันตีสิทธิ์การใช้งานต่อเนื่องยาวนานตลอด 12 เดือนโดยไม่ต้องคอยลุ้นยอดขายรายเดือน',
    icon: IconCalendarCheck,
  },
  {
    title: 'ปรับแพลนให้ตรงใจเสมอ',
    description:
      'เราพร้อมปรับแพ็กเกจให้เหมาะสมกับธุรกิจของคุณ หากยอดขายคุณเติบโตขึ้น ระบบจะช่วยแนะนำแผนที่คุ้มค่าและรองรับการขยายตัวได้ดีที่สุด',
    icon: IconArrowsExchange,
  },
  {
    title: 'พร้อมสเกลไปกับคุณ',
    description:
      'เมื่อธุรกิจเริ่มติดลมบน เราพร้อมปลดล็อคฟีเจอร์ระดับสูงให้คุณใช้ได้ทันที เพื่อให้ร้านค้าของคุณรองรับลูกค้าได้มหาศาลและไม่มีสะดุด',
    icon: IconRocket,
  },
]
