import { z } from 'zod'

export const depositSchema = z.object({
  amount: z
    .number('กรุณากรอกจำนวนเงิน')
    .min(20, 'จำนวนเงินขั้นต่ำ 20 บาท')
    .max(1_000_000, 'จำนวนเงินสูงสุด 1,000,000 บาท'),
  description: z.string().optional(),
})

export type DepositSchema = z.infer<typeof depositSchema>
