import { ActorType, LogAction } from '@/generated/prisma/enums'

export type LogCategory =
  | 'ORDER'
  | 'INVENTORY'
  | 'PRODUCT'
  | 'SETTINGS'
  | 'STAFF'
  | 'FINANCE'
  | 'SECURITY'

export interface LogActionMeta {
  label: string
  category: LogCategory
  categoryLabel: string
  color: {
    badge: string
    dot: string
    border: string
    subtle: string
    iconColor: string
  }
}

export const LOG_CATEGORIES: Record<LogCategory, { label: string; actions: LogAction[] }> = {
  ORDER: {
    label: 'คำสั่งซื้อ & ขาย',
    actions: [
      LogAction.CREATE_ORDER,
      LogAction.UPDATE_ORDER_STATUS,
      LogAction.CANCEL_ORDER,
    ],
  },
  INVENTORY: {
    label: 'คลังสินค้า & สต็อก',
    actions: [
      LogAction.UPDATE_STOCK,
      LogAction.STOCK_TRANSFER,
      LogAction.RESTOCK_ITEMS,
    ],
  },
  PRODUCT: {
    label: 'จัดการสินค้า',
    actions: [
      LogAction.CREATE_PRODUCT,
      LogAction.DELETE_PRODUCT,
      LogAction.CREATE_BLOG,
      LogAction.UPDATE_BLOG,
      LogAction.DELETE_BLOG,
    ],
  },
  SETTINGS: {
    label: 'ร้านค้า & การตั้งค่า',
    actions: [
      LogAction.CREATE_STORE,
      LogAction.UPDATE_STORE,
      LogAction.DELETE_STORE,
      LogAction.UPDATE_STORE_SETTING,
      LogAction.CHANGE_PLAN,
      LogAction.ADJUST_CREDITS,
    ],
  },
  STAFF: {
    label: 'พนักงาน & สิทธิ์',
    actions: [
      LogAction.MANAGE_EMPLOYEE,
      LogAction.TRANSFER_STORE,
    ],
  },
  FINANCE: {
    label: 'การเงิน & ค่าใช้จ่าย',
    actions: [
      LogAction.CREATE_EXPENSE,
      LogAction.UPDATE_EXPENSE,
      LogAction.DELETE_EXPENSE,
    ],
  },
  SECURITY: {
    label: 'ความปลอดภัย & ผู้ใช้',
    actions: [
      LogAction.LOGIN,
      LogAction.LOGOUT,
      LogAction.BLOCK_CUSTOMER,
      LogAction.UNBLOCK_CUSTOMER,
      LogAction.SUSPEND_STORE,
    ],
  },
}

export const LOG_ACTION_CONFIG: Record<LogAction, LogActionMeta> = {
  [LogAction.CREATE_STORE]: {
    label: 'สร้างร้านค้าใหม่',
    category: 'SETTINGS',
    categoryLabel: 'ร้านค้า & การตั้งค่า',
    color: {
      badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      dot: 'bg-emerald-500',
      border: 'border-emerald-200 dark:border-emerald-800/50',
      subtle: 'bg-emerald-50/50 dark:bg-emerald-950/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
  },
  [LogAction.UPDATE_STORE]: {
    label: 'แก้ไขข้อมูลร้านค้า',
    category: 'SETTINGS',
    categoryLabel: 'ร้านค้า & การตั้งค่า',
    color: {
      badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      dot: 'bg-blue-500',
      border: 'border-blue-200 dark:border-blue-800/50',
      subtle: 'bg-blue-50/50 dark:bg-blue-950/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
  },
  [LogAction.DELETE_STORE]: {
    label: 'ลบร้านค้า',
    category: 'SETTINGS',
    categoryLabel: 'ร้านค้า & การตั้งค่า',
    color: {
      badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      dot: 'bg-rose-500',
      border: 'border-rose-200 dark:border-rose-800/50',
      subtle: 'bg-rose-50/50 dark:bg-rose-950/20',
      iconColor: 'text-rose-600 dark:rose-400',
    },
  },
  [LogAction.CHANGE_PLAN]: {
    label: 'เปลี่ยนแผนการใช้งาน',
    category: 'SETTINGS',
    categoryLabel: 'ร้านค้า & การตั้งค่า',
    color: {
      badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      dot: 'bg-purple-500',
      border: 'border-purple-200 dark:border-purple-800/50',
      subtle: 'bg-purple-50/50 dark:bg-purple-950/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
  },
  [LogAction.ADJUST_CREDITS]: {
    label: 'ปรับปรุงเครดิต AI',
    category: 'SETTINGS',
    categoryLabel: 'ร้านค้า & การตั้งค่า',
    color: {
      badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      dot: 'bg-amber-500',
      border: 'border-amber-200 dark:border-amber-800/50',
      subtle: 'bg-amber-50/50 dark:bg-amber-950/20',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
  },
  [LogAction.SUSPEND_STORE]: {
    label: 'ระงับการใช้งานร้านค้า',
    category: 'SECURITY',
    categoryLabel: 'ความปลอดภัย & ผู้ใช้',
    color: {
      badge: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
      dot: 'bg-red-500',
      border: 'border-red-200 dark:border-red-800/50',
      subtle: 'bg-red-50/50 dark:bg-red-950/20',
      iconColor: 'text-red-600 dark:text-red-400',
    },
  },
  [LogAction.CREATE_ORDER]: {
    label: 'สร้างออเดอร์',
    category: 'ORDER',
    categoryLabel: 'คำสั่งซื้อ & ขาย',
    color: {
      badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      dot: 'bg-emerald-500',
      border: 'border-emerald-200 dark:border-emerald-800/50',
      subtle: 'bg-emerald-50/50 dark:bg-emerald-950/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
  },
  [LogAction.UPDATE_ORDER_STATUS]: {
    label: 'อัปเดตสถานะออเดอร์',
    category: 'ORDER',
    categoryLabel: 'คำสั่งซื้อ & ขาย',
    color: {
      badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      dot: 'bg-blue-500',
      border: 'border-blue-200 dark:border-blue-800/50',
      subtle: 'bg-blue-50/50 dark:bg-blue-950/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
  },
  [LogAction.CANCEL_ORDER]: {
    label: 'ยกเลิกออเดอร์',
    category: 'ORDER',
    categoryLabel: 'คำสั่งซื้อ & ขาย',
    color: {
      badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      dot: 'bg-rose-500',
      border: 'border-rose-200 dark:border-rose-800/50',
      subtle: 'bg-rose-50/50 dark:bg-rose-950/20',
      iconColor: 'text-rose-600 dark:text-rose-400',
    },
  },
  [LogAction.RESTOCK_ITEMS]: {
    label: 'คืนสต็อกสินค้า',
    category: 'INVENTORY',
    categoryLabel: 'คลังสินค้า & สต็อก',
    color: {
      badge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
      dot: 'bg-teal-500',
      border: 'border-teal-200 dark:border-teal-800/50',
      subtle: 'bg-teal-50/50 dark:bg-teal-950/20',
      iconColor: 'text-teal-600 dark:text-teal-400',
    },
  },
  [LogAction.UPDATE_STOCK]: {
    label: 'แก้ไขสต็อกสินค้า',
    category: 'INVENTORY',
    categoryLabel: 'คลังสินค้า & สต็อก',
    color: {
      badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      dot: 'bg-amber-500',
      border: 'border-amber-200 dark:border-amber-800/50',
      subtle: 'bg-amber-50/50 dark:bg-amber-950/20',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
  },
  [LogAction.STOCK_TRANSFER]: {
    label: 'ย้ายสต็อกระหว่างสาขา',
    category: 'INVENTORY',
    categoryLabel: 'คลังสินค้า & สต็อก',
    color: {
      badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      dot: 'bg-indigo-500',
      border: 'border-indigo-200 dark:border-indigo-800/50',
      subtle: 'bg-indigo-50/50 dark:bg-indigo-950/20',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
    },
  },
  [LogAction.CREATE_PRODUCT]: {
    label: 'เพิ่มสินค้าใหม่',
    category: 'PRODUCT',
    categoryLabel: 'จัดการสินค้า',
    color: {
      badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      dot: 'bg-emerald-500',
      border: 'border-emerald-200 dark:border-emerald-800/50',
      subtle: 'bg-emerald-50/50 dark:bg-emerald-950/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
  },
  [LogAction.DELETE_PRODUCT]: {
    label: 'ลบสินค้า',
    category: 'PRODUCT',
    categoryLabel: 'จัดการสินค้า',
    color: {
      badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      dot: 'bg-rose-500',
      border: 'border-rose-200 dark:border-rose-800/50',
      subtle: 'bg-rose-50/50 dark:bg-rose-950/20',
      iconColor: 'text-rose-600 dark:text-rose-400',
    },
  },
  [LogAction.UPDATE_STORE_SETTING]: {
    label: 'แก้ไขการตั้งค่าร้าน',
    category: 'SETTINGS',
    categoryLabel: 'ร้านค้า & การตั้งค่า',
    color: {
      badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
      dot: 'bg-sky-500',
      border: 'border-sky-200 dark:border-sky-800/50',
      subtle: 'bg-sky-50/50 dark:bg-sky-950/20',
      iconColor: 'text-sky-600 dark:text-sky-400',
    },
  },
  [LogAction.MANAGE_EMPLOYEE]: {
    label: 'จัดการพนักงาน',
    category: 'STAFF',
    categoryLabel: 'พนักงาน & สิทธิ์',
    color: {
      badge: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
      dot: 'bg-violet-500',
      border: 'border-violet-200 dark:border-violet-800/50',
      subtle: 'bg-violet-50/50 dark:bg-violet-950/20',
      iconColor: 'text-violet-600 dark:text-violet-400',
    },
  },
  [LogAction.TRANSFER_STORE]: {
    label: 'โอนความเป็นเจ้าของร้าน',
    category: 'STAFF',
    categoryLabel: 'พนักงาน & สิทธิ์',
    color: {
      badge: 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/20',
      dot: 'bg-fuchsia-500',
      border: 'border-fuchsia-200 dark:border-fuchsia-800/50',
      subtle: 'bg-fuchsia-50/50 dark:bg-fuchsia-950/20',
      iconColor: 'text-fuchsia-600 dark:text-fuchsia-400',
    },
  },
  [LogAction.BLOCK_CUSTOMER]: {
    label: 'ระงับการใช้งานลูกค้า',
    category: 'SECURITY',
    categoryLabel: 'ความปลอดภัย & ผู้ใช้',
    color: {
      badge: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
      dot: 'bg-red-500',
      border: 'border-red-200 dark:border-red-800/50',
      subtle: 'bg-red-50/50 dark:bg-red-950/20',
      iconColor: 'text-red-600 dark:text-red-400',
    },
  },
  [LogAction.UNBLOCK_CUSTOMER]: {
    label: 'ปลดระงับการใช้งานลูกค้า',
    category: 'SECURITY',
    categoryLabel: 'ความปลอดภัย & ผู้ใช้',
    color: {
      badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      dot: 'bg-emerald-500',
      border: 'border-emerald-200 dark:border-emerald-800/50',
      subtle: 'bg-emerald-50/50 dark:bg-emerald-950/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
  },
  [LogAction.CREATE_BLOG]: {
    label: 'สร้างบทความใหม่',
    category: 'PRODUCT',
    categoryLabel: 'จัดการสินค้า',
    color: {
      badge: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
      dot: 'bg-cyan-500',
      border: 'border-cyan-200 dark:border-cyan-800/50',
      subtle: 'bg-cyan-50/50 dark:bg-cyan-950/20',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
    },
  },
  [LogAction.UPDATE_BLOG]: {
    label: 'แก้ไขบทความ',
    category: 'PRODUCT',
    categoryLabel: 'จัดการสินค้า',
    color: {
      badge: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
      dot: 'bg-cyan-500',
      border: 'border-cyan-200 dark:border-cyan-800/50',
      subtle: 'bg-cyan-50/50 dark:bg-cyan-950/20',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
    },
  },
  [LogAction.DELETE_BLOG]: {
    label: 'ลบบทความ',
    category: 'PRODUCT',
    categoryLabel: 'จัดการสินค้า',
    color: {
      badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      dot: 'bg-rose-500',
      border: 'border-rose-200 dark:border-rose-800/50',
      subtle: 'bg-rose-50/50 dark:bg-rose-950/20',
      iconColor: 'text-rose-600 dark:text-rose-400',
    },
  },
  [LogAction.LOGIN]: {
    label: 'เข้าสู่ระบบ',
    category: 'SECURITY',
    categoryLabel: 'ความปลอดภัย & ผู้ใช้',
    color: {
      badge: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
      dot: 'bg-slate-500',
      border: 'border-slate-200 dark:border-slate-800/50',
      subtle: 'bg-slate-50/50 dark:bg-slate-900/20',
      iconColor: 'text-slate-600 dark:text-slate-400',
    },
  },
  [LogAction.LOGOUT]: {
    label: 'ออกจากระบบ',
    category: 'SECURITY',
    categoryLabel: 'ความปลอดภัย & ผู้ใช้',
    color: {
      badge: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
      dot: 'bg-slate-500',
      border: 'border-slate-200 dark:border-slate-800/50',
      subtle: 'bg-slate-50/50 dark:bg-slate-900/20',
      iconColor: 'text-slate-600 dark:text-slate-400',
    },
  },
  [LogAction.CREATE_EXPENSE]: {
    label: 'บันทึกค่าใช้จ่าย',
    category: 'FINANCE',
    categoryLabel: 'การเงิน & ค่าใช้จ่าย',
    color: {
      badge: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
      dot: 'bg-orange-500',
      border: 'border-orange-200 dark:border-orange-800/50',
      subtle: 'bg-orange-50/50 dark:bg-orange-950/20',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
  },
  [LogAction.UPDATE_EXPENSE]: {
    label: 'แก้ไขค่าใช้จ่าย',
    category: 'FINANCE',
    categoryLabel: 'การเงิน & ค่าใช้จ่าย',
    color: {
      badge: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
      dot: 'bg-orange-500',
      border: 'border-orange-200 dark:border-orange-800/50',
      subtle: 'bg-orange-50/50 dark:bg-orange-950/20',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
  },
  [LogAction.DELETE_EXPENSE]: {
    label: 'ลบค่าใช้จ่าย',
    category: 'FINANCE',
    categoryLabel: 'การเงิน & ค่าใช้จ่าย',
    color: {
      badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      dot: 'bg-rose-500',
      border: 'border-rose-200 dark:border-rose-800/50',
      subtle: 'bg-rose-50/50 dark:bg-rose-950/20',
      iconColor: 'text-rose-600 dark:text-rose-400',
    },
  },
}

export const ENTITY_LABEL_TH: Record<string, string> = {
  Order: 'คำสั่งซื้อ',
  Product: 'สินค้า',
  ProductStock: 'สต็อกสินค้า',
  StockAdjustment: 'ปรับยอดสต็อก',
  StockTransfer: 'โอนย้ายสต็อก',
  Employee: 'พนักงาน',
  Store: 'ร้านค้า',
  Branch: 'สาขา',
  Expense: 'ค่าใช้จ่าย',
  Coupon: 'คูปองส่วนลด',
  Category: 'หมวดหมู่',
  Blog: 'บทความ',
  Subscription: 'แพ็กเกจสมาชิก',
  Customer: 'ลูกค้า',
  CustomerStore: 'สิทธิ์ลูกค้า',
  PaymentSetting: 'ตั้งค่าการชำระเงิน',
  BankAccount: 'บัญชีธนาคาร',
  ShippingSetting: 'ตั้งค่าการจัดส่ง',
  User: 'ผู้ใช้งาน',
}

export interface StructuredDetailItem {
  key: string
  label: string
  value: string
}

export function formatAuditLogSummary(log: {
  action: LogAction
  entity: string
  entityId?: string | null
  details: unknown
}): string {
  const d = (log.details as Record<string, unknown>) || {}

  // 1. If explicit human summary is stored, return it
  if (typeof d.summary === 'string' && d.summary.trim()) {
    return d.summary
  }

  // 2. Synthesize based on action and details
  switch (log.action) {
    case LogAction.CREATE_ORDER: {
      const numbers = Array.isArray(d.orderNumbers)
        ? d.orderNumbers.join(', ')
        : (d.orderNumber as string) || ''
      const channel = d.type === 'POS' ? 'ผ่านระบบ POS' : 'ผ่านหน้าร้านออนไลน์'
      return numbers
        ? `สร้างคำสั่งซื้อ #${numbers} (${channel})`
        : `สร้างคำสั่งซื้อใหม่ (${channel})`
    }
    case LogAction.UPDATE_ORDER_STATUS: {
      const orderNum = (d.orderNumber as string) || log.entityId || ''
      if (d.type === 'UPDATE_TAX_INFO') {
        return `แก้ไขข้อมูลใบกำกับภาษี คำสั่งซื้อ #${orderNum}`
      }
      if (d.action) {
        return `ตรวจสอบสลิปคำสั่งซื้อ #${orderNum}: ${d.action}`
      }
      if (d.to) {
        const tracking = d.trackingNumber ? ` (เลขพัสดุ: ${d.trackingNumber})` : ''
        return `อัปเดตคำสั่งซื้อ #${orderNum} สถานะเป็น "${d.to}"${tracking}`
      }
      return `อัปเดตคำสั่งซื้อ #${orderNum}`
    }
    case LogAction.CANCEL_ORDER: {
      const orderNum = (d.orderNumber as string) || log.entityId || ''
      return `ยกเลิกคำสั่งซื้อ #${orderNum}`
    }
    case LogAction.UPDATE_STOCK: {
      const target = (d.variantTitle as string) || (d.productTitle as string) || ''
      const branch = d.branchName ? ` ที่สาขา "${d.branchName}"` : ''
      if (d.quantity !== undefined) {
        const qtyNum = Number(d.quantity)
        const qtyStr = qtyNum > 0 ? `+${qtyNum}` : `${qtyNum}`
        const reason = d.reason ? ` (${d.reason})` : ''
        return `ปรับยอดสต็อก ${target ? `"${target}"` : ''}${branch} จำนวน ${qtyStr} ชิ้น${reason}`
      }
      if (d.minStock !== undefined) {
        return `ปรับยอดสต็อกขั้นต่ำ ${target ? `"${target}"` : ''}${branch} เป็น ${d.minStock} ชิ้น`
      }
      return `แก้ไขสต็อกสินค้า ${target}${branch}`
    }
    case LogAction.STOCK_TRANSFER: {
      const target = (d.variantTitle as string) || ''
      const from = (d.fromBranchName as string) || ''
      const to = (d.toBranchName as string) || ''
      const qty = d.quantity ? ` ${d.quantity} ชิ้น` : ''
      if (from && to) {
        return `โอนย้ายสต็อก ${target ? `"${target}"` : ''}${qty} จาก "${from}" ไปยัง "${to}"`
      }
      return `โอนย้ายสต็อกสินค้า ${target}${qty}`
    }
    case LogAction.RESTOCK_ITEMS: {
      return `คืนสต็อกสินค้าเข้าคลัง`
    }
    case LogAction.CREATE_PRODUCT: {
      const title = (d.title as string) || ''
      return title ? `เพิ่มสินค้าใหม่ "${title}"` : 'เพิ่มสินค้าใหม่เข้าสู่ระบบ'
    }
    case LogAction.DELETE_PRODUCT: {
      const title = (d.title as string) || ''
      return title ? `ลบสินค้า "${title}" ออกจากระบบ` : 'ลบสินค้าออกจากระบบ'
    }
    case LogAction.CREATE_EXPENSE: {
      const title = (d.title as string) || ''
      const amount = d.amount ? ` ฿${Number(d.amount).toLocaleString()}` : ''
      return `บันทึกค่าใช้จ่าย "${title}"${amount}`
    }
    case LogAction.UPDATE_EXPENSE: {
      const title = (d.title as string) || ''
      return `แก้ไขรายการค่าใช้จ่าย "${title}"`
    }
    case LogAction.DELETE_EXPENSE: {
      const title = (d.title as string) || ''
      return `ลบรายการค่าใช้จ่าย "${title}"`
    }
    case LogAction.MANAGE_EMPLOYEE: {
      const name = (d.name as string) || ''
      const email = (d.email as string) || ''
      const who = name || email || ''
      if (d.type === 'created') return `เพิ่มพนักงานใหม่ "${who}"`
      if (d.type === 'deleted') return `ลบข้อมูลพนักงาน "${who}"`
      return `แก้ไขข้อมูลพนักงาน "${who}"`
    }
    case LogAction.BLOCK_CUSTOMER: {
      const name = (d.customerName as string) || (d.customerId as string) || ''
      return `ระงับการใช้งานลูกค้า ${name ? `"${name}"` : ''}`
    }
    case LogAction.UNBLOCK_CUSTOMER: {
      const name = (d.customerName as string) || (d.customerId as string) || ''
      return `ปลดระงับการใช้งานลูกค้า ${name ? `"${name}"` : ''}`
    }
    case LogAction.CREATE_BLOG: {
      const title = (d.title as string) || ''
      return title ? `สร้างบทความใหม่ "${title}"` : 'สร้างบทความใหม่'
    }
    case LogAction.UPDATE_BLOG: {
      const title = (d.title as string) || ''
      return title ? `แก้ไขบทความ "${title}"` : 'แก้ไขบทความ'
    }
    case LogAction.DELETE_BLOG: {
      const title = (d.title as string) || ''
      return title ? `ลบบทความ "${title}"` : 'ลบบทความ'
    }
    case LogAction.CHANGE_PLAN: {
      const to = (d.to as string) || (d.plan as string) || ''
      return to ? `เปลี่ยนแพ็กเกจการใช้งานเป็น "${to}"` : 'เปลี่ยนแพ็กเกจการใช้งาน'
    }
    case LogAction.ADJUST_CREDITS: {
      return 'ปรับปรุงเครดิต AI'
    }
    case LogAction.UPDATE_STORE_SETTING: {
      if (log.entity === 'Coupon') {
        const code = (d.code as string) || ''
        if (d.type === 'created') return `สร้างคูปองส่วนลด "${code}"`
        if (d.type === 'deleted') return `ลบคูปองส่วนลด "${code}"`
        return `แก้ไขคูปองส่วนลด "${code}"`
      }
      if (log.entity === 'Branch') {
        const name = (d.name as string) || ''
        if (d.type === 'created') return `สร้างสาขาใหม่ "${name}"`
        if (d.type === 'set_main') return `ตั้งสาขา "${name}" เป็นสาขาหลัก`
        if (d.type === 'deleted') return `ลบสาขา "${name}"`
        return `แก้ไขข้อมูลสาขา "${name}"`
      }
      if (log.entity === 'Category') {
        const title = (d.title as string) || ''
        if (d.type === 'created') return `สร้างหมวดหมู่สินค้า "${title}"`
        if (d.type === 'deleted') return `ลบหมวดหมู่สินค้า "${title}"`
        return `แก้ไขหมวดหมู่สินค้า "${title}"`
      }
      if (log.entity === 'BankAccount') {
        const bank = (d.bankName as string) || ''
        if (d.type === 'created') return `เพิ่มบัญชีธนาคาร ${bank}`
        if (d.type === 'deleted') return `ลบบัญชีธนาคาร ${bank}`
        return `แก้ไขบัญชีธนาคาร ${bank}`
      }
      const setting = (d.setting as string) || log.entity
      return `แก้ไขการตั้งค่า ${ENTITY_LABEL_TH[setting] || setting}`
    }
    case LogAction.LOGIN:
      return 'เข้าสู่ระบบสำเร็จ'
    case LogAction.LOGOUT:
      return 'ออกจากระบบสำเร็จ'
    default:
      return (d.message as string) || (d.title as string) || LOG_ACTION_CONFIG[log.action]?.label || log.action
  }
}

export function extractStructuredDetails(details: unknown): StructuredDetailItem[] {
  if (!details || typeof details !== 'object' || Array.isArray(details)) {
    return []
  }

  const d = details as Record<string, unknown>
  const items: StructuredDetailItem[] = []

  const keyMap: Record<string, string> = {
    orderNumber: 'เลขที่คำสั่งซื้อ',
    orderNumbers: 'เลขที่คำสั่งซื้อ',
    from: 'สถานะเดิม',
    to: 'สถานะใหม่',
    status: 'สถานะ',
    trackingNumber: 'หมายเลขพัสดุ',
    carrier: 'ผู้ให้บริการจัดส่ง',
    paymentMethod: 'วิธีชำระเงิน',
    totalAmount: 'ยอดรวม (บาท)',
    amount: 'จำนวนเงิน (บาท)',
    receivedAmount: 'ยอดรับมา',
    changeAmount: 'เงินทอน',
    quantity: 'จำนวน',
    minStock: 'สต็อกขั้นต่ำ',
    reason: 'เหตุผล',
    note: 'บันทึกเพิ่มเติม',
    branchName: 'ชื่อสาขา',
    fromBranchName: 'สาขาต้นทาง',
    toBranchName: 'สาขาปลายทาง',
    productTitle: 'ชื่อสินค้า',
    variantTitle: 'ตัวเลือกสินค้า',
    title: 'หัวข้อ / ชื่อ',
    slug: 'Slug (URL)',
    name: 'ชื่อ',
    email: 'อีเมล',
    code: 'รหัสคูปอง',
    discountType: 'ประเภทส่วนลด',
    discountValue: 'มูลค่าส่วนลด',
    bankName: 'ธนาคาร',
    accountNumber: 'เลขที่บัญชี',
    promptPayId: 'พร้อมเพย์',
    customerName: 'ชื่อลูกค้า',
    phone: 'เบอร์โทรศัพท์',
    fakeSlipCount: 'จำนวนสลิปปลอมที่พบ',
    type: 'ประเภทรายการ',
    plan: 'แพ็กเกจ',
  }

  for (const [k, v] of Object.entries(d)) {
    if (k === 'summary' || v === undefined || v === null) continue
    const label = keyMap[k] || k

    let displayVal = ''
    if (typeof v === 'boolean') {
      displayVal = v ? 'เปิดใช้งาน (ใช่)' : 'ปิดใช้งาน (ไม่ใช่)'
    } else if (Array.isArray(v)) {
      displayVal = v.map((item) => (typeof item === 'object' ? JSON.stringify(item) : String(item))).join(', ')
    } else if (typeof v === 'object') {
      displayVal = JSON.stringify(v)
    } else {
      displayVal = String(v)
    }

    if (displayVal) {
      items.push({ key: k, label, value: displayVal })
    }
  }

  return items
}

export const ACTOR_TYPE_CONFIG: Record<
  ActorType,
  { label: string; desc: string; badgeClass: string }
> = {
  [ActorType.MERCHANT]: {
    label: 'ผู้ค้า / เจ้าของร้าน',
    desc: 'การกระทำโดยเจ้าของร้านหรือผู้ดูแล',
    badgeClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
  },
  [ActorType.SYSTEM]: {
    label: 'ระบบอัตโนมัติ',
    desc: 'คำสั่งหรือเงื่อนไขอัตโนมัติจากเซิร์ฟเวอร์',
    badgeClass: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
  },
  [ActorType.SUPER_ADMIN]: {
    label: 'ผู้ดูแลระบบกลาง',
    desc: 'การกระทำโดย Super Admin',
    badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
  },
}
