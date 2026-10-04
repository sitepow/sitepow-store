import { ComponentType } from 'react'

import {
  Building2,
  FolderTree,
  PieChart,
  Receipt,
  ReceiptText,
} from 'lucide-react'

export interface ExpenseFeature {
  title: string
  description: string
  icon?: ComponentType<{ className?: string; size?: number }>
}

export const EXPENSE_FEATURES: ExpenseFeature[] = [
  {
    title: 'จัดหมวดหมู่ค่าใช้จ่ายชัดเจน',
    description:
      'จำแนกประเภทค่าใช้จ่ายง่ายๆ ไม่ว่าจะเป็นค่าเช่า ค่าน้ำค่าไฟ เงินเดือนพนักงาน หรือค่าการตลาด <hilight>เพื่อการวิเคราะห์ต้นทุนที่แม่นยำ</hilight>',
    icon: FolderTree,
  },
  {
    title: 'แนบหลักฐานและใบเสร็จ',
    description:
      'อัปโหลดรูปภาพใบเสร็จหรือหลักฐานการชำระเงินจัดเก็บเข้าสู่ระบบ <hilight>เพื่อความโปร่งใสและง่ายต่อการตรวจสอบย้อนหลัง</hilight>',
    icon: Receipt,
  },
  {
    title: 'ระบุค่าใช้จ่ายแยกตามสาขา',
    description:
      'บันทึกรายการค่าใช้จ่ายผูกกับสาขาที่เกิดขึ้นจริง <hilight>ช่วยให้คำนวณต้นทุนและกำไรสุทธิของแต่ละสาขาได้อย่างถูกต้อง</hilight>',
    icon: Building2,
  },
  {
    title: 'รายงานสรุปรายรับ-รายจ่าย Real-time',
    description:
      'ประมวลผลยอดขายควบคู่กับค่าใช้จ่ายทันที <hilight>แสดงภาพรวมกำไรสุทธิช่วยให้คุณวางแผนทางการเงินได้เด็ดขาด</hilight>',
    icon: PieChart,
  },
  {
    title: 'ลงบันทึกรายละเอียดและวันที่',
    description:
      'บันทึกวันที่เกิดรายการพร้อม Note รายละเอียดเพิ่มเติม <hilight>ติดตามแนวโน้มการใช้จ่ายของร้านค้าได้ในระยะยาว</hilight>',
    icon: ReceiptText,
  },
]
