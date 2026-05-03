import type { ReactNode } from 'react'

import {
  IconCalculator,
  IconHomeShare,
  IconPrinter,
  IconSearch,
  IconSend,
  IconTruckDelivery,
} from '@tabler/icons-react'

export interface LogisticsFeature {
  title: string
  description: string
  icon: ReactNode
}

export const LOGISTICS_FEATURES: LogisticsFeature[] = [
  {
    title: 'คำนวณค่าส่งอัตโนมัติ',
    description:
      'ไม่ต้องเดาค่าส่งอีกต่อไป ระบบคำนวณตามน้ำหนักหรือขนาดพัสดุให้แม่นยำ ช่วยลดปัญหาค่าส่งเข้าเนื้อ',
    icon: <IconCalculator size={28} stroke={1.5} />,
  },
  {
    title: 'เชื่อมต่อขนส่งชั้นนำ',
    description:
      'รองรับการใช้งานร่วมกับ Flash Express, J&T, และไปรษณีย์ไทย ครอบคลุมทุกพื้นที่ทั่วประเทศ',
    icon: <IconTruckDelivery size={28} stroke={1.5} />,
  },
  {
    title: 'พิมพ์ใบปะหน้าในคลิกเดียว',
    description:
      'ลดเวลาแพ็คของด้วยระบบเจนใบปะหน้าพัสดุอัตโนมัติ พร้อมข้อมูลชื่อ-ที่อยู่ลูกค้าครบถ้วน',
    icon: <IconPrinter size={28} stroke={1.5} />,
  },
  {
    title: 'แจ้งเลข Tracking ทันที',
    description:
      'ระบบจะส่งเลขพัสดุให้ลูกค้าผ่านทางหน้าร้านหรือช่องทางติดต่ออัตโนมัติ เมื่อมีการกดส่งสินค้า',
    icon: <IconSend size={28} stroke={1.5} />,
  },
  {
    title: 'เรียกรถเข้ารับพัสดุ (Pick-up)',
    description:
      'ไม่ต้องไปต่อคิวที่สาขา กดเรียกรถเข้ารับพัสดุถึงหน้าบ้านได้โดยตรงจากระบบจัดการออเดอร์',
    icon: <IconHomeShare size={28} stroke={1.5} />,
  },
  {
    title: 'เช็คสถานะพัสดุ Real-time',
    description:
      'ทั้งคุณและลูกค้าสามารถติดตามสถานะสินค้าได้ตลอดเวลาผ่านหน้าร้าน ลดคำถาม "ของถึงไหนแล้ว" ในแชท',
    icon: <IconSearch size={28} stroke={1.5} />,
  },
]
