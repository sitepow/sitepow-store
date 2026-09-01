import { UserRole } from '@/generated/prisma/enums'

interface AuthUrlProps {
  path: string
  role: UserRole
  callbackUrl?: string
}

export const getClientAuthUrl = ({ path, role, callbackUrl }: AuthUrlProps) => {
  if (typeof window === 'undefined') return '#'

  const { hostname, port, pathname, search } = window.location
  const isDev = hostname.includes('lvh.me') || hostname.includes('localhost')

  const baseUrl = isDev
    ? `http://accounts.lvh.me:${port || '3000'}`
    : 'https://accounts.sitepow.store'

  const currentOrigin = `${window.location.protocol}//${window.location.host}`
  const defaultCallbackUrl = `${currentOrigin}${pathname}${search}`

  const finalCallbackUrl = callbackUrl || defaultCallbackUrl

  return `${baseUrl}/${path}?callbackUrl=${encodeURIComponent(finalCallbackUrl)}&role=${role}`
}
