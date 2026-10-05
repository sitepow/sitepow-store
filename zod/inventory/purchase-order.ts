import z from 'zod'

export const purchaseOrderItemSchema = z.object({
  productId: z.string().optional().nullable(),
  variantId: z.string().optional().nullable(),
  title: z.string().min(1, { message: 'กรุณาระบุชื่อสินค้า' }),
  variantTitle: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  quantity: z
    .number({ message: 'กรุณาระบุจำนวน' })
    .int()
    .min(1, { message: 'จำนวนต้องไม่ต่ำกว่า 1' }),
  costPrice: z.number().min(0).optional().nullable(),
  unit: z.string().default('ชิ้น'),
})

export const createPurchaseOrderSchema = z.object({
  storeId: z.string().min(1, { message: 'กรุณาระบุร้านค้า' }),
  title: z.string().optional().nullable(),
  supplier: z.string().optional().nullable(),
  buyerName: z.string().optional().nullable(),
  targetDate: z.string().or(z.date()).optional().nullable(),
  note: z.string().optional().nullable(),
  items: z.array(purchaseOrderItemSchema).min(1, {
    message: 'กรุณาเลือกสินค้าอย่างน้อย 1 รายการ',
  }),
})

export type CreatePurchaseOrderFormValues = z.input<
  typeof createPurchaseOrderSchema
>
export type PurchaseOrderItemFormValues = z.input<
  typeof purchaseOrderItemSchema
>

