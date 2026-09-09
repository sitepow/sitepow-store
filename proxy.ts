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

function getManageOrigin(req: NextRequest): string {
  if (isProd) {
    return 'https://manage.sitepow.store'
  }
  const host = req.headers.get('host') || ''
  const port = host.includes(':') ? host.split(':')[1] : '3000'
  return `http://manage.lvh.me:${port}`
}

function getMainOrigin(req: NextRequest): string {
  if (isProd) {
    return 'https://sitepow.store'
  }
  const host = req.headers.get('host') || ''
  const port = host.includes(':') ? host.split(':')[1] : '3000'
  return `http://lvh.me:${port}`
}

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
      /\.(?:ico|png|jpg|jpeg|avif|svg|css|js|map|json|webmanifest)$/,
    )
  ) {
    return NextResponse.next()
  }

  // In development, redirect localhost to lvh.me to ensure cross-subdomain cookies work consistently
  if (
    !isProd &&
    (hostname === 'localhost' || hostname.endsWith('.localhost'))
  ) {
    const lvhHostname =
      hostname === 'localhost'
        ? 'lvh.me'
        : hostname.replace(/\.localhost$/, '.lvh.me')
    const port = host.includes(':') ? host.split(':')[1] : '3000'
    return NextResponse.redirect(
      new URL(`${url.pathname}${url.search}`, `http://${lvhHostname}:${port}`),
    )
  }

  const cookieDomain = isProd ? '.sitepow.store' : '.lvh.me'

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
        const loginUrl = new URL('/login', getMainOrigin(req))
        loginUrl.searchParams.set('callbackUrl', req.url)
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
    const targetPath =
      url.pathname === '/merchant' || url.pathname === '/merchant/dashbaord'
        ? '/merchant/dashboard'
        : url.pathname
    return NextResponse.redirect(
      new URL(`${targetPath}${url.search}`, getManageOrigin(req)),
    )
  }

  // 3. If accessing /login while already having session, redirect to callbackUrl and sync cookie domain
  if (url.pathname === '/login') {
    const sessionCookie =
      req.cookies.get('better-auth.session_token') ||
      req.cookies.get('__Secure-better-auth.session_token')

    if (sessionCookie) {
      const callbackParam = url.searchParams.get('callbackUrl')
      const target = callbackParam || '/'
      const redirectUrl = target.startsWith('http')
        ? new URL(target)
        : new URL(target, req.url)

      const response = NextResponse.redirect(redirectUrl)
      response.cookies.set(sessionCookie.name, sessionCookie.value, {
        domain: cookieDomain,
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: isProd,
        maxAge: 60 * 60 * 24 * 7,
      })
      return response
    }
  }

  // 4. Protected route check for /user
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

  // 5. Root domain handling (sitepow.store, localhost, lvh.me)
  const isRootDomain = ROOT_DOMAINS.includes(hostname)
  if (isRootDomain) {
    const response = NextResponse.next()

    // Ensure session cookie is synced to parent domain (.lvh.me / .sitepow.store)
    const sessionCookie =
      req.cookies.get('better-auth.session_token') ||
      req.cookies.get('__Secure-better-auth.session_token')

    if (sessionCookie) {
      response.cookies.set(sessionCookie.name, sessionCookie.value, {
        domain: cookieDomain,
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: isProd,
        maxAge: 60 * 60 * 24 * 7,
      })
    }

    const langParam = url.searchParams.get('lang')
    if (langParam && (langParam === 'th' || langParam === 'en')) {
      response.cookies.set('NEXT_LOCALE', langParam, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
      })
    }
    return response
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
