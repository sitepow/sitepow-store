import z from 'zod'

export const createBranchSchema = z.object({
  name: z.string().min(2, { message: 'ชื่อสาขาต้องระบุอย่างน้อย 2 ตัวอักษร' }),
})

export type CreateBranchFormValues = z.input<typeof createBranchSchema>
