import { ComponentType } from 'react'

import {
  Bot,
  Image as ImageIcon,
  LifeBuoy,
  MessageSquare,
  Users,
} from 'lucide-react'

export interface ChatFeature {
  title: string
  description: string
  icon?: ComponentType<{ className?: string; size?: number }>
}

export const CHAT_FEATURES: ChatFeature[] = [
  {
    title: 'กล่องรวมแชทกลาง (Centralized Chat Inbox)',
    description:
      'รวมข้อความจากลูกค้าไว้ในที่เดียว ทั้งแชทซื้อขายหน้าร้านและเคสบริการหลังการขาย <hilight>แอดมินทำงานสะดวก ไม่ตกหล่นทุกการติดต่อ</hilight>',
    icon: MessageSquare,
  },
  {
    title: 'แยกประเภทการสนทนาชัดเจน',
    description:
      'แบ่งแชทตามวัตถุประสงค์ (Store & Support) ช่วยให้การส่งต่อเคสและดูแลลูกค้าทำได้อย่างถูกจุด <hilight>เพิ่มความรวดเร็วในการแก้ปัญหาให้ลูกค้า</hilight>',
    icon: LifeBuoy,
  },
  {
    title: 'ผู้ช่วย AI ตอบแชทอัจฉริยะ 24 ชม.',
    description:
      'เปิด-ปิดการใช้งาน AI Assistant รายแชทได้ทันที <hilight>ช่วยคอยตอบคำถาม ให้ข้อมูลสินค้า และปิดการขายแทนคุณได้ตลอดเวลา</hilight>',
    icon: Bot,
  },
  {
    title: 'ดึงทีมงานร่วมดูแลแชท (Conversation Members)',
    description:
      'ดึงแอดมินหรือพนักงานหลายคนเข้ามาร่วมตอบแชทเดียวกันได้ <hilight>พร้อมระบบนับจำนวนข้อความที่ยังไม่ได้อ่าน (Unread Count) ของแต่ละคน</hilight>',
    icon: Users,
  },
  {
    title: 'รองรับส่งรูปภาพและข้อความระบบ',
    description:
      'ส่งรูปภาพสินค้า สลิปโอนเงิน หรือการแจ้งเตือนจากระบบ (System Message) ได้ลื่นไหล <hilight>สื่อสารชัดเจน ปิดการขายได้ง่ายขึ้น</hilight>',
    icon: ImageIcon,
  },
]
