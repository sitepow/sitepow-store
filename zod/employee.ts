import { FORBIDDEN_TITLES, THAI_NAME_REGEX } from '@/constants/system'
import { z } from 'zod'

const assignmentSchema = z.object({
  branchId: z
    .string({ message: 'กรุณาเลือกสาขา' })
    .min(1, { message: 'กรุณาเลือกสาขา' }),
  roleId: z
    .string({ message: 'กรุณาเลือกบทบาทพนักงาน' })
    .min(1, { message: 'กรุณาเลือกบทบาทพนักงาน' }),
  permissionIds: z.array(z.string()).default([]),
})

const employeeBaseSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'กรุณาระบุชื่อพนักงาน' })
    .refine(
      (val) => {
        const trimmed = val.trim()
        return THAI_NAME_REGEX.test(trimmed)
      },
      {
        message: 'กรุณากรอกชื่อเป็นภาษาไทยเท่านั้น',
      },
    )
    .refine(
      (val) => {
        const trimmed = val.trim()
        return !FORBIDDEN_TITLES.some((title) => trimmed.startsWith(title))
      },
      {
        message:
          'ห้ามใส่คำนำหน้า (เช่น นาย, นาง, นางสาว, บริษัท) กรุณากรอกเฉพาะ ชื่อ-นามสกุล',
      },
    ),
  assignments: z
    .array(assignmentSchema)
    .min(1, { message: 'กรุณากำหนดอย่างน้อย 1 สาขา' }),
})

export const createEmployeeSchema = employeeBaseSchema.extend({
  email: z.email({ message: 'รูปแบบอีเมลไม่ถูกต้อง' }),
})

export const updateEmployeeSchema = employeeBaseSchema

export type CreateEmployeeFormValues = z.input<typeof createEmployeeSchema>
