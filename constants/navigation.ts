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
  href: string
  icon: TablerIcon
  hasSeparatorBefore?: boolean
}

export const BUYER_NAVIGATION: NavigationItem[] = [
  {
    value: 'orders',
    label: 'การซื้อของฉัน',
    href: '/user/orders',
    icon: IconPackage,
  },
  {
    value: 'profile',
    label: 'โปรไฟล์ส่วนตัว',
    href: '/user/profile',
    icon: IconUser,
  },
  {
    value: 'addresses',
    label: 'ที่อยู่จัดส่ง',
    href: '/user/addresses',
    icon: IconMapPin,
  },
  {
    value: 'billing',
    label: 'กระเป๋าเงิน / ช่องทางชำระเงิน',
    href: '/user/billing',
    icon: IconWallet,
    hasSeparatorBefore: true,
  },
  {
    value: 'rewards',
    label: 'แต้มสะสมของฉัน',
    href: '/user/rewards',
    icon: IconCoin,
  },
  {
    value: 'vouchers',
    label: 'โค้ดส่วนลดของฉัน',
    href: '/user/vouchers',
    icon: IconTicket,
  },
  {
    value: 'wishlist',
    label: 'สินค้าที่ถูกใจ',
    href: '/user/wishlist',
    icon: IconHeart,
    hasSeparatorBefore: true,
  },
  {
    value: 'recently-viewed',
    label: 'สินค้าที่ดูเมื่อเร็วๆ นี้',
    href: '/user/recently-viewed',
    icon: IconHistory,
  },
  {
    value: 'settings',
    label: 'ตั้งค่าบัญชี',
    href: '/user/settings',
    icon: IconSettings,
  },
]

export const MERCHANT_NAVIGATION: NavigationItem[] = [
  {
    value: 'dashboard',
    label: 'แดชบอร์ด',
    href: '/merchant/dashboard',
    icon: IconLayoutDashboard,
  },
  {
    value: 'profile',
    label: 'โปรไฟล์ส่วนตัว',
    href: '/merchant/profile',
    icon: IconUser,
  },
  {
    value: 'store-settings',
    label: 'ข้อมูลร้านค้า',
    href: '/merchant/store',
    icon: IconBuildingStore,
  },
  {
    value: 'billing-subscription',
    label: 'การสมัครสมาชิก',
    href: '/merchant/billing',
    icon: IconCreditCard,
    hasSeparatorBefore: true,
  },
  {
    value: 'ai-usage',
    label: 'เครดิต AI (Vision/Search)',
    href: '/merchant/ai-credits',
    icon: IconSparkles,
  },
  {
    value: 'loyalty',
    label: 'ระบบแต้มสะสม',
    href: '/merchant/loyalty',
    icon: IconCoin,
  },
  {
    value: 'marketing-coupons',
    label: 'คูปองส่วนลด',
    href: '/merchant/coupons',
    icon: IconTicket,
  },
  {
    value: 'organization-branches',
    label: 'จัดการสาขา',
    href: '/merchant/branches',
    icon: IconHierarchy2,
    hasSeparatorBefore: true,
  },
  {
    value: 'audit-logs',
    label: 'ประวัติกิจกรรม',
    href: '/merchant/audit-logs',
    icon: IconHistory,
  },
  {
    value: 'settings',
    label: 'ตั้งค่าระบบ',
    href: '/merchant/settings',
    icon: IconSettings,
  },
]
