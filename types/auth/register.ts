import { UserRole } from '@/generated/prisma/enums'

export interface RegisterFormInputs {
  email: string
  password: string
  confirmPassword?: string
  userRole: UserRole
}
