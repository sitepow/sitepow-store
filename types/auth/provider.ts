import { ReactNode } from 'react'

export interface LoginProvide {
  id: string
  icon: ReactNode
}

export interface RegisterProvide {
  id: string
  icon: ReactNode
  name?: string
}
