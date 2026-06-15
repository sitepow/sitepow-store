import { z } from 'zod'

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'กรุณากรอกชื่อจริง'),
  lastName: z.string().min(1, 'กรุณากรอกนามสกุล'),
  phone: z
    .string()
    .regex(/^(0[689]\d{8}|0[2-9]\d{7})$/, 'เบอร์โทรศัพท์ไม่ถูกต้อง')
    .optional()
    .or(z.literal('')),
})

export const updateBuyerProfileSchema = z.object({
  firstName: z.string().min(1, 'กรุณากรอกชื่อจริง'),
  lastName: z.string().min(1, 'กรุณากรอกนามสกุล'),
  phone: z
    .string()
    .regex(/^(0[689]\d{8}|0[2-9]\d{7})$/, 'เบอร์โทรศัพท์ไม่ถูกต้อง')
    .min(9, 'เบอร์โทรศัพท์ควรมีความยาวอย่างน้อย 9 หลัก'),
})

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>
export type UpdateBuyerProfileSchema = z.infer<typeof updateBuyerProfileSchema>
