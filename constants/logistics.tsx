import type { ComponentType } from 'react'

import {
  IconCalculator,
  IconPackage,
  IconPrinter,
  IconSearch,
  IconSend,
  IconTruckDelivery,
} from '@tabler/icons-react'

export interface LogisticsFeature {
  title: string
  description: string
  icon?: ComponentType<{ className?: string; size?: number }>
}

export const LOGISTICS_FEATURES: LogisticsFeature[] = [
  {
    title: 'ตั้งค่าค่าจัดส่งได้อย่างอิสระ',
    description:
      'กำหนดค่าส่งได้เองตามน้ำหนัก จำนวนชิ้น หรือจะจัดส่งฟรีเมื่อซื้อครบกำหนด ช่วยให้คุมต้นทุนได้แม่นยำ',
    icon: IconCalculator,
  },
  {
    title: 'รองรับทุกบริษัทขนส่ง',
    description:
      'ไม่ว่าคุณจะใช้ Flash, J&T, ไปรษณีย์ไทย หรือขนส่งท้องถิ่น ก็สามารถจัดการออเดอร์ในระบบเดียวได้ทันที',
    icon: IconTruckDelivery,
  },
  {
    title: 'พิมพ์ใบปะหน้ามาตรฐาน',
    description:
      'เจนใบปะหน้าที่มีชื่อ-ที่อยู่ชัดเจน พร้อมรายการสินค้า (Packing List) ช่วยให้แพ็คของไวและไม่ส่งผิดคน',
    icon: IconPrinter,
  },
  {
    title: 'ระบบบันทึกเลข Tracking',
    description:
      'แจ้งเลขพัสดุให้ลูกค้าทราบผ่านหน้าร้านออนไลน์ได้ทันที พร้อมระบบเก็บประวัติการส่งย้อนหลัง',
    icon: IconSend,
  },
  {
    title: 'จัดการสถานะพัสดุ',
    description:
      'เปลี่ยนสถานะจาก "เตรียมส่ง" เป็น "ส่งแล้ว" ได้ง่ายๆ ช่วยให้คุณและทีมงานเห็นภาพรวมการทำงานที่ชัดเจน',
    icon: IconPackage,
  },
  {
    title: 'หน้าตรวจสอบสถานะสำหรับลูกค้า',
    description:
      'ลูกค้าสามารถนำเลข Tracking ไปเช็คต่อได้ง่ายๆ ผ่านหน้าเว็บของคุณ ลดภาระการตอบแชทสอบถามสถานะ',
    icon: IconSearch,
  },
]
