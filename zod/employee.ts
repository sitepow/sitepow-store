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
    .min(2, { message: 'ชื่อพนักงานต้องระบุอย่างน้อย 2 ตัวอักษร' }),
  assignments: z
    .array(assignmentSchema)
    .min(1, { message: 'กรุณากำหนดอย่างน้อย 1 สาขา' }),
})

export const createEmployeeSchema = employeeBaseSchema.extend({
  email: z.email({ message: 'รูปแบบอีเมลไม่ถูกต้อง' }),
})

export const updateEmployeeSchema = employeeBaseSchema

export type CreateEmployeeFormValues = z.input<typeof createEmployeeSchema>
