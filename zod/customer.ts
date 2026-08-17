import { FORBIDDEN_TITLES } from '@/constants/system'
import z from 'zod'

export const createCustomerSchema = z.object({
  storeId: z.string().optional(),
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
    .transform((val) => val.replace(/\D/g, ''))
    .pipe(
      z.string().refine((val) => /^[0-9]{9,10}$/.test(val), {
        message: 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 9-10 หลัก',
      }),
    ),
  email: z.email('รูปแบบอีเมลไม่ถูกต้อง').optional().or(z.literal('')),
})

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>

export const searchCustomerSchema = z.object({
  query: z.string().min(1, 'กรุณากรอกเบอร์โทรศัพท์ อีเมล หรือ รหัสสมาชิก'),
})

export type SearchCustomerInput = z.infer<typeof searchCustomerSchema>
