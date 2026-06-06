import { StaffRole } from '@/generated/prisma/enums'
import z from 'zod'

const staffBaseSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'ชื่อพนักงานต้องระบุอย่างน้อย 2 ตัวอักษร' }),
  role: z.enum(StaffRole, { message: 'กรุณาเลือกบทบาทพนักงาน' }),
  branchIds: z.array(z.string()).default([]),
})

export const createStaffSchema = staffBaseSchema.extend({
  email: z.email({ message: 'รูปแบบอีเมลไม่ถูกต้อง' }),
})

export const updateStaffSchema = staffBaseSchema

export type CreateStaffFormValues = z.input<typeof createStaffSchema>
export type UpdateStaffFormValues = z.input<typeof updateStaffSchema>
