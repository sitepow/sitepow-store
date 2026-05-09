import type { ReactNode } from 'react'

import {
  IconCashBanknote,
  IconCircleCheck,
  IconCreditCard,
  IconDeviceMobile,
  IconReceipt2,
  IconWallet,
} from '@tabler/icons-react'

export interface PaymentFeature {
  title: string
  description: string
  icon: ReactNode
}

export const PAYMENTS_FEATURES = [
  {
    title: 'รับเงินเข้าบัญชีคุณโดยตรง',
    description:
      'อิสระที่สุด! เงินจากลูกค้าโอนเข้าบัญชีธนาคารของคุณทันที ไม่ต้องรอระบบ Marketplace ถือเงินไว้นานหลายวัน',
    icon: <IconWallet size={28} stroke={1.5} />,
  },
  {
    title: 'ระบบเช็คสลิปอัตโนมัติ (Easy Slip)',
    description:
      'ตรวจสอบสลิปโอนเงินผ่าน QR Code ได้ทันที ป้องกันสลิปปลอมและยอดไม่ตรง ช่วยให้คุณปิดออเดอร์ได้แม้ตอนนอนหลับ',
    icon: <IconCircleCheck size={28} stroke={1.5} />,
  },
  {
    title: 'รองรับ PromptPay และทุกธนาคาร',
    description:
      'แสดง QR Code พร้อมยอดเงินที่ถูกต้องให้ลูกค้าสแกนจ่ายได้ง่ายๆ ผ่าน Mobile Banking เพิ่มโอกาสปิดการขายได้ไวขึ้น',
    icon: <IconDeviceMobile size={28} stroke={1.5} />,
  },
  {
    title: 'อัปเกรดรับบัตรเครดิตได้ (Optional)',
    description:
      'หากธุรกิจขยายตัว สามารถเชื่อมต่อ GB Prime Pay เพื่อรับบัตรเครดิตและระบบผ่อนชำระได้ (มีขั้นตอนการตรวจสอบเอกสารจากผู้ให้บริการ)',
    icon: <IconCreditCard size={28} stroke={1.5} />,
  },
  {
    title: 'ประหยัดต้นทุน 0% GP',
    description:
      'รับกำไรไปเต็มๆ เพราะเราไม่มีการหักค่าธรรมเนียมส่วนแบ่งยอดขาย ช่วยให้ร้านค้ามีกระแสเงินสดที่ดีกว่า',
    icon: <IconReceipt2 size={28} stroke={1.5} />,
  },
  {
    title: 'กระแสเงินสดหมุนเวียนคล่องตัว',
    description:
      'เมื่อลูกค้าโอนผ่านบัญชีธนาคารโดยตรง คุณก็สามารถนำเงินไปใช้หมุนเวียนธุรกิจหรือซื้อของเข้าร้านได้ทันที ไม่ต้องรอรอบจ่าย',
    icon: <IconCashBanknote size={28} stroke={1.5} />,
  },
] as PaymentFeature[]
