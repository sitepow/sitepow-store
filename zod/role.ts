import { PermissionRole } from '@/generated/prisma/enums'
import { z } from 'zod'

export const createRoleSchema = z.object({
  name: z.nativeEnum(PermissionRole, {
    message: 'กรุณาระบุชื่อบทบาท',
  }),
  description: z.string().optional(),
})

export type CreateRoleFormValues = z.infer<typeof createRoleSchema>

export interface CreateRoleInput extends CreateRoleFormValues {
  storeId: string
}
