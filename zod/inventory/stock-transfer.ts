import z from 'zod'

export const createStockTransferSchema = z
  .object({
    variantId: z.string().min(1, { message: 'กรุณาเลือกสินค้า' }),
    fromBranchId: z.string().min(1, { message: 'กรุณาเลือกสาขาต้นทาง' }),
    toBranchId: z.string().min(1, { message: 'กรุณาเลือกสาขาปลายทาง' }),
    quantity: z
      .number({ message: 'กรุณาระบุจำนวน' })
      .int({ message: 'จำนวนต้องเป็นจำนวนเต็ม' })
      .min(1, { message: 'จำนวนต้องมากกว่า 0' }),
    note: z.string().optional().or(z.literal('')),
  })
  .refine((data) => data.fromBranchId !== data.toBranchId, {
    message: 'สาขาต้นทางและปลายทางต้องไม่เป็นสาขาเดียวกัน',
    path: ['toBranchId'],
  })

export type CreateStockTransferFormValues = z.input<
  typeof createStockTransferSchema
>
