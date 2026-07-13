import { OrderStatus, TransactionType } from '@/generated/prisma/enums'
import {
  IconBox,
  IconBuildingStore,
  IconChartBar,
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
        url: `/merchant/orders?status=${OrderStatus.PENDING}`,
      },
      {
        value: 'orders-paid',
        label: 'ชำระแล้ว',
        url: `/merchant/orders?status=${OrderStatus.PAID}`,
      },
      {
        value: 'orders-shipped',
        label: 'จัดส่งแล้ว',
        url: `/merchant/orders?status=${OrderStatus.SHIPPED}`,
      },
      {
        value: 'orders-completed',
        label: 'สำเร็จ',
        url: `/merchant/orders?status=${OrderStatus.COMPLETED}`,
      },
      {
        value: 'orders-cancelled',
        label: 'ยกเลิก',
        url: `/merchant/orders?status=${OrderStatus.CANCELLED}`,
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
    label: 'การจัดการเครดิต',
    tab: 'credits',
    icon: IconWallet,
    items: [
      {
        value: 'credits-all',
        label: 'ประวัติทั้งหมด',
        url: '/merchant/credits',
      },
      {
        value: 'credits-purchase',
        label: 'ประวัติการซื้อเครดิต',
        url: `/merchant/credits?type=${TransactionType.CREDIT_PURCHASE}`,
      },
      {
        value: 'credits-usage',
        label: 'ประวัติการใช้งาน AI',
        url: `/merchant/credits?type=${TransactionType.AI_USAGE}`,
      },
      {
        value: 'credits-refund',
        label: 'รายการคืนเครดิต',
        url: `/merchant/credits?type=${TransactionType.REFUND}`,
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
