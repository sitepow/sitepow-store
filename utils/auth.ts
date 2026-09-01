import { UserRole } from '@/generated/prisma/enums'

interface AuthUrlProps {
  path: string
  role: UserRole
  callbackUrl?: string
}

export const getClientAuthUrl = ({ path, role, callbackUrl }: AuthUrlProps) => {
  if (typeof window === 'undefined') return '#'

  const hostname = window.location.hostname

  const isDev = hostname.includes('lvh.me') || hostname.includes('localhost')

  const baseUrl = isDev
    ? `http://accounts.lvh.me:${window.location.port || '3000'}`
    : 'https://accounts.sitepow.store'

  const finalCallbackUrl = callbackUrl || window.location.href

  return `${baseUrl}/${path}?callbackUrl=${encodeURIComponent(finalCallbackUrl)}&role=${role}`
}
