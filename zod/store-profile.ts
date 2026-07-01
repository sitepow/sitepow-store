import z from 'zod'

export const storeProfileSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'ชื่อร้านค้าต้องระบุอย่างน้อย 2 ตัวอักษร' }),
  slug: z
    .string()
    .min(3, { message: 'URL Slug ต้องระบุอย่างน้อย 3 ตัวอักษร' })
    .regex(/^[a-zA-Z0-9-]+$/, {
      message: 'URL ต้องประกอบด้วยตัวอักษร ตัวเลข หรือเครื่องหมายขีดเท่านั้น',
    }),
  email: z.email({ message: 'รูปแบบอีเมลไม่ถูกต้อง' }).or(z.literal('')),
  taxId: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || val.length === 13, {
      message: 'เลขผู้เสียภาษีต้องมี 13 หลักพอดี',
    }),
  logo: z.any().optional(),
  description: z.string().optional(),
})

export type StoreProfileFormValues = z.infer<typeof storeProfileSchema>
