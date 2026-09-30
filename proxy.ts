import { NextRequest, NextResponse } from 'next/server'

import { getStoreSlugByDomain } from '@/lib/domain-resolver'
import { redis } from '@/lib/redis'

export const config = {
  matcher: [
    '/((?!_next|_static|[\\w-]+\\.(?:ico|png|jpg|jpeg|avif|svg|css|js|map|json|webmanifest)).*)',
  ],
}

const ROOT_DOMAINS = ['sitepow.store', 'lvh.me', 'localhost']

const SESSION_COOKIE_NAMES = [
  'better-auth.session_token',
  '__Secure-better-auth.session_token',
]

const isProd = process.env.NODE_ENV === 'production'

function getRequestHostname(req: NextRequest): string {
  const host =
    req.headers.get('x-forwarded-host') ||
    req.headers.get('host') ||
    req.nextUrl.host ||
    ''
  return host
    .split(',')[0]
    .trim()
    .replace(/^www\./, '')
    .split(':')[0]
    .toLowerCase()
}

function isIpAddress(host: string): boolean {
  return (
    /^(\d{1,3}\.){3}\d{1,3}$/.test(host) ||
    host === '0.0.0.0' ||
    host === '127.0.0.1' ||
    host.includes(':')
  )
}

function getManageOrigin(req: NextRequest): string {
  if (isProd) {
    return 'https://manage.sitepow.store'
  }
  const host =
    req.headers.get('x-forwarded-host') || req.headers.get('host') || ''
  const port = host.includes(':') ? host.split(':')[1] : '3000'
  return `http://manage.lvh.me:${port}`
}

function getMainOrigin(req: NextRequest): string {
  if (isProd) {
    return 'https://sitepow.store'
  }
  const host =
    req.headers.get('x-forwarded-host') || req.headers.get('host') || ''
  const port = host.includes(':') ? host.split(':')[1] : '3000'
  return `http://lvh.me:${port}`
}

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl

  if (url.pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  if (
    url.pathname.match(
      /\.(?:ico|png|jpg|jpeg|avif|svg|css|js|map|json|webmanifest)$/,
    )
  ) {
    return NextResponse.next()
  }

  const nextAction = req.headers.get('next-action')
  if (nextAction && !/^[a-f0-9]{32,64}$/i.test(nextAction)) {
    return new NextResponse('Invalid Action', { status: 400 })
  }

  const hostname = getRequestHostname(req)

  if (isProd && isIpAddress(hostname)) {
    return NextResponse.redirect(
      new URL(`${url.pathname}${url.search}`, getMainOrigin(req)),
    )
  }

  if (
    !isProd &&
    (hostname === 'localhost' || hostname.endsWith('.localhost'))
  ) {
    const lvhHostname =
      hostname === 'localhost'
        ? 'lvh.me'
        : hostname.replace(/\.localhost$/, '.lvh.me')
    const host =
      req.headers.get('x-forwarded-host') || req.headers.get('host') || ''
    const port = host.includes(':') ? host.split(':')[1] : '3000'
    return NextResponse.redirect(
      new URL(`${url.pathname}${url.search}`, `http://${lvhHostname}:${port}`),
    )
  }

  const isManageSubdomain =
    hostname === 'manage.sitepow.store' ||
    hostname === 'manage.lvh.me' ||
    hostname === 'manage.localhost' ||
    hostname.startsWith('manage.')

  if (isManageSubdomain) {
    if (
      url.pathname === '/' ||
      url.pathname === '/merchant' ||
      url.pathname === '/merchant/dashbaord'
    ) {
      return NextResponse.redirect(
        new URL(`/merchant/dashboard${url.search}`, req.url),
      )
    }

    if (url.pathname.startsWith('/merchant')) {
      const hasSession = SESSION_COOKIE_NAMES.some((cookieName) =>
        req.cookies.has(cookieName),
      )

      if (!hasSession) {
        if (url.searchParams.get('auth_retry') === '1') {
          const loginUrl = new URL('/login', getMainOrigin(req))
          loginUrl.searchParams.set('error', 'session_expired')
          return NextResponse.redirect(loginUrl)
        }

        const loginUrl = new URL('/login', getMainOrigin(req))
        const callback = new URL(req.url)
        callback.searchParams.set('auth_retry', '1')
        loginUrl.searchParams.set('callbackUrl', callback.toString())
        return NextResponse.redirect(loginUrl)
      }

      return NextResponse.next()
    }

    return NextResponse.redirect(
      new URL(`${url.pathname}${url.search}`, getMainOrigin(req)),
    )
  }

  if (url.pathname.startsWith('/merchant')) {
    const manageOrigin = getManageOrigin(req)
    if (url.origin === manageOrigin || isManageSubdomain) {
      return NextResponse.next()
    }

    const targetPath =
      url.pathname === '/merchant' || url.pathname === '/merchant/dashbaord'
        ? '/merchant/dashboard'
        : url.pathname
    return NextResponse.redirect(
      new URL(`${targetPath}${url.search}`, manageOrigin),
    )
  }

  const isProtectedPath = url.pathname.startsWith('/user')
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
    const requestHeaders = new Headers(req.headers)

    if (langParam && (langParam === 'th' || langParam === 'en')) {
      requestHeaders.set('x-next-intl-locale', langParam)
      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
      response.cookies.set('NEXT_LOCALE', langParam, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
      })
      return response
    }

    const cookieLocale = req.cookies.get('NEXT_LOCALE')?.value
    if (cookieLocale && (cookieLocale === 'th' || cookieLocale === 'en')) {
      requestHeaders.set('x-next-intl-locale', cookieLocale)
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    }

    return NextResponse.next()
  }

  let storeSlug = ''
  const isSubdomain = ROOT_DOMAINS.some((rd) => hostname.endsWith(`.${rd}`))

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
    storeSlug = await getStoreSlugByDomain(hostname)

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
