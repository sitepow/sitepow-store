import { UserRole } from '@/generated/prisma/enums'

interface AuthUrlProps {
  path: string
  role: UserRole
  callbackUrl?: string
}

export const getAuthUrl = ({ path, role, callbackUrl }: AuthUrlProps) => {
  const returnUrl = typeof window !== 'undefined' ? window.location.href : ''

  const baseUrl = process.env.NEXT_PUBLIC_NEXTAUTH_URL || ''
  const cleanBaseUrl = baseUrl.replace(/\/$/, '')

  return `${cleanBaseUrl}/${path}?callbackUrl=${encodeURIComponent(callbackUrl ? callbackUrl : returnUrl)}&role=${role}`
}
