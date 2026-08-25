import {
  IconBox,
  IconBuildingStore,
  IconCashRegister,
  IconChartBar,
  IconCoin,
  IconCreditCard,
  IconHierarchy2,
  IconHistory,
  IconLayoutDashboard,
  IconMapPin,
  IconNews,
  IconPackage,
  IconReceipt,
  IconSettings,
  IconShoppingCart,
  IconStar,
  IconTicket,
  IconUser,
  IconUserCheck,
  IconUserCog,
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

export const SUPPORT_NAVIGATION: NavigationItem[] = []

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
    value: 'reviews',
    label: 'รีวิวของฉัน',
    tab: 'reviews',
    icon: IconStar,
  },
  {
    value: 'profile',
    label: 'โปรไฟล์ส่วนตัว',
    tab: 'profile',
    icon: IconUser,
    hasSeparatorBefore: true,
    groupLabel: 'บัญชีและการตั้งค่า',
  },
  {
    value: 'addresses',
    label: 'ที่อยู่จัดส่ง',
    tab: 'addresses',
    icon: IconMapPin,
  },
  {
    value: 'settings',
    label: 'ตั้งค่าบัญชี',
    tab: 'settings',
    icon: IconSettings,
  },
]

export interface NavigationItem {
  value: string
  label: string
  tab: string
  icon: TablerIcon
  hasSeparatorBefore?: boolean
  groupLabel?: string
  items?: {
    value: string
    label: string
    url: string
  }[]
}

export const MERCHANT_NAVIGATION: NavigationItem[] = [
  {
    value: 'dashboard',
    label: 'แดชบอร์ด',
    tab: 'dashboard',
    icon: IconLayoutDashboard,
  },
  {
    value: 'analytics',
    label: 'รายงานวิเคราะห์',
    tab: 'analytics',
    icon: IconChartBar,
  },
  {
    value: 'pos',
    label: 'แคชเชียร์',
    tab: 'pos',
    icon: IconCashRegister,
  },
  {
    value: 'orders',
    label: 'จัดการออเดอร์',
    tab: 'orders',
    icon: IconShoppingCart,
  },
  {
    value: 'store-settings/products',
    label: 'จัดการสินค้า',
    tab: 'store-settings/products',
    icon: IconPackage,
    hasSeparatorBefore: true,
    groupLabel: 'สินค้าและคลังสินค้า',
  },
  {
    value: 'store-settings/categories',
    label: 'หมวดหมู่สินค้า',
    tab: 'store-settings/categories',
    icon: IconBox,
  },
  {
    value: 'inventory',
    label: 'คลังสินค้า',
    tab: 'inventory',
    icon: IconBox,
  },
  {
    value: 'expenses',
    label: 'จัดการค่าใช้จ่าย',
    tab: 'expenses',
    icon: IconReceipt,
    hasSeparatorBefore: true,
    groupLabel: 'การจัดการและบุคลากร',
  },
  {
    value: 'reseller',
    label: 'ตัวแทนฝากขาย',
    tab: 'reseller',
    icon: IconBuildingStore,
  },
  {
    value: 'customers',
    label: 'จัดการลูกค้า',
    tab: 'customers',
    icon: IconUserCheck,
  },
  {
    value: 'employee',
    label: 'จัดการพนักงาน',
    tab: 'employee',
    icon: IconUserCog,
  },
  {
    value: 'reviews',
    label: 'จัดการรีวิว',
    tab: 'reviews',
    icon: IconStar,
  },
  {
    value: 'marketing-coupons',
    label: 'คูปองส่วนลด',
    tab: 'coupons',
    icon: IconTicket,
    hasSeparatorBefore: true,
    groupLabel: 'การตลาดและโปรโมชัน',
  },
  {
    value: 'loyalty',
    label: 'ระบบแต้มสะสม',
    tab: 'loyalty',
    icon: IconCoin,
  },
  {
    value: 'blog',
    label: 'จัดการบทความ',
    tab: 'blog',
    icon: IconNews,
  },
  {
    value: 'store-settings',
    label: 'จัดการร้านค้า',
    tab: 'store-settings',
    icon: IconBuildingStore,
    hasSeparatorBefore: true,
    groupLabel: 'ตั้งค่าร้านค้าและบัญชี',
  },
  {
    value: 'organization-branches',
    label: 'จัดการสาขา',
    tab: 'branches',
    icon: IconHierarchy2,
  },
  {
    value: 'billing-subscription',
    label: 'การสมัครสมาชิก',
    tab: 'billing',
    icon: IconCreditCard,
  },
  {
    value: 'credits',
    label: 'จัดการเครดิต',
    tab: 'credits',
    icon: IconWallet,
  },
  {
    value: 'profile',
    label: 'โปรไฟล์ส่วนตัว',
    tab: 'profile',
    icon: IconUser,
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
