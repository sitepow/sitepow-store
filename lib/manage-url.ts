export function getManageUrl(path = '/merchant/dashboard'): string {
  const isProd = process.env.NODE_ENV === 'production'
  const cleanPath = path.startsWith('/') ? path : `/${path}`

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    const port = window.location.port ? `:${window.location.port}` : ''

    if (
      hostname === 'manage.sitepow.store' ||
      hostname === 'manage.lvh.me' ||
      hostname.startsWith('manage.')
    ) {
      return cleanPath
    }

    if (isProd || hostname.endsWith('sitepow.store')) {
      return `https://manage.sitepow.store${cleanPath}`
    }

    return `http://manage.lvh.me${port || ':3000'}${cleanPath}`
  }

  if (isProd) {
    return `https://manage.sitepow.store${cleanPath}`
  }
  return `http://manage.lvh.me:3000${cleanPath}`
}
