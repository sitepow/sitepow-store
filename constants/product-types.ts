import { ComponentType } from 'react'

import { Box, Download, Headset, Key } from 'lucide-react'

export interface ProductTypeFeature {
  title: string
  description: string
  icon?: ComponentType<{ className?: string; size?: number }>
}

export const PRODUCT_TYPE_FEATURES: ProductTypeFeature[] = [
  {
    title: 'สินค้าทั่วไป (Physical)',
    description:
      'รองรับการจัดการสต็อกสินค้าจับต้องได้ พร้อมระบบจัดการคลังรายสาขาที่แม่นยำและมาตรฐานการจัดส่งที่คุณควบคุมเองได้',
    icon: Box,
  },
  {
    title: 'คีย์ดิจิทัล (Digital Items)',
    description:
      'จำหน่ายรหัสเติมเงิน, คีย์เกม หรือรหัสซอฟต์แวร์แบบ Unique พร้อมระบบสุ่มจ่ายคีย์อัตโนมัติและตรวจสอบสถานะการใช้งานให้ทันที',
    icon: Key,
  },
  {
    title: 'ลิงก์ดาวน์โหลด (Digital Link)',
    description:
      'ส่งมอบเนื้อหาดิจิทัลผ่านลิงก์ดาวน์โหลดส่วนตัว เพิ่มความปลอดภัยด้วยการจัดการสิทธิ์การเข้าถึงข้อมูลไฟล์งานหรือคอร์สเรียนของคุณ',
    icon: Download,
  },
  {
    title: 'บริการดิจิทัล (Digital Service)',
    description:
      'เชื่อมต่อผ่าน Webhook ไปยังระบบ Logic หลังบ้านของคุณโดยตรง เหมาะสำหรับงานจ้างทำของ, ปั๊ม Rank หรือบริการที่คุณต้องการจัดการเองผ่าน API',
    icon: Headset,
  },
]
