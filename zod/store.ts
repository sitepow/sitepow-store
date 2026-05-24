import { Plan } from '@/generated/prisma/enums'
import z from 'zod'

export const createStoreSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'ชื่อร้านค้าต้องระบุอย่างน้อย 2 ตัวอักษร' }),
  slug: z
    .string()
    .min(3, { message: 'URL Slug ต้องระบุอย่างน้อย 3 ตัวอักษร' })
    .regex(/^[a-zA-Z0-9-ก-๙]+$/, {
      message: 'URL ต้องประกอบด้วยตัวอักษร ตัวเลข หรือเครื่องหมายขีดเท่านั้น',
    }),
  description: z.string().optional().or(z.literal('')),
  phone: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || /^[0-9]{9,10}$/.test(val), {
      message: 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 9-10 หลัก',
    }),
  lineId: z.string().optional().or(z.literal('')),
  taxId: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || val.length === 13, {
      message: 'เลขผู้เสียภาษีต้องมีความยาว 13 หลักพอดี',
    }),
  plan: z.enum(Plan),
})

export type CreateStoreFormValues = z.infer<typeof createStoreSchema>
