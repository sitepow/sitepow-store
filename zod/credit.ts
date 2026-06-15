import { z } from 'zod'

export const purchaseCreditSchema = z.object({
  amount: z
    .number('กรุณากรอกจำนวนเงินเป็นตัวเลข')
    .min(50, 'ซื้อเครดิตขั้นต่ำ 50 บาท')
    .max(1_000_000, 'จำนวนเงินสูงสุด 1,000,000 บาท'),

  description: z
    .string()
    .max(100, 'หมายเหตุต้องไม่เกิน 100 ตัวอักษร')
    .optional(),
})

export type PurchaseCreditSchema = z.infer<typeof purchaseCreditSchema>
