import {
  IconBox,
  IconBuildingStore,
  IconChartBar,
  IconClipboardList,
  IconCreditCard,
  IconDatabaseImport,
  IconPercentage,
  IconSparkles,
  IconTicket,
  IconTruckDelivery,
  IconUsers,
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
      },
      {
        title: 'ขายฟรี 0% GP',
        href: '/features/no-gp',
        description:
          'รับกำไรเต็มเม็ดเต็มหน่วย ไม่มีการหักค่าธรรมเนียมรายชิ้นเหมือน Marketplace',
        icon: <IconPercentage size={20} stroke={1.5} />,
      },
      {
        title: 'ระบบจัดการสต็อก',
        href: '/features/inventory',
        description: 'จัดการสินค้าได้ง่ายๆ ในที่เดียว',
        icon: <IconBox size={20} stroke={1.5} />,
      },
      {
        title: 'หน้าร้านออนไลน์',
        href: '/features/storefront',
        description:
          'เว็บไซต์ขายสินค้าส่วนตัว รองรับการจ่ายเงินและคำนวณค่าส่งอัตโนมัติ',
        icon: <IconBuildingStore size={20} stroke={1.5} />,
      },
      {
        title: 'ระบบจัดการออเดอร์',
        href: '/features/order-management',
        description:
          'รวมออเดอร์จากทุกช่องทาง ไว้ที่เดียว พิมพ์ใบปะหน้าได้ทันที',
        icon: <IconClipboardList size={20} stroke={1.5} />,
      },
      {
        title: 'วิเคราะห์ยอดขายเชิงลึก',
        href: '/features/analytics',
        description:
          'สรุปรายได้ กำไร และสินค้าขายดีผ่าน Dashboard ที่เข้าใจง่ายที่สุด',
        icon: <IconChartBar size={20} stroke={1.5} />,
      },
      {
        title: 'ระบบรับชำระเงินหลายรูปแบบ',
        href: '/features/payments',
        description:
          'รองรับทั้งการโอนเงินผ่านบัญชี และระบบยืนยันสลิปอัตโนมัติ ไม่ต้องมานั่งเช็คยอดเองให้เสียเวลา',
        icon: <IconCreditCard size={20} stroke={1.5} />,
      },
      {
        title: 'ระบบสมาชิก & CRM',
        href: '/features/crm',
        description:
          'สะสมแต้ม จัดกลุ่มลูกค้า และทำโปรโมชั่นเฉพาะบุคคล เพื่อกระตุ้นการซื้อซ้ำ',
        icon: <IconUsers size={20} stroke={1.5} />,
      },
      {
        title: 'คูปองและโปรโมชั่น',
        href: '/features/promotions',
        description:
          'สร้างโค้ดส่วนลด ซื้อ 1 แถม 1 หรือจัด Flash Sale ได้เองตามใจชอบ',
        icon: <IconTicket size={20} stroke={1.5} />,
      },
      {
        title: 'จัดการข้อมูลสินค้าอย่างรวดเร็ว',
        href: '/features/data-management',
        description:
          'รองรับการนำเข้าและส่งออกข้อมูลสินค้าผ่าน CSV/JSON ช่วยให้คุณลงสินค้าจำนวนมากจาก Lazada/Shopee ได้ในไม่กี่นาที',
        icon: <IconDatabaseImport size={20} stroke={1.5} />,
      },
      {
        title: 'จัดการการจัดส่ง',
        href: '/features/logistics',
        description:
          'จัดการสถานะพัสดุ รองรับการกรอกเลข Tracking และส่งแจ้งเตือนให้ลูกค้าผ่านอีเมล/แชท',
        icon: <IconTruckDelivery size={20} stroke={1.5} />,
      },
      {
        title: 'ระบบพิมพ์ใบปะหน้าพัสดุ',
        href: '/features/shipping-labels',
        description:
          'พิมพ์ใบปะหน้าพร้อมรายการสินค้าได้ทันที รองรับเครื่องพิมพ์ความร้อน ช่วยให้แพ็คของไวและไม่ส่งผิดคน',
        icon: <IconClipboardList size={20} stroke={1.5} />,
      },
    ],
  },
  { title: 'ราคา', href: '/pricing' },
  { title: 'ติดต่อเรา', href: '/contact' },
]
