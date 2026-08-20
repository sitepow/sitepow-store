import { NextRequest, NextResponse } from 'next/server'

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

  const sessionToken =
    req.cookies.get('better-auth.session_token')?.value ||
    req.cookies.get('__Secure-better-auth.session_token')?.value ||
    req.cookies.get('__Host-better-auth.session_token')?.value

  const isAuthenticated = !!sessionToken

  if (hostname === 'accounts.sitepow.store' || hostname === 'accounts.lvh.me') {
    if (url.pathname.startsWith('/api') || url.pathname.startsWith('/auth')) {
      return NextResponse.next()
    }

    const defaultTarget = hostname.includes('sitepow.store')
      ? 'https://sitepow.store'
      : 'http://lvh.me:3000'

    const callbackUrl = url.searchParams.get('callbackUrl') || defaultTarget

    if (url.pathname === '/') {
      if (isAuthenticated) {
        return NextResponse.redirect(new URL(callbackUrl))
      }
      return NextResponse.redirect(new URL('/login', req.url))
    }

    if (
      isAuthenticated &&
      (url.pathname.startsWith('/login') ||
        url.pathname.startsWith('/register'))
    ) {
      return NextResponse.redirect(new URL(callbackUrl))
    }

    if (
      !isAuthenticated &&
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

  if (!isRootDomain) {
    const slug = hostname.split('.')[0]

    if (url.pathname.startsWith('/user') && !isAuthenticated) {
      const loginUrl = new URL('https://accounts.sitepow.store/login', req.url)
      loginUrl.searchParams.set('callbackUrl', req.url)
      return NextResponse.redirect(loginUrl)
    }

    return NextResponse.rewrite(
      new URL(`/sites/${slug}${url.pathname}${url.search}`, req.url),
    )
  }

  return NextResponse.next()
}
