import { ComponentType } from 'react'

import { FileCheck, Handshake, Store, Tags, TrendingUp } from 'lucide-react'

export interface ResellerFeature {
  title: string
  description: string
  icon?: ComponentType<{ className?: string; size?: number }>
}

export const RESELLER_FEATURES: ResellerFeature[] = [
  {
    title: 'ระบบสัญญาตัวแทนจำหน่าย (Reseller Agreement)',
    description:
      'ทำข้อตกลงและอนุมัติสิทธิ์ตัวแทนได้ทั้งแบบร้านค้าภายในระบบและตัวแทนภายนอก <hilight>บริหารเครือข่ายขายส่งได้อย่างเป็นระบบ</hilight>',
    icon: Handshake,
  },
  {
    title: 'ตั้งราคาส่งแยกรายบุคคล/รายสินค้า',
    description:
      'กำหนดส่วนลดเฉพาะตัวแทน หรือกำหนดราคาส่งพิเศษระดับ Variant <hilight>รองรับโครงสร้างราคาที่ยืดหยุ่นตามระดับของตัวแทน</hilight>',
    icon: Tags,
  },
  {
    title: 'รองรับประเภทตัวแทนที่หลากหลาย',
    description:
      'รองรับทั้งการเชื่อมต่อร้านค้าตัวแทนในระบบ (Internal Store) และการสั่งซื้อจากตัวแทนภายนอก <hilight>ขยายช่องทางขายส่งได้ไร้ขีดจำกัด</hilight>',
    icon: Store,
  },
  {
    title: 'ติดตามยอดขายส่งและออเดอร์ตัวแทน',
    description:
      'เชื่อมโยงออเดอร์ของตัวแทนเข้ากับระบบคลังสินค้า <hilight>ช่วยให้คำนวณส่วนต่างและติดตามยอดขายรวมของตัวแทนได้แม่นยำ</hilight>',
    icon: TrendingUp,
  },
  {
    title: 'จัดการสถานะและเงื่อนไขสัญญา',
    description:
      'ควบคุมสถานะสัญญา (Pending, Active, Terminated) พร้อมบันทึกวันที่เริ่มสัญญา <hilight>ให้คุณควบคุมพันธมิตรทางการค้าได้อย่างโปร่งใส</hilight>',
    icon: FileCheck,
  },
]
