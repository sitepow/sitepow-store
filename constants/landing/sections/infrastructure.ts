import type { ComponentType } from 'react'

import {
  IconBolt,
  IconBrandNextjs,
  IconCpu,
  IconDatabase,
  IconDatabaseCog,
  IconShieldCheck,
  IconWorld,
} from '@tabler/icons-react'

export interface InfrastructureFeature {
  title: string
  description: string
  icon?: ComponentType<{ className?: string; size?: number }>
}

export const INFRASTRUCTURE_FEATURES: InfrastructureFeature[] = [
  {
    title: 'Redis Distributed Caching',
    description:
      'ใช้ Redis ช่วยจัดการ Cache ข้อมูลที่ถูกเรียกใช้บ่อย ลดภาระการคิวรีฐานข้อมูลโดยตรง <hilight>ทำให้หน้าเว็บแสดงผลได้เกือบจะทันที (Near-instant loading)</hilight>',
    icon: IconBolt,
  },
  {
    title: 'CPU AMD EPYC™ Enterprise Grade',
    description:
      'ทุกร้านค้ารันบน CPU AMD EPYC™ ระดับ Enterprise ผ่าน ReadyIDC ศูนย์ข้อมูลชั้นนำของไทย <hilight>รองรับโหลดสูงได้อย่างเสถียร</hilight>',
    icon: IconCpu,
  },
  {
    title: 'Next.js App Router',
    description:
      'สร้างด้วย Next.js App Router รุ่นล่าสุด รองรับ Server Components และ Streaming <hilight>ทำให้หน้าร้านโหลดเร็วกว่าคู่แข่ง</hilight>',
    icon: IconBrandNextjs,
  },
  {
    title: 'PostgreSQL + Prisma ORM',
    description:
      'ข้อมูลทั้งหมดเก็บใน PostgreSQL ด้วย Prisma ORM รองรับ Transaction ซับซ้อน <hilight>ข้อมูลสินค้า ออเดอร์ และลูกค้าปลอดภัย 100%</hilight>',
    icon: IconDatabaseCog,
  },
  {
    title: 'Multi-tenant Architecture',
    description:
      'แต่ละร้านค้าแยก Namespace ชัดเจน ข้อมูลไม่ปะปนกัน <hilight>รองรับร้านค้าหลายหมื่นร้านบนโครงสร้างเดียวกันได้พร้อมกัน</hilight>',
    icon: IconDatabase,
  },
  {
    title: 'SSL & Security มาตรฐานสากล',
    description:
      'ทุกร้านมี SSL Certificate อัตโนมัติ เข้ารหัสข้อมูลตลอดเส้นทาง <hilight>ป้องกันการโจมตีและรั่วไหลของข้อมูลลูกค้า</hilight>',
    icon: IconShieldCheck,
  },
  {
    title: 'Data Center ในไทย',
    description:
      'เซิร์ฟเวอร์ตั้งอยู่ในไทย Latency ต่ำกว่า 10ms สำหรับผู้ใช้ในประเทศ <hilight>ลูกค้าเปิดหน้าร้านได้ไวทุกอุปกรณ์</hilight>',
    icon: IconWorld,
  },
]
