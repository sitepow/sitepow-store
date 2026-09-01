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

  let targetOrigin = window.location.origin

  if (!hostname.includes('.') && !isDev) {
    targetOrigin = 'https://sitepow.store'
  }

  const currentPathAndSearch = `${window.location.pathname}${window.location.search}`
  const defaultCallbackUrl = `${targetOrigin}${currentPathAndSearch}`

  const finalCallbackUrl = callbackUrl || defaultCallbackUrl

  return `${baseUrl}/${path}?callbackUrl=${encodeURIComponent(finalCallbackUrl)}&role=${role}`
}
