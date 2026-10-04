import { z } from 'zod'

export const taxSettingSchema = z.object({
  isVatRegistered: z.boolean(),
  vatRate: z.string().refine(
    (val) => {
      const num = parseFloat(val)
      return !isNaN(num) && num >= 0 && num <= 100
    },
    { message: 'อัตราภาษีต้องอยู่ระหว่าง 0-100' },
  ),
  taxId: z
    .string()
    .min(13, 'เลขผู้เสียภาษีต้องมี 13 หลัก')
    .max(13, 'เลขผู้เสียภาษีต้องมี 13 หลัก')
    .optional()
    .or(z.literal('')),
})

export type TaxSettingFormValues = z.infer<typeof taxSettingSchema>
