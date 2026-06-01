import { StockAdjustmentReason } from '@/generated/prisma/enums'

export const STOCK_ADJUSTMENT_REASONS: Record<StockAdjustmentReason, string> = {
  [StockAdjustmentReason.DAMAGED]: 'สินค้าเสียหาย',
  [StockAdjustmentReason.LOST]: 'สินค้าสูญหาย',
  [StockAdjustmentReason.EXPIRED]: 'สินค้าหมดอายุ',
  [StockAdjustmentReason.CORRECTION]: 'แก้ไขข้อมูลสต็อก',
  [StockAdjustmentReason.PROMOTION]: 'ใช้เพื่อโปรโมชัน/ของแถม',
  [StockAdjustmentReason.OTHER]: 'อื่นๆ',
}

export const STOCK_ADJUSTMENT_REASON_OPTIONS = Object.entries(
  STOCK_ADJUSTMENT_REASONS,
).map(([value, label]) => ({ value, label }))
