import { ComponentType } from 'react'

import {
  AlertTriangle,
  ArrowLeftRight,
  Boxes,
  Building2,
  ShieldAlert,
} from 'lucide-react'

export interface InventoryFeature {
  title: string
  description: string
  icon?: ComponentType<{ className?: string; size?: number }>
}

export const INVENTORY_FEATURES: InventoryFeature[] = [
  {
    title: 'จัดการสต็อกสินค้าแยกรายสาขา',
    description:
      'เช็กจำนวนสินค้าคงเหลือและตั้งค่าสต็อกขั้นต่ำ (Min Stock) แยกตามสาขาได้แม่นยำ <hilight>ป้องกันสินค้าขาดแคลนในแต่ละจุดขาย</hilight>',
    icon: Boxes,
  },
  {
    title: 'ระบบโอนย้ายสินค้าระหว่างสาขา (Stock Transfer)',
    description:
      'ส่งคำขอและบันทึกการโอนย้ายสินค้าจากสาขาหนึ่งไปยังอีกสาขาหนึ่ง <hilight>ติดตามการเคลื่อนย้ายสินค้าในระบบได้แบบ Real-time</hilight>',
    icon: ArrowLeftRight,
  },
  {
    title: 'ปรับสต็อกตามเหตุผลจริง (Stock Adjustment)',
    description:
      'ลงบันทึกการปรับสต็อกพร้อมระบุเหตุผล เช่น สินค้าชำรุด (Damaged), สูญหาย (Lost), หรือหมดอายุ (Expired) <hilight>คุมต้นทุนสูญเสียได้ตรงจุด</hilight>',
    icon: AlertTriangle,
  },
  {
    title: 'ระบบแจ้งเตือนเมื่อสินค้าใกล้หมด',
    description:
      'แจ้งเตือนอัตโนมัติเมื่อจำนวนสินค้าลดลงถึงระดับ Min Stock <hilight>ช่วยให้วางแผนเติมสินค้าเข้าสาขาได้ทันเวลา</hilight>',
    icon: ShieldAlert,
  },
  {
    title: 'รองรับโครงสร้างหลายสาขา (Multi-Branch)',
    description:
      'จัดการข้อมูลสาขา ที่อยู่ เวลาทำการ และผูกคลังสินค้าของแต่ละสาขาเข้ากับระบบ POS <hilight>บริหารหลายสาขาได้ไร้รอยต่อ</hilight>',
    icon: Building2,
  },
]
