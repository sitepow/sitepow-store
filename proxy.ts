// import createIntlMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'

import { UserRole } from './generated/prisma/enums'
// import { routing } from './i18n/routing'
import { getCurrentUser } from './lib/auth-server'

// const intlMiddleware = createIntlMiddleware(routing)

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!_next|_static|[\\w-]+\\.(?:ico|png|jpg|jpeg|avif|svg|css|js|map|json|txt|webmanifest)).*)',
  ],
}

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl
  const host = req.headers.get('host') || ''

  if (url.pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  const hostname = host
    .replace(/^www\./, '')
    .split(':')[0]
    .toLowerCase()

  if (
    url.pathname.match(
      /\.(?:ico|png|jpg|jpeg|avif|svg|css|js|map|json|txt|webmanifest)$/,
    )
  ) {
    return NextResponse.next()
  }

  if (hostname === 'accounts.sitepow.store' || hostname === 'accounts.lvh.me') {
    if (url.pathname.startsWith('/auth')) return NextResponse.next()
    if (
      !url.pathname.startsWith('/login') &&
      !url.pathname.startsWith('/register')
    ) {
      return NextResponse.redirect(new URL(`/login${url.search}`, req.url))
    }
    return NextResponse.rewrite(
      new URL(`/auth${url.pathname}${url.search}`, req.url),
    )
  }

  const rootDomains = ['localhost', 'sitepow.store', 'lvh.me']
  const isRootDomain = rootDomains.includes(hostname)

  const userSession = await getCurrentUser()
  const isAuthenticated = !!userSession
  const userRole = userSession?.role as UserRole | undefined

  if (!isRootDomain) {
    const slug = hostname.split('.')[0]

    if (url.pathname.startsWith('/user') && !isAuthenticated) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    return NextResponse.rewrite(
      new URL(`/sites/${slug}${url.pathname}${url.search}`, req.url),
    )
  }

  if (
    (url.pathname.startsWith('/merchant') && userRole !== UserRole.MERCHANT) ||
    (url.pathname.startsWith('/user') && userRole !== UserRole.CUSTOMER)
  ) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // return intlMiddleware(req)
  return NextResponse.next()
}
