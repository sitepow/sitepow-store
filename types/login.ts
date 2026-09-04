import { ReactNode } from 'react'

export interface LoginProvide {
  id: string
  icon: ReactNode
  name?: string
}
export interface LoginFormInputs {
  email: string
  password: string
}
