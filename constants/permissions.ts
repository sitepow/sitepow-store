import { ComponentType } from 'react'

import { FileText, Lock, ShieldCheck, UserCheck, Users } from 'lucide-react'

export interface PermissionFeature {
  title: string
  description: string
  icon?: ComponentType<{ className?: string; size?: number }>
}

export const PERMISSION_FEATURES: PermissionFeature[] = [
  {
    title: 'กำหนดสิทธิ์ละเอียดยิบ (Granular Permission)',
    description:
      'ควบคุมการเข้าถึงข้อมูลตาม Domain และ Action ได้อย่างแม่นยำ <hilight>เลือกสิทธิ์การอ่าน สร้าง แก้ไข ลบ อนุมัติ หรือยกเลิกแยกกันได้ทั้งหมด</hilight>',
    icon: ShieldCheck,
  },
  {
    title: 'จัดสรรสิทธิ์ตามบทบาทและรายสาขา',
    description:
      'กำหนดบทบาทพนักงานให้เข้าถึงเฉพาะสาขาที่รับผิดชอบ <hilight>จำกัดเขตข้อมูลเพื่อความปลอดภัยและป้องกันข้อมูลสำคัญรั่วไหล</hilight>',
    icon: UserCheck,
  },
  {
    title: 'รองรับ Default Roles ครอบคลุม',
    description:
      'มีบทบาทสำเร็จรูปให้เลือกใช้ เช่น Owner, Manager, Cashier, Auditor หรือ Support <hilight>พร้อมสำหรับการเริ่มต้นใช้งานได้ทันที</hilight>',
    icon: Users,
  },
  {
    title: 'ปรับแต่ง Custom Permissions รายบุคคล',
    description:
      'ยืดหยุ่นกว่าด้วยการเพิ่มหรือลดสิทธิ์พิเศษให้พนักงานรายบุคคล <hilight>ตอบโจทย์โครงสร้างองค์กรและการทำงานที่หลากหลาย</hilight>',
    icon: Lock,
  },
  {
    title: 'บันทึกประวัติการทำงาน (Activity Log)',
    description:
      'ตรวจสอบย้อนหลังได้ทุกการกระทำ ไม่ว่าจะเป็นการแก้ไขสิทธิ์หรือจัดการข้อมูล <hilight>โปร่งใส ตรวจสอบผู้ใช้งานและเวลาที่ทำรายการได้ชัดเจน</hilight>',
    icon: FileText,
  },
]
