import { PermissionKey } from '@/types/store'
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

export interface NavigationSubItem {
  value: string
  label: string
  url: string
  permissionKey?: PermissionKey
}

export interface NavigationItem {
  value: string
  label: string
  tab: string
  icon: TablerIcon
  hasSeparatorBefore?: boolean
  groupLabel?: string
  permissionKey?: PermissionKey
  items?: NavigationSubItem[]
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
    permissionKey: 'canViewDashboard',
  },
  {
    value: 'pos',
    label: 'แคชเชียร์',
    tab: 'pos',
    icon: IconCashRegister,
    permissionKey: 'canViewOrders',
  },
  {
    value: 'orders',
    label: 'จัดการออเดอร์',
    tab: 'orders',
    icon: IconShoppingCart,
    permissionKey: 'canViewOrders',
  },
  {
    value: 'store-settings/products',
    label: 'จัดการสินค้า',
    tab: 'store-settings/products',
    icon: IconPackage,
    hasSeparatorBefore: true,
    groupLabel: 'สินค้าและคลังสินค้า',
    permissionKey: 'canViewProducts',
  },
  {
    value: 'store-settings/categories',
    label: 'หมวดหมู่สินค้า',
    tab: 'store-settings/categories',
    icon: IconBox,
    permissionKey: 'canViewCategory',
  },
  {
    value: 'inventory',
    label: 'คลังสินค้า',
    tab: 'inventory',
    icon: IconBox,
    permissionKey: 'canViewInventory',
  },
  {
    value: 'expenses',
    label: 'จัดการค่าใช้จ่าย',
    tab: 'expenses',
    icon: IconReceipt,
    hasSeparatorBefore: true,
    groupLabel: 'การจัดการและบุคลากร',
    permissionKey: 'canViewExpenses',
  },
  {
    value: 'reseller',
    label: 'ตัวแทนจำหน่าย',
    tab: 'reseller',
    icon: IconBuildingStore,
    permissionKey: 'canViewReseller',
  },
  {
    value: 'customers',
    label: 'จัดการลูกค้า',
    tab: 'customers',
    icon: IconUserCheck,
    permissionKey: 'canViewCustomers',
  },
  {
    value: 'employee',
    label: 'จัดการพนักงาน',
    tab: 'employee',
    icon: IconUserCog,
    permissionKey: 'canViewEmployee',
  },
  {
    value: 'reviews',
    label: 'จัดการรีวิว',
    tab: 'reviews',
    icon: IconStar,
    permissionKey: 'canViewReviews',
  },
  {
    value: 'coupons',
    label: 'คูปองส่วนลด',
    tab: 'coupons',
    icon: IconTicket,
    hasSeparatorBefore: true,
    groupLabel: 'การตลาดและโปรโมชัน',
    permissionKey: 'canViewCoupons',
  },
  {
    value: 'loyalty',
    label: 'ระบบแต้มสะสม',
    tab: 'loyalty',
    icon: IconCoin,
    permissionKey: 'canViewStoreSettings',
  },
  {
    value: 'blog',
    label: 'จัดการบทความ',
    tab: 'blog',
    icon: IconNews,
    permissionKey: 'canViewBlogs',
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
    value: 'branches',
    label: 'จัดการสาขา',
    tab: 'branches',
    icon: IconHierarchy2,
    permissionKey: 'canViewBranches',
  },
  {
    value: 'billing',
    label: 'การสมัครสมาชิก',
    tab: 'billing',
    icon: IconCreditCard,
    permissionKey: 'canViewSubscription',
  },
  {
    value: 'credits',
    label: 'จัดการเครดิต',
    tab: 'credits',
    icon: IconWallet,
    permissionKey: 'canViewFinance',
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
    permissionKey: 'canViewActivityLogs',
  },
  {
    value: 'settings',
    label: 'ตั้งค่าระบบ',
    tab: 'settings',
    icon: IconSettings,
    permissionKey: 'canViewStoreSettings',
  },
]
