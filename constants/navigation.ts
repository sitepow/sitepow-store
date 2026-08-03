import {
  IconBox,
  IconBuildingStore,
  IconCalculator,
  IconCoin,
  IconCreditCard,
  IconHierarchy2,
  IconHistory,
  IconLayoutDashboard,
  IconMapPin,
  IconNews,
  IconPackage,
  IconSettings,
  IconShoppingCart,
  IconTicket,
  IconUser,
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
    value: 'pos',
    label: 'ระบบขายหน้าร้าน',
    tab: 'pos',
    icon: IconCalculator,
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
  },
  {
    value: 'inventory',
    label: 'คลังสินค้า',
    tab: 'inventory',
    icon: IconBox,
  },
  {
    value: 'employee',
    label: 'จัดการพนักงาน',
    tab: 'employee',
    icon: IconUserCog,
  },
  {
    value: 'customers',
    label: 'จัดการลูกค้า',
    tab: 'customers',
    icon: IconUserCog,
  },
  {
    value: 'billing-subscription',
    label: 'การสมัครสมาชิก',
    tab: 'billing',
    icon: IconCreditCard,
    hasSeparatorBefore: true,
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
    value: 'credits',
    label: 'จัดการเครดิต',
    tab: 'credits',
    icon: IconWallet,
  },
  {
    value: 'blog',
    label: 'จัดการบทความ',
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
