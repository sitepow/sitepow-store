import { ExpenseCategory } from '@/generated/prisma/enums'
import { z } from 'zod'

export const createExpenseSchema = z.object({
  storeId: z.string().min(1, { message: 'กรุณาระบุร้านค้า' }),
  branchId: z.string().optional().nullable(),
  title: z.string().min(1, { message: 'กรุณากรอกรายการค่าใช้จ่าย' }),
  amount: z
    .number({ message: 'กรุณากรอกจำนวนเงิน' })
    .positive({ message: 'จำนวนเงินต้องมากกว่า 0' }),
  category: z.enum(ExpenseCategory, {
    message: 'กรุณาเลือกหมวดหมู่ค่าใช้จ่าย',
  }),
  receiptImage: z.any().optional(),
  expenseDate: z.string().min(1, { message: 'กรุณาระบุวันที่จ่าย' }),
  note: z.string().optional().nullable(),
})

export const updateExpenseSchema = createExpenseSchema
  .omit({ storeId: true })
  .partial()
  .extend({
    id: z.string().min(1, { message: 'กรุณาระบุ ID ค่าใช้จ่าย' }),
    storeId: z.string().min(1, { message: 'กรุณาระบุร้านค้า' }),
  })

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>
export type ExpenseFormValues = CreateExpenseInput
