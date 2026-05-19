import {
  IconBuildingStore,
  IconCoin,
  IconCreditCard,
  IconHeart,
  IconHierarchy2,
  IconHistory,
  IconLayoutDashboard,
  IconMapPin,
  IconPackage,
  IconSettings,
  IconSparkles,
  IconTicket,
  IconUser,
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
    label: 'ข้อมูลร้านค้า',
    tab: 'store',
    icon: IconBuildingStore,
    items: [
      {
        value: 'store-info',
        label: 'ข้อมูลทั่วไปของร้าน',
        url: '/merchant/store-settings',
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
      {
        value: 'categories',
        label: 'หมวดหมู่สินค้า',
        url: '/merchant/store-settings/categories',
      },
      {
        value: 'stocks',
        label: 'เช็คสต็อก/คลังสินค้า',
        url: '/merchant/store-settings/stocks',
      },
      {
        value: 'orders',
        label: 'รายการคำสั่งซื้อ',
        url: '/merchant/store-settings/orders',
      },
      {
        value: 'blogs',
        label: 'บทความ / Blog',
        url: '/merchant/store-settings/blogs',
      },
    ],
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
