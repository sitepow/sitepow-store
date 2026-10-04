import { ComponentType } from 'react'

import { Bot, FileCheck2, MessageSquare, ShieldCheck, Zap } from 'lucide-react'

export interface AiVerificationFeature {
  title: string
  description: string
  icon?: ComponentType<{ className?: string; size?: number }>
}

export const AI_VERIFICATION_FEATURES: AiVerificationFeature[] = [
  {
    title: 'ระบบตรวจสลิปโอนเงินอัตโนมัติ (Slip Verification)',
    description:
      'ตรวจสอบความถูกต้องของสลิปโอนเงิน ยอดเงิน และชื่อบัญชีทันทีที่ลูกค้าอัปโหลด <hilight>ป้องกันสลิปปลอมและสลิปซ้ำได้ 100%</hilight>',
    icon: FileCheck2,
  },
  {
    title: 'บันทึกประวัติการสแกนสลิป (Slip History)',
    description:
      'เก็บบันทึกผลการตรวจสลิปทุกรายการ พร้อมตรวจจับพฤติกรรมลูกค้าที่ส่งสลิปปลอมบ่อยเพื่อทำการแจ้งเตือนหรือระงับสิทธิ์',
    icon: ShieldCheck,
  },
  {
    title: 'ผู้ช่วย AI ตอบแชทลูกค้าอัตโนมัติ',
    description:
      'รองรับการเปิดใช้งาน AI ในแชทสนทนา ช่วยตอบคำถาม ให้ข้อมูลสินค้า และดูแลลูกค้าได้ตลอด 24 ชั่วโมง <hilight>ปิดการขายได้แม้ไม่อยู่หน้าจอ</hilight>',
    icon: Bot,
  },
  {
    title: 'กล่องรวมแชทกลาง (Inbox Conversation)',
    description:
      'รวมข้อความจากลูกค้าไว้ในที่เดียว ทั้งเคส Support และเคสการสั่งซื้อหน้าร้าน ช่วยให้ทีมงานสลับกันดูแลแชทได้อย่างรวดเร็ว',
    icon: MessageSquare,
  },
  {
    title: 'ประมวลผลรวดเร็วแบบ Real-time',
    description:
      'ทำรายการยืนยันยอดเงินและตอบกลับลูกค้าอัตโนมัติภายในไม่กี่วินาที <hilight>ลดภาระงานของแอดมินได้อย่างมหาศาล</hilight>',
    icon: Zap,
  },
]
