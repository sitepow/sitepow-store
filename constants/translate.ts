import {
  ActorType,
  AddressType,
  DefaultRole,
  DiscountType,
  ExpenseCategory,
  InvoiceStatus,
  LogAction,
  OrderStatus,
  PaymentMethod,
  Plan,
  ProductType,
  StockAdjustmentReason,
  SubStatus,
  TransactionType,
  TransferStatus,
} from '@/generated/prisma/enums'

export const STOCK_ADJUSTMENT_TH: Record<StockAdjustmentReason, string> = {
  [StockAdjustmentReason.DAMAGED]: 'สินค้าเสียหาย',
  [StockAdjustmentReason.LOST]: 'สินค้าสูญหาย',
  [StockAdjustmentReason.EXPIRED]: 'สินค้าหมดอายุ',
  [StockAdjustmentReason.CORRECTION]: 'แก้ไขข้อมูลสต็อก',
  [StockAdjustmentReason.PROMOTION]: 'ใช้เพื่อโปรโมชัน/ของแถม',
  [StockAdjustmentReason.OTHER]: 'อื่นๆ',
}

export const STOCK_ADJUSTMENT_EN: Record<StockAdjustmentReason, string> = {
  [StockAdjustmentReason.DAMAGED]: 'Damaged',
  [StockAdjustmentReason.LOST]: 'Lost',
  [StockAdjustmentReason.EXPIRED]: 'Expired',
  [StockAdjustmentReason.CORRECTION]: 'Stock Correction',
  [StockAdjustmentReason.PROMOTION]: 'Promotion / Giveaway',
  [StockAdjustmentReason.OTHER]: 'Other',
}

export const STOCK_ADJUSTMENT_REASON_OPTIONS = Object.entries(
  STOCK_ADJUSTMENT_TH,
).map(([value, label]) => ({ value, label }))

export const STOCK_ADJUSTMENT_REASON_OPTIONS_EN = Object.entries(
  STOCK_ADJUSTMENT_EN,
).map(([value, label]) => ({ value, label }))

export const ORDER_STATUS_TH: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'รอชำระเงิน',
  [OrderStatus.MANUAL_CHECK]: 'รอตรวจสอบสลิป',
  [OrderStatus.PAID]: 'ชำระเงินแล้ว',
  [OrderStatus.SHIPPED]: 'จัดส่งแล้ว',
  [OrderStatus.CANCELLED]: 'ยกเลิก',
}

export const ORDER_STATUS_EN: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Pending Payment',
  [OrderStatus.MANUAL_CHECK]: 'Verifying Slip',
  [OrderStatus.PAID]: 'Paid',
  [OrderStatus.SHIPPED]: 'Shipped',
  [OrderStatus.CANCELLED]: 'Cancelled',
}

export const ORDER_STATUS_OPTIONS = Object.entries(ORDER_STATUS_TH).map(
  ([value, label]) => ({ value, label }),
)

export const ORDER_STATUS_OPTIONS_EN = Object.entries(ORDER_STATUS_EN).map(
  ([value, label]) => ({ value, label }),
)

export const PAYMENT_METHOD_TH: Record<PaymentMethod, string> = {
  [PaymentMethod.BANK_TRANSFER]: 'โอนเงินผ่านบัญชีธนาคาร',
  [PaymentMethod.MANUAL_QR_PROMPTPAY]: 'พร้อมเพย์ร้านค้า (แนบสลิป)',
  [PaymentMethod.STRIPE_QR_PROMPTPAY]: 'พร้อมเพย์ (QR ผ่าน Stripe)',
  [PaymentMethod.STRIPE_CREDIT_CARD]: 'บัตรเครดิต/เดบิต (ผ่าน Stripe)',
  [PaymentMethod.STRIPE_GOOGLE_PAY]: 'Google Pay (ผ่าน Stripe)',
  [PaymentMethod.STRIPE_APPLE_PAY]: 'Apple Pay (ผ่าน Stripe)',
  [PaymentMethod.CASH_ON_DELIVERY]: 'เก็บเงินปลายทาง',
}

export const PAYMENT_METHOD_EN: Record<PaymentMethod, string> = {
  [PaymentMethod.BANK_TRANSFER]: 'Bank Transfer',
  [PaymentMethod.MANUAL_QR_PROMPTPAY]: 'Merchant PromptPay (Attach Slip)',
  [PaymentMethod.STRIPE_QR_PROMPTPAY]: 'PromptPay (QR via Stripe)',
  [PaymentMethod.STRIPE_CREDIT_CARD]: 'Credit/Debit Card (via Stripe)',
  [PaymentMethod.STRIPE_GOOGLE_PAY]: 'Google Pay (via Stripe)',
  [PaymentMethod.STRIPE_APPLE_PAY]: 'Apple Pay (via Stripe)',
  [PaymentMethod.CASH_ON_DELIVERY]: 'Cash on Delivery',
}

export const PAYMENT_METHOD_OPTIONS = Object.entries(PAYMENT_METHOD_TH).map(
  ([value, label]) => ({ value, label }),
)

export const PAYMENT_METHOD_OPTIONS_EN = Object.entries(PAYMENT_METHOD_EN).map(
  ([value, label]) => ({ value, label }),
)

export const DISCOUNT_TYPE_TH: Record<DiscountType, string> = {
  [DiscountType.PERCENTAGE]: 'เปอร์เซ็นต์ (%)',
  [DiscountType.FIXED]: 'จำนวนเงินคงที่ (บาท)',
}

export const DISCOUNT_TYPE_EN: Record<DiscountType, string> = {
  [DiscountType.PERCENTAGE]: 'Percentage (%)',
  [DiscountType.FIXED]: 'Fixed Amount (THB)',
}

export const ACTOR_TYPE_TH: Record<ActorType, string> = {
  [ActorType.SYSTEM]: 'ระบบอัตโนมัติ',
  [ActorType.SUPER_ADMIN]: 'ผู้ดูแลระบบแพลตฟอร์ม',
  [ActorType.MERCHANT]: 'ร้านค้า/พนักงาน',
}

export const ACTOR_TYPE_EN: Record<ActorType, string> = {
  [ActorType.SYSTEM]: 'System (Automated)',
  [ActorType.SUPER_ADMIN]: 'Platform Super Admin',
  [ActorType.MERCHANT]: 'Merchant / Staff',
}

export const ADDRESS_TYPE_TH: Record<AddressType, string> = {
  [AddressType.SHIPPING]: 'ที่อยู่จัดส่ง',
  [AddressType.TAX]: 'ที่อยู่ใบกำกับภาษี',
  [AddressType.BOTH]: 'ที่อยู่จัดส่งและใบกำกับภาษี',
}

export const ADDRESS_TYPE_EN: Record<AddressType, string> = {
  [AddressType.SHIPPING]: 'Shipping Address',
  [AddressType.TAX]: 'Tax Invoice Address',
  [AddressType.BOTH]: 'Shipping & Tax Invoice Address',
}

export const PLAN_TH: Record<Plan, string> = {
  [Plan.FREE]: 'Free',
  [Plan.STARTER]: 'Starter',
  [Plan.PRO]: 'Pro',
  [Plan.ULTIMATE]: 'Ultimate',
}

export const PLAN_EN: Record<Plan, string> = {
  [Plan.FREE]: 'Free',
  [Plan.STARTER]: 'Starter',
  [Plan.PRO]: 'Pro',
  [Plan.ULTIMATE]: 'Ultimate',
}

export const LOG_ACTION_TH: Record<LogAction, string> = {
  [LogAction.CREATE_STORE]: 'สร้างร้านค้าใหม่',
  [LogAction.UPDATE_STORE]: 'แก้ไขข้อมูลร้านค้า',
  [LogAction.DELETE_STORE]: 'ลบร้านค้า',
  [LogAction.CHANGE_PLAN]: 'เปลี่ยนแผนการใช้งาน',
  [LogAction.ADJUST_CREDITS]: 'ปรับปรุงเครดิต AI',
  [LogAction.SUSPEND_STORE]: 'ระงับการใช้งานร้านค้า',
  [LogAction.CREATE_ORDER]: 'สร้างออเดอร์',
  [LogAction.UPDATE_ORDER_STATUS]: 'อัปเดตสถานะออเดอร์',
  [LogAction.CANCEL_ORDER]: 'ยกเลิกออเดอร์',
  [LogAction.RESTOCK_ITEMS]: 'คืนสต็อกสินค้า',
  [LogAction.UPDATE_STOCK]: 'แก้ไขสต็อก',
  [LogAction.STOCK_TRANSFER]: 'ย้ายสต็อกระหว่างสาขา',
  [LogAction.CREATE_PRODUCT]: 'เพิ่มสินค้าใหม่',
  [LogAction.DELETE_PRODUCT]: 'ลบสินค้า',
  [LogAction.UPDATE_STORE_SETTING]: 'แก้ไขการตั้งค่าร้าน',
  [LogAction.MANAGE_EMPLOYEE]: 'จัดการพนักงาน',
  [LogAction.TRANSFER_STORE]: 'โอนความเป็นเจ้าของร้านให้ผู้อื่น',
  [LogAction.BLOCK_CUSTOMER]: 'ระงับการใช้งานลูกค้า (Block)',
  [LogAction.UNBLOCK_CUSTOMER]: 'ปลดระงับการใช้งานลูกค้า (Unblock)',
  [LogAction.CREATE_BLOG]: 'สร้างบทความใหม่',
  [LogAction.UPDATE_BLOG]: 'แก้ไขบทความ',
  [LogAction.DELETE_BLOG]: 'ลบบทความ',
  [LogAction.LOGIN]: 'เข้าสู่ระบบ',
  [LogAction.LOGOUT]: 'ออกจากระบบ',
  [LogAction.CREATE_EXPENSE]: 'บันทึกค่าใช้จ่าย',
  [LogAction.UPDATE_EXPENSE]: 'แก้ไขรายการค่าใช้จ่าย',
  [LogAction.DELETE_EXPENSE]: 'ลบรายการค่าใช้จ่าย',
}

export const LOG_ACTION_EN: Record<LogAction, string> = {
  [LogAction.CREATE_STORE]: 'Create New Store',
  [LogAction.UPDATE_STORE]: 'Update Store Info',
  [LogAction.DELETE_STORE]: 'Delete Store',
  [LogAction.CHANGE_PLAN]: 'Change Plan',
  [LogAction.ADJUST_CREDITS]: 'Adjust AI Credits',
  [LogAction.SUSPEND_STORE]: 'Suspend Store',
  [LogAction.CREATE_ORDER]: 'Create Order',
  [LogAction.UPDATE_ORDER_STATUS]: 'Update Order Status',
  [LogAction.CANCEL_ORDER]: 'Cancel Order',
  [LogAction.RESTOCK_ITEMS]: 'Restock Items',
  [LogAction.UPDATE_STOCK]: 'Update Stock',
  [LogAction.STOCK_TRANSFER]: 'Transfer Stock Between Branches',
  [LogAction.CREATE_PRODUCT]: 'Add New Product',
  [LogAction.DELETE_PRODUCT]: 'Delete Product',
  [LogAction.UPDATE_STORE_SETTING]: 'Update Store Settings',
  [LogAction.MANAGE_EMPLOYEE]: 'Manage Employee',
  [LogAction.TRANSFER_STORE]: 'Transfer Store Ownership',
  [LogAction.BLOCK_CUSTOMER]: 'Block Customer',
  [LogAction.UNBLOCK_CUSTOMER]: 'Unblock Customer',
  [LogAction.CREATE_BLOG]: 'Create Article',
  [LogAction.UPDATE_BLOG]: 'Update Article',
  [LogAction.DELETE_BLOG]: 'Delete Article',
  [LogAction.LOGIN]: 'Log In',
  [LogAction.LOGOUT]: 'Log Out',
  [LogAction.CREATE_EXPENSE]: 'Record Expense',
  [LogAction.UPDATE_EXPENSE]: 'Update Expense',
  [LogAction.DELETE_EXPENSE]: 'Delete Expense',
}

export const TRANSACTION_TYPE_TH: Record<TransactionType, string> = {
  [TransactionType.CREDIT_PURCHASE]: 'ซื้อเครดิต',
  [TransactionType.AI_USAGE]: 'ค่าใช้งาน AI',
  [TransactionType.SLIP_VERIFY]: 'ค่าบริการตรวจสลิป',
  [TransactionType.REFUND]: 'คืนเครดิต',
}

export const TRANSACTION_TYPE_EN: Record<TransactionType, string> = {
  [TransactionType.CREDIT_PURCHASE]: 'Purchase Credits',
  [TransactionType.AI_USAGE]: 'AI Usage Fee',
  [TransactionType.SLIP_VERIFY]: 'Slip Verification Fee',
  [TransactionType.REFUND]: 'Refund Credits',
}

export const SUB_STATUS_TH: Record<SubStatus, string> = {
  [SubStatus.ACTIVE]: 'ปกติ',
  [SubStatus.PAST_DUE]: 'เกินกำหนดชำระ',
  [SubStatus.CANCELED]: 'ยกเลิกสมาชิกแล้ว',
  [SubStatus.EXPIRED]: 'หมดอายุ',
}

export const SUB_STATUS_EN: Record<SubStatus, string> = {
  [SubStatus.ACTIVE]: 'Active',
  [SubStatus.PAST_DUE]: 'Past Due',
  [SubStatus.CANCELED]: 'Subscription Cancelled',
  [SubStatus.EXPIRED]: 'Expired',
}

export const TRANSFER_STATUS_TH: Record<TransferStatus, string> = {
  [TransferStatus.PENDING]: 'รอการยืนยัน',
  [TransferStatus.ACCEPTED]: 'ยอมรับแล้ว',
  [TransferStatus.DECLINED]: 'ปฏิเสธแล้ว',
  [TransferStatus.EXPIRED]: 'หมดอายุ',
  [TransferStatus.CANCELLED]: 'ยกเลิกแล้ว',
}

export const TRANSFER_STATUS_EN: Record<TransferStatus, string> = {
  [TransferStatus.PENDING]: 'Pending Confirmation',
  [TransferStatus.ACCEPTED]: 'Accepted',
  [TransferStatus.DECLINED]: 'Declined',
  [TransferStatus.EXPIRED]: 'Expired',
  [TransferStatus.CANCELLED]: 'Cancelled',
}

export const PRODUCT_TYPE_TH: Record<ProductType, string> = {
  [ProductType.PHYSICAL]: 'สินค้าทั่วไป (Physical)',
  [ProductType.DIGITAL_LINK]: 'สินค้าดิจิทัลแบบลิงก์ (Digital Link)',
  [ProductType.DIGITAL_ITEM]: 'สินค้าดิจิทัลแบบไฟล์/คีย์ (Digital Item)',
  [ProductType.DIGITAL_SERVICE]: 'บริการเติมเกม/งานบริการ (Service)',
  [ProductType.AFFILIATE_LINK]:
    'สินค้าแอฟฟิลิเอต / ลิงก์ภายนอก (Affiliate Link)',
}

export const PRODUCT_TYPE_EN: Record<ProductType, string> = {
  [ProductType.PHYSICAL]: 'Physical Product',
  [ProductType.DIGITAL_LINK]: 'Digital Product (Link)',
  [ProductType.DIGITAL_ITEM]: 'Digital Product (File/Key)',
  [ProductType.DIGITAL_SERVICE]: 'Service / Game Top-up',
  [ProductType.AFFILIATE_LINK]: 'Affiliate / External Link Product',
}

export const PRODUCT_TYPE_OPTIONS = Object.entries(PRODUCT_TYPE_TH).map(
  ([value, label]) => ({
    value,
    label,
  }),
)

export const PRODUCT_TYPE_OPTIONS_EN = Object.entries(PRODUCT_TYPE_EN).map(
  ([value, label]) => ({
    value,
    label,
  }),
)

export const INVOICE_STATUS_TH: Record<InvoiceStatus, string> = {
  [InvoiceStatus.PAID]: 'ชำระแล้ว',
  [InvoiceStatus.UNPAID]: 'รอชำระ',
  [InvoiceStatus.FAILED]: 'ล้มเหลว',
  [InvoiceStatus.CANCELLED]: 'ยกเลิก',
}

export const INVOICE_STATUS_EN: Record<InvoiceStatus, string> = {
  [InvoiceStatus.PAID]: 'Paid',
  [InvoiceStatus.UNPAID]: 'Unpaid',
  [InvoiceStatus.FAILED]: 'Failed',
  [InvoiceStatus.CANCELLED]: 'Cancelled',
}

export const DEFAULT_ROLE_TH: Record<DefaultRole, string> = {
  [DefaultRole.OWNER]: 'เจ้าของร้าน',
  [DefaultRole.OWNER_VIEWER]: 'ผู้ตรวจสอบข้อมูล (อ่านได้อย่างเดียว)',
  [DefaultRole.MANAGER]: 'ผู้จัดการ',
  [DefaultRole.CASHIER]: 'แคชเชียร์ (POS)',
  [DefaultRole.STAFF]: 'พนักงานทั่วไป',
  [DefaultRole.POS_RESELLER]: 'ตัวแทนจำหน่าย',
  [DefaultRole.POS_CASHIER]: 'ร้านค้าฝากขาย (Consignment)',
  [DefaultRole.CONTENT_CREATOR]: 'ผู้สร้างคอนเทนต์',
  [DefaultRole.AUDITOR]: 'ผู้ตรวจสอบบัญชี/ภายใน',
  [DefaultRole.SUPPORT]: 'แอดมินดูแลลูกค้า',
  [DefaultRole.MARKETING]: 'นักการตลาด',
  [DefaultRole.FULFILLMENT]: 'พนักงานแพ็กของ/จัดส่ง',
}

export const DEFAULT_ROLE_EN: Record<DefaultRole, string> = {
  [DefaultRole.OWNER]: 'Store Owner',
  [DefaultRole.OWNER_VIEWER]: 'Viewer (Read-only)',
  [DefaultRole.MANAGER]: 'Manager',
  [DefaultRole.CASHIER]: 'Cashier (POS)',
  [DefaultRole.STAFF]: 'General Staff',
  [DefaultRole.POS_RESELLER]: 'Reseller',
  [DefaultRole.POS_CASHIER]: 'Consignment Partner',
  [DefaultRole.CONTENT_CREATOR]: 'Content Creator',
  [DefaultRole.AUDITOR]: 'Internal / Financial Auditor',
  [DefaultRole.SUPPORT]: 'Customer Support',
  [DefaultRole.MARKETING]: 'Marketing',
  [DefaultRole.FULFILLMENT]: 'Packing / Shipping Staff',
}

export const DEFAULT_ROLE_OPTIONS = Object.entries(DEFAULT_ROLE_TH).map(
  ([value, label]) => ({
    value,
    label,
  }),
)

export const DEFAULT_ROLE_OPTIONS_EN = Object.entries(DEFAULT_ROLE_EN).map(
  ([value, label]) => ({
    value,
    label,
  }),
)

export const EXPENSE_CATEGORY_TH: Record<ExpenseCategory, string> = {
  [ExpenseCategory.UTILITIES]: 'ค่าน้ำ/ค่าไฟ/อินเทอร์เน็ต',
  [ExpenseCategory.RENT]: 'ค่าเช่าสถานที่',
  [ExpenseCategory.SALARY]: 'เงินเดือน/ค่าจ้าง',
  [ExpenseCategory.SUPPLIES]: 'อุปกรณ์/วัตถุดิบ',
  [ExpenseCategory.MARKETING]: 'การตลาด/โฆษณา',
  [ExpenseCategory.MAINTENANCE]: 'ซ่อมแซม/บำรุงรักษา',
  [ExpenseCategory.TRANSPORT]: 'ค่าเดินทาง/ขนส่ง',
  [ExpenseCategory.OTHER]: 'อื่นๆ',
}

export const EXPENSE_CATEGORY_EN: Record<ExpenseCategory, string> = {
  [ExpenseCategory.UTILITIES]: 'Utilities (Water/Electricity/Internet)',
  [ExpenseCategory.RENT]: 'Rent',
  [ExpenseCategory.SALARY]: 'Salary / Wages',
  [ExpenseCategory.SUPPLIES]: 'Supplies / Materials',
  [ExpenseCategory.MARKETING]: 'Marketing / Advertising',
  [ExpenseCategory.MAINTENANCE]: 'Maintenance / Repair',
  [ExpenseCategory.TRANSPORT]: 'Travel / Transportation',
  [ExpenseCategory.OTHER]: 'Other',
}

export const EXPENSE_CATEGORY_OPTIONS = Object.entries(EXPENSE_CATEGORY_TH).map(
  ([value, label]) => ({
    value,
    label,
  }),
)

export const EXPENSE_CATEGORY_OPTIONS_EN = Object.entries(
  EXPENSE_CATEGORY_EN,
).map(([value, label]) => ({
  value,
  label,
}))

export const getLabel = {
  orderStatus: (v: OrderStatus, locale: 'th' | 'en' = 'th') =>
    locale === 'en' ? ORDER_STATUS_EN[v] || v : ORDER_STATUS_TH[v] || v,
  paymentMethod: (v: PaymentMethod, locale: 'th' | 'en' = 'th') =>
    locale === 'en' ? PAYMENT_METHOD_EN[v] || v : PAYMENT_METHOD_TH[v] || v,
  discountType: (v: DiscountType, locale: 'th' | 'en' = 'th') =>
    locale === 'en' ? DISCOUNT_TYPE_EN[v] || v : DISCOUNT_TYPE_TH[v] || v,
  actorType: (v: ActorType, locale: 'th' | 'en' = 'th') =>
    locale === 'en' ? ACTOR_TYPE_EN[v] || v : ACTOR_TYPE_TH[v] || v,
  addressType: (v: AddressType, locale: 'th' | 'en' = 'th') =>
    locale === 'en' ? ADDRESS_TYPE_EN[v] || v : ADDRESS_TYPE_TH[v] || v,
  plan: (v: Plan, locale: 'th' | 'en' = 'th') =>
    locale === 'en' ? PLAN_EN[v] || v : PLAN_TH[v] || v,
  logAction: (v: LogAction, locale: 'th' | 'en' = 'th') =>
    locale === 'en' ? LOG_ACTION_EN[v] || v : LOG_ACTION_TH[v] || v,
  transactionType: (v: TransactionType, locale: 'th' | 'en' = 'th') =>
    locale === 'en' ? TRANSACTION_TYPE_EN[v] || v : TRANSACTION_TYPE_TH[v] || v,
  subStatus: (v: SubStatus, locale: 'th' | 'en' = 'th') =>
    locale === 'en' ? SUB_STATUS_EN[v] || v : SUB_STATUS_TH[v] || v,
  transferStatus: (v: TransferStatus, locale: 'th' | 'en' = 'th') =>
    locale === 'en' ? TRANSFER_STATUS_EN[v] || v : TRANSFER_STATUS_TH[v] || v,
  productType: (v: ProductType, locale: 'th' | 'en' = 'th') =>
    locale === 'en' ? PRODUCT_TYPE_EN[v] || v : PRODUCT_TYPE_TH[v] || v,
  invoiceStatus: (v: InvoiceStatus, locale: 'th' | 'en' = 'th') =>
    locale === 'en' ? INVOICE_STATUS_EN[v] || v : INVOICE_STATUS_TH[v] || v,
  defaultRole: (v: DefaultRole, locale: 'th' | 'en' = 'th') =>
    locale === 'en' ? DEFAULT_ROLE_EN[v] || v : DEFAULT_ROLE_TH[v] || v,
  expenseCategory: (v: ExpenseCategory, locale: 'th' | 'en' = 'th') =>
    locale === 'en' ? EXPENSE_CATEGORY_EN[v] || v : EXPENSE_CATEGORY_TH[v] || v,
}
