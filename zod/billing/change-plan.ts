import { Plan } from '@/generated/prisma/enums'
import z from 'zod'

export const changePlanSchema = z.object({
  plan: z.enum(Plan, { message: 'กรุณาเลือกแพลน' }),
})

export type ChangePlanFormValues = z.infer<typeof changePlanSchema>
