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
    title: 'เงินเข้าบัญชีร้านค้าโดยตรง',
    description:
      'รับเงินจากลูกค้าเข้าบัญชีคุณทันที ไม่ต้องรอระบบ Marketplace ตรวจสอบหรือถือเงินไว้นานหลายวัน',
    icon: <IconWallet size={28} stroke={1.5} />,
  },
  {
    title: 'ระบบตรวจสอบสลิปอัตโนมัติ',
    description:
      'มั่นใจด้วย Easy Slip เช็คสลิปโอนเงินผ่าน QR Code ทันที ป้องกันสลิปปลอมและยอดเงินไม่ตรงแบบ 100%',
    icon: <IconCircleCheck size={28} stroke={1.5} />,
  },
  {
    title: 'จ่ายผ่าน Mobile Banking แบบไร้รอยต่อ',
    description:
      'รองรับการจ่ายเงินผ่านแอปธนาคารชั้นนำ และ PromptPay ช่วยให้ลูกค้าตัดสินใจซื้อและโอนไวกว่าเดิม',
    icon: <IconDeviceMobile size={28} stroke={1.5} />,
  },
  {
    title: 'รองรับบัตรเครดิตและเดบิต (GB Prime Pay)',
    description:
      'เพิ่มโอกาสการขายด้วยการรับชำระผ่านบัตรเครดิตและผ่อนชำระ ภายใต้มาตรฐานความปลอดภัยระดับสากล',
    icon: <IconCreditCard size={28} stroke={1.5} />,
  },
  {
    title: 'ประหยัดต้นทุน 0% GP',
    description:
      'ไม่มีการหักค่าธรรมเนียมรายชิ้นเหมือนแอปส้ม/ฟ้า ช่วยให้ร้านค้าได้รับกำไรเต็มเม็ดเต็มหน่วยทุกออเดอร์',
    icon: <IconReceipt2 size={28} stroke={1.5} />,
  },
  {
    title: 'ถอนเงินได้ทุกวัน ไม่มีขั้นต่ำ',
    description:
      'อิสระทางการเงินที่เหนือกว่า ไม่ต้องรอรอบจ่ายเงินรายสัปดาห์ อยากใช้เงินเมื่อไหร่ถอนจากระบบ Payment ได้ทันที',
    icon: <IconCashBanknote size={28} stroke={1.5} />,
  },
] as PaymentFeature[]
