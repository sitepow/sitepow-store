import {
  IconBox,
  IconBuildingStore,
  IconChartBar,
  IconClipboardList,
  IconCreditCard,
  IconHandClick,
  IconMessage2,
  IconPalette,
  IconPercentage,
  IconShare,
  IconSparkles,
  IconTicket,
  IconTruckDelivery,
  IconUsers,
  IconWorld,
} from '@tabler/icons-react'

export const NAVBAR_ITEMS = [
  {
    title: 'สิ่งที่จะได้จากการเปิดร้านค้า',
    href: '/features',
    children: [
      {
        title: 'AI อัจฉริยะช่วยลงของ',
        href: '/features/ai-content',
        description:
          'แค่ลงรูป AI ช่วยตั้งชื่อและเขียนคำบรรยายสินค้าภาษาไทยที่ปิดการขายได้ทันที',
        icon: <IconSparkles size={20} stroke={1.5} />,
        image: '/',
      },
      {
        title: 'ขายฟรี 0% GP',
        href: '/features/no-gp',
        description:
          'รับกำไรเต็มเม็ดเต็มหน่วย ไม่มีการหักค่าธรรมเนียมรายชิ้นเหมือน Marketplace',
        icon: <IconPercentage size={20} stroke={1.5} />,
        image: '/',
      },
      {
        title: 'ระบบจัดการสต็อก',
        href: '/features/inventory',
        description: 'จัดการสินค้าได้ง่ายๆ ในที่เดียว',
        icon: <IconBox size={20} stroke={1.5} />,
        image: '/',
      },
      {
        title: 'หน้าร้านออนไลน์',
        href: '/features/storefront',
        description:
          'เว็บไซต์ขายสินค้าส่วนตัว รองรับการจ่ายเงินและคำนวณค่าส่งอัตโนมัติ',
        icon: <IconBuildingStore size={20} stroke={1.5} />,
        image: '/',
      },
      {
        title: 'ระบบจัดการออเดอร์',
        href: '/features/order-management',
        description:
          'รวมออเดอร์จากทุกช่องทาง ไว้ที่เดียว พิมพ์ใบปะหน้าได้ทันที',
        icon: <IconClipboardList size={20} stroke={1.5} />,
        image: '/',
      },
      {
        title: 'วิเคราะห์ยอดขายเชิงลึก',
        href: '/features/analytics',
        description:
          'สรุปรายได้ กำไร และสินค้าขายดีผ่าน Dashboard ที่เข้าใจง่ายที่สุด',
        icon: <IconChartBar size={20} stroke={1.5} />,
        image: '/',
      },
      {
        title: 'ระบบชำระเงินครบวงจร',
        href: '/features/payments',
        description:
          'รองรับโอนเงิน, บัตรเครดิต, และ PromptPay พร้อมระบบยืนยันสลิปอัตโนมัติ',
        icon: <IconCreditCard size={20} stroke={1.5} />,
        image: '/',
      },
      {
        title: 'ระบบสมาชิก & CRM',
        href: '/features/crm',
        description:
          'สะสมแต้ม จัดกลุ่มลูกค้า และทำโปรโมชั่นเฉพาะบุคคล เพื่อกระตุ้นการซื้อซ้ำ',
        icon: <IconUsers size={20} stroke={1.5} />,
        image: '/',
      },
      {
        title: 'คูปองและโปรโมชั่น',
        href: '/features/promotions',
        description:
          'สร้างโค้ดส่วนลด ซื้อ 1 แถม 1 หรือจัด Flash Sale ได้เองตามใจชอบ',
        icon: <IconTicket size={20} stroke={1.5} />,
        image: '/',
      },
      {
        title: 'ระบบจัดการตัวแทน',
        href: '/features/affiliate',
        description: 'เพิ่มยอดขายด้วยระบบตัวแทนจำหน่าย พร้อมระบบคำนวณคอมมิชชัน',
        icon: <IconHandClick size={20} stroke={1.5} />,
        image: '/',
      },
      {
        title: 'เชื่อมต่อแชท',
        href: '/features/chat',
        description:
          'ปิดการขายได้ไวกว่าเดิมด้วยระบบตอบกลับอัตโนมัติและระบบรับออเดอร์ในแชท',
        icon: <IconMessage2 size={20} stroke={1.5} />,
        image: '/',
      },
      {
        title: 'ปรับแต่งดีไซน์ตามใจชอบ',
        href: '/features/customization',
        description:
          'เปลี่ยนธีม ปรับโทนสี และจัดวางเลย์เอาต์หน้าร้านให้เป็นเอกลักษณ์ในสไตล์คุณ',
        icon: <IconPalette size={20} stroke={1.5} />,
        image: '/',
      },
      {
        title: 'รองรับการขายทั่วโลก',
        href: '/features/multi-currency',
        description:
          'รับชำระเงินได้กว่า 135+ สกุลเงินทั่วโลก พร้อมระบบแปลงค่าเงินอัตโนมัติผ่าน GB Prime Pay',
        icon: <IconWorld size={20} stroke={1.5} />,
        image: '/',
      },
      {
        title: 'เชื่อมต่อ Marketplace',
        href: '/features/marketplace-integration',
        description:
          'ซิงค์สต็อกและสินค้ากับ Shopee และ Lazada แบบ Real-time ไม่ต้องลงของซ้ำซ้อน',
        icon: <IconShare size={20} stroke={1.5} />,
        image: '/',
      },
      {
        title: 'จัดการขนส่งอัตโนมัติ',
        href: '/features/logistics',
        description:
          'เชื่อมต่อ Flash, J&T และไปรษณีย์ไทย เรียกพัสดุและแจ้งเลข Tracking อัตโนมัติ',
        icon: <IconTruckDelivery size={20} stroke={1.5} />,
        image: '/',
      },
    ],
  },
  { title: 'ราคา', href: '/pricing' },
  { title: 'ติดต่อเรา', href: '/contact' },
]
