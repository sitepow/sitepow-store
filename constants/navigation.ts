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
  IconTruck,
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
    label: 'ข้อมูลร้านค้า',
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
    items: [
      {
        value: 'orders-all',
        label: 'ออเดอร์ทั้งหมด',
        url: '/merchant/orders',
      },
      {
        value: 'orders-pending',
        label: 'รอตรวจสอบสลิป',
        url: '/merchant/orders?status=pending',
      },
      {
        value: 'orders-paid',
        label: 'รอแพ็คของ',
        url: '/merchant/orders?status=paid',
      },
      {
        value: 'orders-shipping',
        label: 'กำลังจัดส่ง',
        url: '/merchant/orders?status=shipping',
      },
      {
        value: 'orders-cancelled',
        label: 'ยกเลิกและคืนเงิน',
        url: '/merchant/orders?status=cancelled',
      },
    ],
  },
  {
    value: 'shipping',
    label: 'จัดการขนส่ง',
    tab: 'shipping',
    icon: IconTruck,
    items: [
      {
        value: 'shipping-pending',
        label: 'รอจองขนส่ง',
        url: '/merchant/shipping?delivery=pending',
      },
      {
        value: 'shipping-booked',
        label: 'จองขนส่งแล้ว',
        url: '/merchant/shipping?delivery=booked',
      },
      {
        value: 'shipping-in-transit',
        label: 'อยู่ระหว่างขนส่ง',
        url: '/merchant/shipping?delivery=in_transit',
      },
      {
        value: 'shipping-returned',
        label: 'พัสดุตีกลับ',
        url: '/merchant/shipping?delivery=returned',
      },
    ],
  },
  {
    value: 'inventory',
    label: 'คลังสินค้า',
    tab: 'inventory',
    icon: IconBox,
    items: [
      {
        value: 'inventory-stock',
        label: 'สต็อกสินค้า',
        url: '/merchant/inventory',
      },
      {
        value: 'inventory-low-stock',
        label: 'สินค้าใกล้หมด',
        url: '/merchant/inventory?filter=low_stock',
      },
      // {
      //   value: 'inventory-transfer',
      //   label: 'โอนย้ายสต็อก',
      //   url: '/merchant/inventory/transfer',
      // },
    ],
  },
  {
    value: 'staff',
    label: 'จัดการพนักงาน',
    tab: 'staff',
    icon: IconUsers,
    items: [
      {
        value: 'staff-list',
        label: 'รายชื่อพนักงาน',
        url: '/merchant/staff',
      },
      {
        value: 'staff-invite',
        label: 'เพิ่มพนักงานใหม่',
        url: '/merchant/staff/invite',
      },
    ],
  },
  {
    value: 'customers',
    label: 'ข้อมูลลูกค้า',
    tab: 'customers',
    icon: IconChartBar,
    items: [
      {
        value: 'customers-list',
        label: 'รายชื่อลูกค้าทั้งหมด',
        url: '/merchant/customers',
      },
      {
        value: 'customers-vip',
        label: 'ลูกค้า VIP (ยอดสูง)',
        url: '/merchant/customers?sort=total_spent',
      },
      {
        value: 'customers-new',
        label: 'ลูกค้าใหม่',
        url: '/merchant/customers?filter=new',
      },
      {
        value: 'customers-reviews',
        label: 'รีวิวสินค้า',
        url: '/merchant/customers/reviews',
      },
    ],
  },
  {
    value: 'billing-subscription',
    label: 'การสมัครสมาชิก',
    tab: 'billing',
    icon: IconCreditCard,
    hasSeparatorBefore: true,
    // items: [
    //   {
    //     value: 'billing-plan',
    //     label: 'แผนปัจจุบันและอัปเกรด',
    //     url: '/merchant/billing',
    //   },
    //   {
    //     value: 'billing-invoices',
    //     label: 'ประวัติการชำระเงิน',
    //     url: '/merchant/billing/invoices',
    //   },
    // ],
  },
  {
    value: 'ai-usage',
    label: 'เครดิต AI (Vision/Search)',
    tab: 'ai',
    icon: IconSparkles,
    // items: [
    //   {
    //     value: 'ai-overview',
    //     label: 'ภาพรวมเครดิต',
    //     url: '/merchant/ai-usage',
    //   },
    //   {
    //     value: 'ai-logs',
    //     label: 'ประวัติการใช้ AI',
    //     url: '/merchant/ai-usage/logs',
    //   },
    //   {
    //     value: 'ai-topup',
    //     label: 'เติมเครดิต',
    //     url: '/merchant/ai-usage/topup',
    //   },
    // ],
  },
  {
    value: 'loyalty',
    label: 'ระบบแต้มสะสม',
    tab: 'loyalty',
    icon: IconCoin,
    // items: [
    //   {
    //     value: 'loyalty-settings',
    //     label: 'ตั้งค่าระบบแต้ม',
    //     url: '/merchant/loyalty',
    //   },
    //   {
    //     value: 'loyalty-history',
    //     label: 'ประวัติแต้มลูกค้า',
    //     url: '/merchant/loyalty/history',
    //   },
    // ],
  },
  {
    value: 'marketing-coupons',
    label: 'คูปองส่วนลด',
    tab: 'coupons',
    icon: IconTicket,
    items: [
      {
        value: 'coupons-all',
        label: 'คูปองทั้งหมด',
        url: '/merchant/marketing-coupons',
      },
      {
        value: 'coupons-expired',
        label: 'คูปองหมดอายุ',
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
        value: 'transactions-history',
        label: 'ประวัติธุรกรรมทั้งหมด',
        url: '/merchant/transactions',
      },
      {
        value: 'transactions-refund',
        label: 'รายการคืนเงิน',
        url: '/merchant/transactions?type=refund',
      },
      {
        value: 'transactions-shipping-fee',
        label: 'ค่าขนส่งที่ถูกหัก',
        url: '/merchant/transactions?type=shipping_fee',
      },
      {
        value: 'transactions-withdraw',
        label: 'ถอนเงิน',
        url: '/merchant/transactions/withdraw',
      },
    ],
  },
  {
    value: 'support',
    label: 'ติดต่อลูกค้า',
    tab: 'support',
    icon: IconHeadset,
    items: [
      {
        value: 'support-tickets',
        label: 'Ticket ทั้งหมด',
        url: '/merchant/support',
      },
      {
        value: 'support-open',
        label: 'รอตอบกลับ',
        url: '/merchant/support?status=open',
      },
      {
        value: 'support-in-progress',
        label: 'กำลังดำเนินการ',
        url: '/merchant/support?status=in_progress',
      },
      {
        value: 'support-resolved',
        label: 'แก้ไขแล้ว',
        url: '/merchant/support?status=resolved',
      },
    ],
  },
  {
    value: 'blog',
    label: 'บทความ / Blog',
    tab: 'blog',
    icon: IconNews,
    items: [
      {
        value: 'blog-list',
        label: 'บทความทั้งหมด',
        url: '/merchant/blog',
      },
      {
        value: 'blog-create',
        label: 'เขียนบทความใหม่',
        url: '/merchant/blog/create',
      },
    ],
  },
  {
    value: 'organization-branches',
    label: 'จัดการสาขา',
    tab: 'branches',
    icon: IconHierarchy2,
    hasSeparatorBefore: true,
    // items: [
    //   {
    //     value: 'branches-list',
    //     label: 'สาขาทั้งหมด',
    //     url: '/merchant/branches',
    //   },
    //   {
    //     value: 'branches-create',
    //     label: 'เพิ่มสาขาใหม่',
    //     url: '/merchant/branches/create',
    //   },
    // ],
  },
  {
    value: 'audit-logs',
    label: 'ประวัติกิจกรรม',
    tab: 'audit-logs',
    icon: IconHistory,
    items: [
      {
        value: 'audit-logs-all',
        label: 'กิจกรรมทั้งหมด',
        url: '/merchant/audit-logs',
      },
      {
        value: 'audit-logs-orders',
        label: 'ออเดอร์และการขาย',
        url: '/merchant/audit-logs?action=orders',
      },
      {
        value: 'audit-logs-stock',
        label: 'สต็อกและสินค้า',
        url: '/merchant/audit-logs?action=stock',
      },
      {
        value: 'audit-logs-staff',
        label: 'การจัดการพนักงาน',
        url: '/merchant/audit-logs?action=staff',
      },
    ],
  },
  {
    value: 'settings',
    label: 'ตั้งค่าระบบ',
    tab: 'settings',
    icon: IconSettings,
    // items: [
    //   {
    //     value: 'settings-store',
    //     label: 'ข้อมูลร้านและการติดต่อ',
    //     url: '/merchant/settings',
    //   },
    //   {
    //     value: 'settings-transfer',
    //     label: 'โอนความเป็นเจ้าของร้าน',
    //     url: '/merchant/settings/transfer',
    //   },
    //   {
    //     value: 'settings-tax',
    //     label: 'ภาษีและใบกำกับ (VAT)',
    //     url: '/merchant/settings/tax',
    //   },
    //   {
    //     value: 'settings-shipping',
    //     label: 'ระบบขนส่ง',
    //     url: '/merchant/settings/shipping',
    //   },
    //   {
    //     value: 'settings-payment',
    //     label: 'ช่องทางรับชำระเงิน',
    //     url: '/merchant/settings/payment',
    //   },
    //   {
    //     value: 'settings-notifications',
    //     label: 'การแจ้งเตือน',
    //     url: '/merchant/settings/notifications',
    //   },
    // ],
  },
]
