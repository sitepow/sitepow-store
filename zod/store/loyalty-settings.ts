import z from 'zod'

export const updateLoyaltySettingsSchema = z
  .object({
    isPointsEnabled: z.boolean(),
    pointEarningRate: z
      .number({ message: 'กรุณาระบุยอดซื้อต่อ 1 แต้ม' })
      .positive({ message: 'ต้องมากกว่า 0' })
      .optional()
      .nullable(),
    pointRedeemRate: z
      .number({ message: 'กรุณาระบุมูลค่าต่อ 1 แต้ม' })
      .positive({ message: 'ต้องมากกว่า 0' })
      .optional()
      .nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.isPointsEnabled) {
      if (!data.pointEarningRate || data.pointEarningRate <= 0) {
        ctx.addIssue({
          code: 'custom',
          message: 'กรุณาระบุยอดซื้อเพื่อรับแต้ม',
          path: ['pointEarningRate'],
        })
      }
      if (!data.pointRedeemRate || data.pointRedeemRate <= 0) {
        ctx.addIssue({
          code: 'custom',
          message: 'กรุณาระบุมูลค่าส่วนลดต่อแต้ม',
          path: ['pointRedeemRate'],
        })
      }
    }
  })

export type UpdateLoyaltySettingsFormValues = z.infer<
  typeof updateLoyaltySettingsSchema
>
