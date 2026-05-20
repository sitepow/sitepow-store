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
        href: '/',
        description:
          'แค่ลงรูป AI ช่วยตั้งชื่อและเขียนคำบรรยายสินค้าภาษาไทยที่ปิดการขายได้ทันที',
        icon: IconSparkles,
      },
      {
        title: 'ขายฟรี 0% GP',
        href: '/',
        description:
          'รับกำไรเต็มเม็ดเต็มหน่วย ไม่มีการหักค่าธรรมเนียมรายชิ้นเหมือน Marketplace',
        icon: IconPercentage,
      },
      {
        title: 'ระบบจัดการสต็อก',
        href: '/',
        description: 'จัดการสินค้าได้ง่ายๆ ในที่เดียว',
        icon: IconBox,
      },
      {
        title: 'หน้าร้านออนไลน์',
        href: '/',
        description:
          'เว็บไซต์ขายสินค้าส่วนตัว รองรับการจ่ายเงินและคำนวณค่าส่งอัตโนมัติ',
        icon: IconBuildingStore,
      },
      {
        title: 'ระบบจัดการออเดอร์',
        href: '/',
        description:
          'รวมออเดอร์จากทุกช่องทาง ไว้ที่เดียว พิมพ์ใบปะหน้าได้ทันที',
        icon: IconClipboardList,
      },
      {
        title: 'วิเคราะห์ยอดขายเชิงลึก',
        href: '/',
        description:
          'สรุปรายได้ กำไร และสินค้าขายดีผ่าน Dashboard ที่เข้าใจง่ายที่สุด',
        icon: IconChartBar,
      },
      {
        title: 'ระบบรับชำระเงินหลายรูปแบบ',
        href: '/',
        description:
          'รองรับทั้งการโอนเงินผ่านบัญชี และระบบยืนยันสลิปอัตโนมัติ ไม่ต้องมานั่งเช็คยอดเองให้เสียเวลา',
        icon: IconCreditCard,
      },
      {
        title: 'ระบบสมาชิก & CRM',
        href: '/',
        description:
          'สะสมแต้ม จัดกลุ่มลูกค้า และทำโปรโมชั่นเฉพาะบุคคล เพื่อกระตุ้นการซื้อซ้ำ',
        icon: IconUsers,
      },
      {
        title: 'คูปองและโปรโมชั่น',
        href: '/',
        description:
          'สร้างโค้ดส่วนลด ซื้อ 1 แถม 1 หรือจัด Flash Sale ได้เองตามใจชอบ',
        icon: IconTicket,
      },
      {
        title: 'จัดการข้อมูลสินค้าอย่างรวดเร็ว',
        href: '/',
        description:
          'รองรับการนำเข้าและส่งออกข้อมูลสินค้าผ่าน CSV/JSON ช่วยให้คุณลงสินค้าจำนวนมากจาก Lazada/Shopee ได้ในไม่กี่นาที',
        icon: IconDatabaseImport,
      },
      {
        title: 'จัดการการจัดส่ง',
        href: '/',
        description:
          'จัดการสถานะพัสดุ รองรับการกรอกเลข Tracking และส่งแจ้งเตือนให้ลูกค้าผ่านอีเมล/แชท',
        icon: IconTruckDelivery,
      },
      {
        title: 'ระบบพิมพ์ใบปะหน้าพัสดุ',
        href: '/',
        description:
          'พิมพ์ใบปะหน้าพร้อมรายการสินค้าได้ทันที รองรับเครื่องพิมพ์ความร้อน ช่วยให้แพ็คของไวและไม่ส่งผิดคน',
        icon: IconClipboardList,
      },
    ],
  },
  { title: 'ราคา', href: '/pricing' },
  { title: 'ติดต่อเรา', href: '/contact' },
]
