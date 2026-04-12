import {
  BarChart3,
  Box,
  ClipboardList,
  CreditCard,
  Handshake,
  MessageSquareText,
  Store,
  TicketPercent,
  Users,
} from 'lucide-react'

export const NAVBAR_ITEMS = [
  {
    title: 'สิ่งที่จะได้จากการเปิดร้านค้า',
    href: '/features',
    children: [
      {
        title: 'ระบบจัดการสต็อก',
        href: '/features/inventory',
        description: 'จัดการสินค้าได้ง่ายๆ ในที่เดียว',
        icon: <Box size={20} />,
        image: '/no-image.png',
      },
      {
        title: 'หน้าร้านออนไลน์',
        href: '/features/storefront',
        description:
          'เว็บไซต์ขายสินค้าส่วนตัว รองรับการจ่ายเงินและคำนวณค่าส่งอัตโนมัติ',
        icon: <Store size={20} />,
        image: '/no-image.png',
      },
      {
        title: 'ระบบจัดการออเดอร์',
        href: '/features/order-management',
        description:
          'รวมออเดอร์จากทุก Platform ไว้ที่เดียว พิมพ์ใบปะหน้าได้ทันที',
        icon: <ClipboardList size={20} />,
        image: '/no-image.png',
      },
      {
        title: 'วิเคราะห์ยอดขายเชิงลึก',
        href: '/features/analytics',
        description:
          'สรุปรายได้ กำไร และสินค้าขายดีผ่าน Dashboard ที่เข้าใจง่ายที่สุด',
        icon: <BarChart3 size={20} />,
        image: '/no-image.png',
      },
      {
        title: 'ระบบชำระเงินครบวงจร',
        href: '/features/payments',
        description:
          'รองรับโอนเงิน, บัตรเครดิต, และ PromptPay พร้อมระบบยืนยันสลิปอัตโนมัติ',
        icon: <CreditCard size={20} />,
        image: '/no-image.png',
      },
      {
        title: 'ระบบสมาชิก & CRM',
        href: '/features/crm',
        description:
          'สะสมแต้ม จัดกลุ่มลูกค้า และทำโปรโมชั่นเฉพาะบุคคล เพื่อกระตุ้นการซื้อซ้ำ',
        icon: <Users size={20} />,
        image: '/no-image.png',
      },
      {
        title: 'คูปองและโปรโมชั่น',
        href: '/features/promotions',
        description:
          'สร้างโค้ดส่วนลด ซื้อ 1 แถม 1 หรือจัด Flash Sale ได้เองตามใจชอบ',
        icon: <TicketPercent size={20} />,
        image: '/no-image.png',
      },
      {
        title: 'ระบบจัดการตัวแทน',
        href: '/features/affiliate',
        description:
          'เพิ่มยอดขายด้วยระบบตัวแทนจำหน่าย (Dropship) พร้อมระบบคำนวณคอมมิชชัน',
        icon: <Handshake size={20} />,
        image: '/no-image.png',
      },
      {
        title: 'เชื่อมต่อแชท',
        href: '/features/chat',
        description:
          'ปิดการขายได้ไวกว่าเดิมด้วยระบบตอบกลับอัตโนมัติและระบบรับออเดอร์ในแชท',
        icon: <MessageSquareText size={20} />,
        image: '/no-image.png',
      },
    ],
  },
  { title: 'ราคา', href: '/pricing' },
  { title: 'ติดต่อเรา', href: '/contact' },
]
