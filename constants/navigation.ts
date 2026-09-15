import { PermissionKey } from '@/types/permission'
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
  IconMessages,
  IconNews,
  IconPackage,
  IconReceipt,
  IconReceiptTax,
  IconReportMoney,
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

export const SUPPORT_NAVIGATION: NavigationItem[] = [
  {
    value: 'chat',
    label: 'กล่องข้อความ Support',
    tab: 'chat',
    icon: IconMessages,
  },
]

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
    value: 'chat',
    label: 'แชทและข้อความ',
    tab: 'chat',
    icon: IconMessages,
  },
  {
    value: 'reviews',
    label: 'รีวิวของฉัน',
    tab: 'reviews',
    icon: IconStar,
  },
  {
    value: 'affiliate',
    label: 'นายหน้าแชร์ลิงก์',
    tab: 'affiliate',
    icon: IconCoin,
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
    value: 'chat',
    label: 'แชทของร้านค้า',
    tab: 'chat',
    icon: IconMessages,
    permissionKey: 'canViewConversation',
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
    value: 'profit-sharing',
    label: 'ส่วนแบ่งกำไร & หุ้นส่วน',
    tab: 'profit-sharing',
    icon: IconReceiptTax,
    permissionKey: 'canViewProfitSharing',
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
    value: 'payroll',
    label: 'เงินเดือน & ค่าจ้างพนักงาน',
    tab: 'payroll',
    icon: IconReportMoney,
    permissionKey: 'canViewPayroll',
  },
  {
    value: 'reviews',
    label: 'จัดการรีวิว',
    tab: 'reviews',
    icon: IconStar,
    permissionKey: 'canViewReviews',
  },
  {
    value: 'marketing-coupons',
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
    value: 'organization-branches',
    label: 'จัดการสาขา',
    tab: 'branches',
    icon: IconHierarchy2,
    permissionKey: 'canViewBranches',
  },
  {
    value: 'billing-subscription',
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
