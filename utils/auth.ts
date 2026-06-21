import { UserRole } from '@/generated/prisma/enums'

interface AuthUrlProps {
  path: string
  role: UserRole
  callbackUrl?: string
}

export const getClientAuthUrl = ({ path, role, callbackUrl }: AuthUrlProps) => {
  const hostname = window.location.hostname

  const isProd = hostname.includes('sitepow.store')

  const baseUrl = isProd
    ? 'https://accounts.sitepow.store'
    : `http://accounts.lvh.me:${window.location.port || '3000'}`

  return `${baseUrl}/${path}?callbackUrl=${encodeURIComponent(callbackUrl || '')}&role=${role}`
}
