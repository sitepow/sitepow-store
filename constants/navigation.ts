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
    hasSeparatorBefore: true,
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
        label: 'รายการสินค้าทั้งหมด',
        url: '/merchant/store-settings/products',
      },
      {
        value: 'product-create',
        label: 'เพิ่มสินค้าใหม่',
        url: '/merchant/store-settings/products/create',
      },
    ],
  },
  {
    value: 'orders',
    label: 'จัดการออเดอร์',
    tab: 'orders',
    icon: IconShoppingCart,
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
  },
  {
    value: 'transactions',
    label: 'รายการเงิน',
    tab: 'transactions',
    icon: IconWallet,
  },
  {
    value: 'support',
    label: 'ติดต่อลูกค้า',
    tab: 'support',
    icon: IconHeadset,
  },
  {
    value: 'blog',
    label: 'บทความ / Blog',
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
