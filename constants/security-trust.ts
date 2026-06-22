import { ComponentType } from 'react'

import {
  AlertTriangleIcon,
  CloudIcon,
  DatabaseBackupIcon,
  EyeOffIcon,
  LockIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  UsersIcon,
} from 'lucide-react'

export interface SecurityTrustFeature {
  title: string
  description: string
  icon?: ComponentType<{ className?: string; size?: number }>
}

export const SECURITY_FEATURES: SecurityTrustFeature[] = [
  {
    title: 'ความปลอดภัยระดับ Cloud-Native',
    description:
      'ข้อมูลของคุณไม่อยู่ในเครื่องใคร แต่ถูกจัดเก็บบน Server ที่เข้ารหัสด้วยมาตรฐานเดียวกับธนาคาร ป้องกันการเข้าถึงที่ไม่ได้รับอนุญาต 100%',
    icon: CloudIcon,
  },
  {
    title: 'อัปเดตช่องโหว่แบบ Real-time',
    description:
      'ไม่ต้องรอ Patch หรือโหลดไฟล์ใหม่ ระบบของเราอัปเดตความปลอดภัยให้คุณอัตโนมัติทุกวินาที ตัดโอกาสการถูกโจมตีด้วยซอฟต์แวร์ดัดแปลง',
    icon: ShieldCheckIcon,
  },
  {
    title: 'ไร้ช่องโหว่จากการ Crack',
    description:
      'ด้วยสถาปัตยกรรม SaaS Logic สำคัญทั้งหมดถูกล็อคไว้หลัง Server ทำให้ไม่มีใครสามารถ Reverse Engineering หรือดัดแปลงเงื่อนไขการใช้งานได้',
    icon: LockIcon,
  },
  {
    title: 'ปกป้องความเป็นส่วนตัว',
    description:
      'เรายึดมั่นในความปลอดภัยของข้อมูลลูกค้าของคุณด้วยระบบ Log ตรวจสอบที่โปร่งใส ไม่มีการแอบฝัง Spyware หรือ Malware เหมือนโปรแกรมเถื่อนทั่วไป',
    icon: EyeOffIcon,
  },
  {
    title: 'ระบบสำรองข้อมูลอัตโนมัติ',
    description:
      'ไม่ต้องกลัวข้อมูลสูญหายด้วยระบบ Backup แบบทันทีที่คุณเปลี่ยนสถานะออเดอร์ ข้อมูลสำคัญของคุณจะถูกจัดเก็บหลายชุดในหลายสถานที่',
    icon: DatabaseBackupIcon,
  },
  {
    title: 'ควบคุมการเข้าถึงรายบุคคล',
    description:
      'จัดการสิทธิ์พนักงานในร้านได้อย่างละเอียด ใครดูอะไรได้ หรือแก้ข้อมูลส่วนไหนได้ คุณกำหนดเองได้ทั้งหมดบนระบบส่วนกลาง',
    icon: UsersIcon,
  },
  {
    title: 'แจ้งเตือนภัยคุกคามเชิงรุก',
    description:
      'ระบบตรวจจับพฤติกรรมผิดปกติ หากมีการล็อกอินจากตำแหน่งที่ไม่คุ้นเคยหรือพยายามเข้าถึงฐานข้อมูล ระบบจะส่งแจ้งเตือนให้คุณทันที',
    icon: AlertTriangleIcon,
  },
  {
    title: 'ประสิทธิภาพที่สม่ำเสมอ',
    description:
      'ไม่ต้องกังวลเรื่องเครื่องช้าหรือสเปกไม่พอ เพราะทุกอย่างประมวลผลบน Cloud ระบบของคุณจะเร็วและเสถียรเท่ากันไม่ว่าจะเปิดจากอุปกรณ์ใด',
    icon: RefreshCwIcon,
  },
]
