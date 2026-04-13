import { NextRequest, NextResponse } from 'next/server'

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (static files)
     * 3. /_static (public assets)
     * 4. Static files (e.g. favicon.ico, sitemap.xml, robots.txt)
     */
    '/((?!api/|_next/|_static/|[\\w-]+\\.\\w+).*)',
  ],
}

export default function middleware(req: NextRequest) {
  const url = req.nextUrl

  const host = req.headers.get('host') || ''
  const hostname = host.split(':')[0]

  const searchParams = url.searchParams.toString()
  const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ''}`

  if (
    hostname === 'localhost' ||
    hostname === 'sitepow.store' ||
    hostname === 'lvh.me'
  ) {
    return NextResponse.next()
  }

  return NextResponse.rewrite(new URL(`/sites/${hostname}${path}`, req.url))
}
