import { ComponentType } from 'react'

import { Box, Download, ExternalLink, Headset, Key } from 'lucide-react'

export interface ProductTypeFeature {
  title: string
  description: string
  icon?: ComponentType<{ className?: string; size?: number }>
}

export const PRODUCT_TYPE_FEATURES: ProductTypeFeature[] = [
  {
    title: 'สินค้าทั่วไป (Physical)',
    description:
      'รองรับการจัดการสต็อกสินค้าจับต้องได้ พร้อม<hilight>ระบบจัดการคลังรายสาขาที่แม่นยำและมาตรฐานการจัดส่งที่คุณควบคุมเองได้</hilight>',
    icon: Box,
  },
  {
    title: 'คีย์ดิจิทัล (Digital Items)',
    description:
      'จำหน่ายรหัสเติมเงิน, คีย์เกม หรือรหัสซอฟต์แวร์แบบ Unique พร้อม<hilight>ระบบสุ่มจ่ายคีย์อัตโนมัติและตรวจสอบสถานะการใช้งานให้ทันที</hilight>',
    icon: Key,
  },
  {
    title: 'ลิงก์ดาวน์โหลด (Digital Link)',
    description:
      'ส่งมอบเนื้อหาดิจิทัลผ่านลิงก์ดาวน์โหลดส่วนตัว เพิ่มความปลอดภัยด้วย<hilight>การจัดการสิทธิ์การเข้าถึงข้อมูลไฟล์งานหรือคอร์สเรียนของคุณ</hilight>',
    icon: Download,
  },
  {
    title: 'บริการดิจิทัล (Digital Service)',
    description:
      'เชื่อมต่อผ่าน Webhook ไปยังระบบ Logic หลังบ้านของคุณโดยตรง เหมาะสำหรับ<hilight>งานจ้างทำของ, ปั๊ม Rank หรือบริการที่คุณต้องการจัดการเองผ่าน API</hilight>',
    icon: Headset,
  },
  {
    title: 'สินค้าแอฟฟิลิเอต (Affiliate Link)',
    description:
      'รวมลิงก์สินค้านายหน้า Shopee, Lazada, TikTok Shop และร้านค้าภายนอก พร้อม<hilight>ระบบเปรียบเทียบราคาและปุ่มคลิกสั่งซื้อตรงไปยังแพลตฟอร์ม</hilight>',
    icon: ExternalLink,
  },
]
