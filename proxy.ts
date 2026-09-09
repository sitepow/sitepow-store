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

const isProd = process.env.NODE_ENV === 'production'

function getRequestHostname(req: NextRequest): string {
  const host =
    req.headers.get('x-forwarded-host') ||
    req.headers.get('host') ||
    req.nextUrl.host ||
    ''
  return host
    .replace(/^www\./, '')
    .split(':')[0]
    .toLowerCase()
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
      /\.(?:ico|png|jpg|jpeg|avif|svg|css|js|map|json|txt|webmanifest)$/,
    )
  ) {
    return NextResponse.next()
  }

  const hostname = getRequestHostname(req)

  // In development, redirect localhost to lvh.me to ensure cross-subdomain cookies work consistently
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

  // 1. If currently on manage subdomain (manage.sitepow.store / manage.lvh.me:3000)
  // - Revert proxy: directly serve app/(main)/merchant/* (do not rewrite to /sites/manage/...)
  // - This subdomain can ONLY access /merchant/* routes
  if (isManageSubdomain) {
    // If root '/' or exact '/merchant' or typo '/merchant/dashbaord', redirect to /merchant/dashboard
    if (
      url.pathname === '/' ||
      url.pathname === '/merchant' ||
      url.pathname === '/merchant/dashbaord'
    ) {
      return NextResponse.redirect(
        new URL(`/merchant/dashboard${url.search}`, req.url),
      )
    }

    // Only /merchant/* is allowed on manage subdomain
    if (url.pathname.startsWith('/merchant')) {
      const hasSession = SESSION_COOKIE_NAMES.some((cookieName) =>
        req.cookies.has(cookieName),
      )

      if (!hasSession) {
        // If already attempted auth redirect once and still no session, don't loop!
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

    // If any other route on manage subdomain, redirect to main domain
    return NextResponse.redirect(
      new URL(`${url.pathname}${url.search}`, getMainOrigin(req)),
    )
  }

  // 2. If NOT on manage subdomain, but trying to access /merchant/*:
  // Redirect to manage.lvh.me:3000 in dev, or manage.sitepow.store in prod
  if (url.pathname.startsWith('/merchant')) {
    const manageOrigin = getManageOrigin(req)
    // Loop guard: if already on manageOrigin, never redirect to it
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

  // 3. Protected route check for /user
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

  // 4. Root domain handling (sitepow.store, localhost, lvh.me)
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

  // 5. Storefront Subdomains & Custom Domains
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
    const protocol = req.headers.get('x-forwarded-proto') || 'https'
    const hostHeader =
      req.headers.get('x-forwarded-host') || req.headers.get('host') || ''
    const origin = `${protocol}://${hostHeader}`

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
