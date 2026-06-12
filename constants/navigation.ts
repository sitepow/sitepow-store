import {
  IconBox,
  IconBuildingStore,
  IconChartBar,
  IconCoin,
  IconCreditCard,
  IconHeadset,
  IconHeart,
  IconHierarchy2,
  IconHistory,
  IconLayoutDashboard,
  IconMapPin,
  IconMessageCircle,
  IconNews,
  IconPackage,
  IconSettings,
  IconShoppingCart,
  IconSparkles,
  IconStar,
  IconTicket,
  IconUser,
  IconUsers,
  IconWallet,
  TablerIcon,
} from '@tabler/icons-react'

export interface NavigationItem {
  value: string
  label: string
  tab: string
  icon: TablerIcon
  hasSeparatorBefore?: boolean
  items?: {
    value: string
    label: string
    url: string
  }[]
}

export const BUYER_NAVIGATION: NavigationItem[] = [
  {
    value: 'dashboard',
    label: 'แดชบอร์ด',
    tab: 'dashboard',
    icon: IconLayoutDashboard,
  },
  {
    value: 'orders',
    label: 'การซื้อของฉัน',
    tab: 'orders',
    icon: IconPackage,
  },
  {
    value: 'profile',
    label: 'โปรไฟล์ส่วนตัว',
    tab: 'profile',
    icon: IconUser,
  },
  {
    value: 'addresses',
    label: 'ที่อยู่จัดส่ง',
    tab: 'addresses',
    icon: IconMapPin,
  },
  {
    value: 'billing',
    label: 'กระเป๋าเงิน / ช่องทางชำระเงิน',
    tab: 'billing',
    icon: IconWallet,
    hasSeparatorBefore: true,
  },
  {
    value: 'rewards',
    label: 'แต้มสะสมของฉัน',
    tab: 'rewards',
    icon: IconCoin,
  },
  {
    value: 'vouchers',
    label: 'โค้ดส่วนลดของฉัน',
    tab: 'vouchers',
    icon: IconTicket,
  },
  {
    value: 'wishlist',
    label: 'สินค้าที่ถูกใจ',
    tab: 'wishlist',
    icon: IconHeart,
  },
  {
    value: 'reviews',
    label: 'รีวิวของฉัน',
    tab: 'reviews',
    icon: IconStar,
    hasSeparatorBefore: true,
    items: [
      {
        value: 'reviews-all',
        label: 'รีวิวทั้งหมด',
        url: '/account/reviews',
      },
      {
        value: 'reviews-pending',
        label: 'รอรีวิว',
        url: '/account/reviews?status=pending',
      },
    ],
  },
  {
    value: 'support',
    label: 'ติดต่อร้านค้า',
    tab: 'support',
    icon: IconMessageCircle,
    items: [
      {
        value: 'support-tickets',
        label: 'Ticket ทั้งหมด',
        url: '/account/support',
      },
      {
        value: 'support-open',
        label: 'รอการตอบกลับ',
        url: '/account/support?status=open',
      },
      {
        value: 'support-resolved',
        label: 'แก้ไขแล้ว',
        url: '/account/support?status=resolved',
      },
    ],
  },
  {
    value: 'settings',
    label: 'ตั้งค่าบัญชี',
    tab: 'settings',
    icon: IconSettings,
  },
]

export const MERCHANT_NAVIGATION: NavigationItem[] = [
  {
    value: 'dashboard',
    label: 'แดชบอร์ด',
    tab: 'dashboard',
    icon: IconLayoutDashboard,
  },
  {
    value: 'profile',
    label: 'โปรไฟล์ส่วนตัว',
    tab: 'profile',
    icon: IconUser,
  },
  {
    value: 'store-settings',
    label: 'จัดการร้านค้า',
    tab: 'store',
    icon: IconBuildingStore,
    items: [
      {
        value: 'store-info',
        label: 'ร้านค้าของคุณ',
        url: '/merchant/store-settings',
      },
      {
        value: 'store-categories',
        label: 'หมวดหมู่สินค้า',
        url: '/merchant/store-settings/categories',
      },
      {
        value: 'products',
        label: 'สินค้าทั้งหมด',
        url: '/merchant/store-settings/products',
      },
    ],
  },
  {
    value: 'orders',
    label: 'จัดการออเดอร์',
    tab: 'orders',
    icon: IconShoppingCart,
    items: [
      { value: 'orders-all', label: 'ทั้งหมด', url: '/merchant/orders' },
      {
        value: 'orders-pending',
        label: 'รอชำระ',
        url: '/merchant/orders?status=PENDING',
      },
      {
        value: 'orders-paid',
        label: 'ชำระแล้ว',
        url: '/merchant/orders?status=PAID',
      },
      {
        value: 'orders-shipped',
        label: 'จัดส่งแล้ว',
        url: '/merchant/orders?status=SHIPPED',
      },
      {
        value: 'orders-completed',
        label: 'สำเร็จ',
        url: '/merchant/orders?status=COMPLETED',
      },
      {
        value: 'orders-cancelled',
        label: 'ยกเลิก',
        url: '/merchant/orders?status=CANCELLED',
      },
    ],
  },
  {
    value: 'inventory',
    label: 'คลังสินค้า',
    tab: 'inventory',
    icon: IconBox,
  },
  {
    value: 'staff',
    label: 'จัดการพนักงาน',
    tab: 'staff',
    icon: IconUsers,
  },
  {
    value: 'customers',
    label: 'ข้อมูลลูกค้า',
    tab: 'customers',
    icon: IconChartBar,
  },
  {
    value: 'billing-subscription',
    label: 'การสมัครสมาชิก',
    tab: 'billing',
    icon: IconCreditCard,
    hasSeparatorBefore: true,
  },
  {
    value: 'ai-usage',
    label: 'เครดิต AI (Vision/Search)',
    tab: 'ai',
    icon: IconSparkles,
  },
  {
    value: 'loyalty',
    label: 'ระบบแต้มสะสม',
    tab: 'loyalty',
    icon: IconCoin,
  },
  {
    value: 'marketing-coupons',
    label: 'คูปองส่วนลด',
    tab: 'coupons',
    icon: IconTicket,
    items: [
      {
        value: 'coupons-all',
        label: 'ทั้งหมด',
        url: '/merchant/marketing-coupons',
      },
      {
        value: 'coupons-active',
        label: 'ใช้งานได้',
        url: '/merchant/marketing-coupons?status=active',
      },
      {
        value: 'coupons-expired',
        label: 'หมดอายุ',
        url: '/merchant/marketing-coupons?status=expired',
      },
    ],
  },
  {
    value: 'transactions',
    label: 'รายการเงิน',
    tab: 'transactions',
    icon: IconWallet,
    items: [
      {
        value: 'transactions-all',
        label: 'ทั้งหมด',
        url: '/merchant/transactions',
      },
      {
        value: 'transactions-deposit',
        label: 'เติมเงิน',
        url: '/merchant/transactions?type=DEPOSIT',
      },
      {
        value: 'transactions-withdraw',
        label: 'ถอนเงิน',
        url: '/merchant/transactions?type=WITHDRAW',
      },
      {
        value: 'transactions-shipping',
        label: 'ค่าส่ง',
        url: '/merchant/transactions?type=SHIPPING_FEE',
      },
      {
        value: 'transactions-refund',
        label: 'คืนเงิน',
        url: '/merchant/transactions?type=REFUND',
      },
    ],
  },
  {
    value: 'support',
    label: 'ติดต่อลูกค้า',
    tab: 'support',
    icon: IconHeadset,
    items: [
      { value: 'support-all', label: 'ทั้งหมด', url: '/merchant/support' },
      {
        value: 'support-open',
        label: 'เปิด',
        url: '/merchant/support?status=OPEN',
      },
      {
        value: 'support-in-progress',
        label: 'กำลังดำเนินการ',
        url: '/merchant/support?status=IN_PROGRESS',
      },
      {
        value: 'support-resolved',
        label: 'แก้ไขแล้ว',
        url: '/merchant/support?status=RESOLVED',
      },
      {
        value: 'support-closed',
        label: 'ปิดแล้ว',
        url: '/merchant/support?status=CLOSED',
      },
    ],
  },
  {
    value: 'blog',
    label: 'บทความ',
    tab: 'blog',
    icon: IconNews,
  },
  {
    value: 'organization-branches',
    label: 'จัดการสาขา',
    tab: 'branches',
    icon: IconHierarchy2,
    hasSeparatorBefore: true,
  },
  {
    value: 'audit-logs',
    label: 'ประวัติกิจกรรม',
    tab: 'audit-logs',
    icon: IconHistory,
  },
  {
    value: 'settings',
    label: 'ตั้งค่าระบบ',
    tab: 'settings',
    icon: IconSettings,
  },
]
