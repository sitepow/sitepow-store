import { ReactNode } from 'react'

import { UserRole } from '@/generated/prisma/enums'

export interface RegisterProvide {
  id: string
  icon: ReactNode
  name?: string
}

export interface RegisterFormInputs {
  email: string
  password: string
  confirmPassword?: string
  userRole: UserRole
}
