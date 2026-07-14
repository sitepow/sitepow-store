import {
  ActorType,
  AddressType,
  CustomerType,
  DeliveryStatus,
  DiscountType,
  InvoiceStatus,
  LogAction,
  OrderStatus,
  PaymentMethod,
  Plan,
  ProductType,
  StaffRole,
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

export const STOCK_ADJUSTMENT_REASON_OPTIONS = Object.entries(
  STOCK_ADJUSTMENT_TH,
).map(([value, label]) => ({ value, label }))

export const ORDER_STATUS_TH: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'รอชำระเงิน',
  [OrderStatus.PAID]: 'ชำระเงินแล้ว',
  [OrderStatus.SHIPPED]: 'จัดส่งแล้ว',
  [OrderStatus.COMPLETED]: 'สำเร็จ',
  [OrderStatus.CANCELLED]: 'ยกเลิก',
}

export const PAYMENT_METHOD_TH: Record<PaymentMethod, string> = {
  [PaymentMethod.TRANSFER]: 'โอนเงินผ่านธนาคาร',
  [PaymentMethod.QR_PROMPTPAY]: 'พร้อมเพย์ (QR)',
  [PaymentMethod.CREDIT_CARD]: 'บัตรเครดิต/เดบิต',
  [PaymentMethod.CASH_ON_DELIVERY]: 'เก็บเงินปลายทาง',
}

export const DISCOUNT_TYPE_TH: Record<DiscountType, string> = {
  [DiscountType.PERCENTAGE]: 'เปอร์เซ็นต์ (%)',
  [DiscountType.FIXED]: 'จำนวนเงินคงที่ (บาท)',
}

export const CUSTOMER_TYPE_TH: Record<CustomerType, string> = {
  [CustomerType.INDIVIDUAL]: 'บุคคลธรรมดา',
  [CustomerType.CORPORATION]: 'นิติบุคคล/บริษัท',
}

export const ACTOR_TYPE_TH: Record<ActorType, string> = {
  [ActorType.SYSTEM]: 'ระบบอัตโนมัติ',
  [ActorType.SUPER_ADMIN]: 'ผู้ดูแลระบบแพลตฟอร์ม',
  [ActorType.MERCHANT]: 'ร้านค้า/พนักงาน',
}

export const STAFF_ROLE_TH: Record<StaffRole, string> = {
  [StaffRole.ADMIN]: 'ผู้ดูแลระบบร้าน',
  [StaffRole.MANAGER]: 'ผู้จัดการ',
  [StaffRole.CASHIER]: 'พนักงานขายหน้าร้าน',
}

export const DELIVERY_STATUS_TH: Record<DeliveryStatus, string> = {
  [DeliveryStatus.PENDING]: 'เตรียมพัสดุ',
  [DeliveryStatus.BOOKED]: 'ออกเลขพัสดุแล้ว',
  [DeliveryStatus.PICKING_UP]: 'รอขนส่งเข้ารับ',
  [DeliveryStatus.IN_TRANSIT]: 'กำลังจัดส่ง',
  [DeliveryStatus.DELIVERED]: 'ส่งถึงบ้านแล้ว',
  [DeliveryStatus.RETURNED]: 'พัสดุถูกตีกลับ',
  [DeliveryStatus.FAILED]: 'การจัดส่งล้มเหลว',
}

export const ADDRESS_TYPE_TH: Record<AddressType, string> = {
  [AddressType.SHIPPING]: 'ที่อยู่จัดส่ง',
  [AddressType.TAX]: 'ที่อยู่ใบกำกับภาษี',
  [AddressType.BOTH]: 'ที่อยู่จัดส่งและใบกำกับภาษี',
}

export const PLAN_TH: Record<Plan, string> = {
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
  [LogAction.MANAGE_STAFF]: 'จัดการพนักงาน',
  [LogAction.TRANSFER_STORE]: 'โอนความเป็นเจ้าของร้านให้ผู้อื่น',
  [LogAction.LOGIN]: 'เข้าสู่ระบบ',
  [LogAction.LOGOUT]: 'ออกจากระบบ',
}

export const TRANSACTION_TYPE_TH: Record<TransactionType, string> = {
  [TransactionType.CREDIT_PURCHASE]: 'ซื้อเครดิต',
  [TransactionType.AI_USAGE]: 'ค่าใช้งาน AI',
  [TransactionType.SLIP_VERIFY]: 'ค่าบริการตรวจสลิป',
  [TransactionType.REFUND]: 'คืนเครดิต',
}

export const SUB_STATUS_TH: Record<SubStatus, string> = {
  [SubStatus.ACTIVE]: 'ปกติ',
  [SubStatus.PAST_DUE]: 'เกินกำหนดชำระ',
  [SubStatus.CANCELED]: 'ยกเลิกสมาชิกแล้ว',
  [SubStatus.EXPIRED]: 'หมดอายุ',
}

export const TRANSFER_STATUS_TH: Record<TransferStatus, string> = {
  [TransferStatus.PENDING]: 'รอการยืนยัน',
  [TransferStatus.ACCEPTED]: 'ยอมรับแล้ว',
  [TransferStatus.DECLINED]: 'ปฏิเสธแล้ว',
  [TransferStatus.EXPIRED]: 'หมดอายุ',
  [TransferStatus.CANCELLED]: 'ยกเลิกแล้ว',
}

export const PRODUCT_TYPE_TH: Record<ProductType, string> = {
  [ProductType.PHYSICAL]: 'สินค้าทั่วไป (Physical)',
  [ProductType.DIGITAL_LINK]: 'สินค้าดิจิทัลแบบลิงก์ (Digital Link)',
  [ProductType.DIGITAL_ITEM]: 'สินค้าดิจิทัลแบบไฟล์/คีย์ (Digital Item)',
  [ProductType.DIGITAL_SERVICE]: 'บริการเติมเกม/งานบริการ (Service)',
}

export const PRODUCT_TYPE_OPTIONS = Object.entries(PRODUCT_TYPE_TH).map(
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

export const getLabel = {
  orderStatus: (v: OrderStatus) => ORDER_STATUS_TH[v] || v,
  paymentMethod: (v: PaymentMethod) => PAYMENT_METHOD_TH[v] || v,
  discountType: (v: DiscountType) => DISCOUNT_TYPE_TH[v] || v,
  customerType: (v: CustomerType) => CUSTOMER_TYPE_TH[v] || v,
  actorType: (v: ActorType) => ACTOR_TYPE_TH[v] || v,
  staffRole: (v: StaffRole) => STAFF_ROLE_TH[v] || v,
  deliveryStatus: (v: DeliveryStatus) => DELIVERY_STATUS_TH[v] || v,
  addressType: (v: AddressType) => ADDRESS_TYPE_TH[v] || v,
  plan: (v: Plan) => PLAN_TH[v] || v,
  logAction: (v: LogAction) => LOG_ACTION_TH[v] || v,
  transactionType: (v: TransactionType) => TRANSACTION_TYPE_TH[v] || v,
  subStatus: (v: SubStatus) => SUB_STATUS_TH[v] || v,
  transferStatus: (v: TransferStatus) => TRANSFER_STATUS_TH[v] || v,
  productType: (v: ProductType) => PRODUCT_TYPE_TH[v] || v,
  invoiceStatus: (v: InvoiceStatus) => INVOICE_STATUS_TH[v] || v,
}
