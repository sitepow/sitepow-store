import { ReactNode } from 'react'

export interface RegisterProvide {
  id: string
  icon: ReactNode
  name?: string
}

export interface RegisterFormInputs {
  email: string
  password: string
  confirmPassword?: string
}
