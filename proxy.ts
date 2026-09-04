import { NextRequest, NextResponse } from 'next/server'

import { getStoreSlugByDomain } from '@/lib/domain-resolver'
import { redis } from '@/lib/redis'

export const config = {
  matcher: [
    '/((?!_next|_static|[\\w-]+\\.(?:ico|png|jpg|jpeg|avif|svg|css|js|map|json|txt|webmanifest)).*)',
  ],
}

const ROOT_DOMAINS = ['sitepow.store', 'lvh.me', 'localhost']

const SESSION_COOKIE_NAMES = [
  'better-auth.session_token',
  '__Secure-better-auth.session_token',
]

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl
  const host = req.headers.get('host') || ''
  const hostname = host
    .replace(/^www\./, '')
    .split(':')[0]
    .toLowerCase()

  if (url.pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  if (
    url.pathname.match(
      /\.(?:ico|png|jpg|jpeg|avif|svg|css|js|map|json|txt|webmanifest)$/,
    )
  ) {
    return NextResponse.next()
  }

  const isProtectedPath =
    url.pathname.startsWith('/user') || url.pathname.startsWith('/merchant')

  if (isProtectedPath) {
    const hasSession = SESSION_COOKIE_NAMES.some((cookieName) =>
      req.cookies.has(cookieName),
    )

    if (!hasSession) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', `${url.pathname}${url.search}`)
      return NextResponse.redirect(loginUrl)
    }
  }

  const isRootDomain = ROOT_DOMAINS.includes(hostname)
  if (isRootDomain) {
    const langParam = url.searchParams.get('lang')
    if (langParam && (langParam === 'th' || langParam === 'en')) {
      const response = NextResponse.next()
      response.cookies.set('NEXT_LOCALE', langParam, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
      })
      return response
    }
    return NextResponse.next()
  }

  let storeSlug = ''
  const isSubdomain = ROOT_DOMAINS.some((rootDomain) =>
    hostname.endsWith(`.${rootDomain}`),
  )

  if (isSubdomain) {
    storeSlug = hostname.split('.')[0]

    const slugToDomainKey = `slug:domain:${storeSlug}`
    let customDomain = ''
    try {
      customDomain = (await redis.get(slugToDomainKey)) || ''
    } catch (err) {
      console.error(err)
    }

    if (customDomain) {
      return NextResponse.redirect(
        new URL(`${url.pathname}${url.search}`, `https://${customDomain}`),
        { status: 307 },
      )
    }
  } else {
    const protocol = req.headers.get('x-forwarded-proto') || 'https'
    const origin = `${protocol}://${host}`

    storeSlug = await getStoreSlugByDomain(hostname, origin)

    if (!storeSlug) {
      return NextResponse.rewrite(new URL('/404', req.url))
    }
  }

  const requestHeaders = new Headers(req.headers)

  return NextResponse.rewrite(
    new URL(`/sites/${storeSlug}${url.pathname}${url.search}`, req.url),
    {
      request: {
        headers: requestHeaders,
      },
    },
  )
}
