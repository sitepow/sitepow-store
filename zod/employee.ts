import { z } from 'zod'

const employeeBaseSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'ชื่อพนักงานต้องระบุอย่างน้อย 2 ตัวอักษร' }),
  roleId: z
    .string({ message: 'กรุณาเลือกบทบาทพนักงาน' })
    .min(1, { message: 'กรุณาเลือกบทบาทพนักงาน' }),
  branchIds: z.array(z.string()).default([]),
  permissionIds: z.array(z.string()).default([]),
})

export const createEmployeeSchema = employeeBaseSchema.extend({
  email: z.email({ message: 'รูปแบบอีเมลไม่ถูกต้อง' }),
})

export const updateEmployeeSchema = employeeBaseSchema

export type CreateEmployeeFormValues = z.input<typeof createEmployeeSchema>
