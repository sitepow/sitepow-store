import { StockAdjustmentReason } from '@/generated/prisma/enums'
import z from 'zod'

export const createStockAdjustmentSchema = z.object({
  variantId: z.string().min(1, { message: 'กรุณาเลือกสินค้า' }),
  branchId: z.string().min(1, { message: 'กรุณาเลือกสาขา' }),
  quantity: z
    .number({ message: 'กรุณาระบุจำนวน' })
    .int({ message: 'จำนวนต้องเป็นจำนวนเต็ม' })
    .refine((v) => v !== 0, { message: 'จำนวนต้องไม่เป็น 0' }),
  reason: z.enum(
    Object.values(StockAdjustmentReason) as [string, ...string[]],
    { message: 'กรุณาเลือกเหตุผล' },
  ),
  note: z.string().optional().or(z.literal('')),
})

export type CreateStockAdjustmentFormValues = z.input<
  typeof createStockAdjustmentSchema
>
