import { ComponentType } from 'react'

import {
  BarChart3,
  CreditCard,
  Printer,
  ShoppingBasket,
  Users,
} from 'lucide-react'

export interface POSFeature {
  title: string
  description: string
  icon?: ComponentType<{ className?: string; size?: number }>
}

export const POS_FEATURES: POSFeature[] = [
  {
    title: 'รองรับการขายหน้าร้าน (POS)',
    description:
      'เปลี่ยนอุปกรณ์ของคุณเป็นเครื่องคิดเงินอัจฉริยะ รองรับบาร์โค้ด และ<hilight>ตัดสต็อกสินค้าในคลังแบบ Real-time ทันทีที่มีการขาย</hilight>',
    icon: ShoppingBasket,
  },
  {
    title: 'ช่องทางชำระเงินครบวงจร',
    description:
      'รองรับทั้งเงินสดและโอนเงินผ่าน QR Code พร้อม<hilight>ระบบตรวจสอบความถูกต้องของสลิปอัตโนมัติ ช่วยลดความผิดพลาดและกันการโกง</hilight>',
    icon: CreditCard,
  },
  {
    title: 'สรุปยอดขายอัจฉริยะ',
    description:
      'ดูรายงานสรุปยอดรายวันแบบ Real-time พร้อม<hilight>วิเคราะห์ข้อมูลสินค้าขายดี เพื่อช่วยให้คุณบริหารจัดการสต็อกได้อย่างแม่นยำ</hilight>',
    icon: BarChart3,
  },
  {
    title: 'ระบบพิมพ์ใบเสร็จทันใจ',
    description:
      'รองรับการเชื่อมต่อกับเครื่องพิมพ์ความร้อน ออกใบเสร็จให้ลูกค้าได้ทันที <hilight>เพิ่มภาพลักษณ์ความเป็นมืออาชีพให้ร้านค้าของคุณ</hilight>',
    icon: Printer,
  },
  {
    title: 'เก็บฐานข้อมูลลูกค้า',
    description:
      'บันทึกประวัติการซื้อของลูกค้าหน้าร้าน เพื่อนำไปต่อยอดทำระบบสมาชิก <hilight>รักษาฐานลูกค้าประจำและกระตุ้นการกลับมาซื้อซ้ำ</hilight>',
    icon: Users,
  },
]
