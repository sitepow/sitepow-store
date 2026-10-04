import { DefaultRole } from '@/generated/prisma/enums'
import { z } from 'zod'

export const createRoleSchema = z.object({
  name: z.nativeEnum(DefaultRole, {
    message: 'กรุณาระบุชื่อบทบาท',
  }),
})

export type CreateRoleFormValues = z.infer<typeof createRoleSchema>

export interface CreateRoleInput extends CreateRoleFormValues {
  storeId: string
}
