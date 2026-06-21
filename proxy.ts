import { NextRequest, NextResponse } from 'next/server'

export const config = {
  matcher: [
    '/((?!api|_next|_static|[\\w-]+\\.(?:ico|png|jpg|jpeg|svg|css|js|map|json|txt|webmanifest)).*)',
  ],
}

export default function middleware(req: NextRequest) {
  const url = req.nextUrl

  if (
    url.pathname.match(
      /\.(?:ico|png|jpg|jpeg|svg|css|js|map|json|txt|webmanifest)$/,
    )
  ) {
    return NextResponse.next()
  }

  const host = req.headers.get('host') || ''
  const hostname = host.replace(/^www\./, '').split(':')[0]

  const rootDomains = ['localhost', 'sitepow.store', 'lvh.me']

  if (url.pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  if (hostname === 'accounts.sitepow.store' || hostname === 'accounts.lvh.me') {
    if (url.pathname.startsWith('/auth')) {
      return NextResponse.next()
    }

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

  if (rootDomains.includes(hostname)) {
    return NextResponse.next()
  }

  const slug = hostname.replace('.lvh.me', '').replace('.sitepow.store', '')
  return NextResponse.rewrite(
    new URL(`/sites/${slug}${url.pathname}${url.search}`, req.url),
  )
}
