import { FORBIDDEN_TITLES } from '@/constants/system'
import z from 'zod'

export const createCustomerSchema = z.object({
  storeId: z.string(),
  firstName: z
    .string()
    .min(1, 'กรุณากรอกชื่อ')
    .refine(
      (val) => {
        const trimmed = val.trim()
        return !FORBIDDEN_TITLES.some((title) => trimmed.startsWith(title))
      },
      {
        message: 'ห้ามใส่คำนำหน้า (เช่น นาย, นาง, นางสาว) กรุณากรอกเฉพาะชื่อ',
      },
    ),
  lastName: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true
        const trimmed = val.trim()
        return !FORBIDDEN_TITLES.some((title) => trimmed.startsWith(title))
      },
      {
        message: 'ห้ามใส่คำนำหน้า กรุณากรอกเฉพาะนามสกุล',
      },
    ),
  phone: z
    .string()
    .min(1, 'กรุณากรอกเบอร์โทรศัพท์')
    .regex(/^[0-9\-\+]{9,15}$/, 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง'),
  email: z.email('รูปแบบอีเมลไม่ถูกต้อง').optional().or(z.literal('')),
})

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>

export const searchCustomerSchema = z.object({
  query: z.string().min(1, 'กรุณากรอกเบอร์โทรศัพท์ อีเมล หรือ รหัสสมาชิก'),
})

export type SearchCustomerInput = z.infer<typeof searchCustomerSchema>
