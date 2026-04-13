import {
  BarChart3Icon,
  BoxIcon,
  ClipboardListIcon,
  CreditCardIcon,
  GlobeIcon,
  HandshakeIcon,
  MessageSquareTextIcon,
  PaletteIcon,
  StoreIcon,
  TicketPercentIcon,
  UsersIcon,
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
        icon: <BoxIcon />,
        image: '/',
      },
      {
        title: 'หน้าร้านออนไลน์',
        href: '/features/storefront',
        description:
          'เว็บไซต์ขายสินค้าส่วนตัว รองรับการจ่ายเงินและคำนวณค่าส่งอัตโนมัติ',
        icon: <StoreIcon />,
        image: '/',
      },
      {
        title: 'ระบบจัดการออเดอร์',
        href: '/features/order-management',
        description:
          'รวมออเดอร์จากทุกช่องทาง ไว้ที่เดียว พิมพ์ใบปะหน้าได้ทันที',
        icon: <ClipboardListIcon />,
        image: '/',
      },
      {
        title: 'วิเคราะห์ยอดขายเชิงลึก',
        href: '/features/analytics',
        description:
          'สรุปรายได้ กำไร และสินค้าขายดีผ่าน Dashboard ที่เข้าใจง่ายที่สุด',
        icon: <BarChart3Icon />,
        image: '/',
      },
      {
        title: 'ระบบชำระเงินครบวงจร',
        href: '/features/payments',
        description:
          'รองรับโอนเงิน, บัตรเครดิต, และ PromptPay พร้อมระบบยืนยันสลิปอัตโนมัติ',
        icon: <CreditCardIcon />,
        image: '/',
      },
      {
        title: 'ระบบสมาชิก & CRM',
        href: '/features/crm',
        description:
          'สะสมแต้ม จัดกลุ่มลูกค้า และทำโปรโมชั่นเฉพาะบุคคล เพื่อกระตุ้นการซื้อซ้ำ',
        icon: <UsersIcon />,
        image: '/',
      },
      {
        title: 'คูปองและโปรโมชั่น',
        href: '/features/promotions',
        description:
          'สร้างโค้ดส่วนลด ซื้อ 1 แถม 1 หรือจัด Flash Sale ได้เองตามใจชอบ',
        icon: <TicketPercentIcon />,
        image: '/',
      },
      {
        title: 'ระบบจัดการตัวแทน',
        href: '/features/affiliate',
        description: 'เพิ่มยอดขายด้วยระบบตัวแทนจำหน่าย พร้อมระบบคำนวณคอมมิชชัน',
        icon: <HandshakeIcon />,
        image: '/',
      },
      {
        title: 'เชื่อมต่อแชท',
        href: '/features/chat',
        description:
          'ปิดการขายได้ไวกว่าเดิมด้วยระบบตอบกลับอัตโนมัติและระบบรับออเดอร์ในแชท',
        icon: <MessageSquareTextIcon />,
        image: '/',
      },
      {
        title: 'ปรับแต่งดีไซน์ตามใจชอบ',
        href: '/features/customization',
        description:
          'เปลี่ยนธีม ปรับโทนสี และจัดวางเลย์เอาต์หน้าร้านให้เป็นเอกลักษณ์ในสไตล์คุณ',
        icon: <PaletteIcon />,
        image: '/',
      },
      {
        title: 'รองรับการขายทั่วโลก',
        href: '/features/multi-currency',
        description:
          'รับชำระเงินได้กว่า 135+ สกุลเงินทั่วโลก พร้อมระบบแปลงค่าเงินอัตโนมัติผ่าน Stripe',
        icon: <GlobeIcon />,
        image: '/',
      },
    ],
  },
  { title: 'ราคา', href: '/pricing' },
  { title: 'ติดต่อเรา', href: '/contact' },
]
