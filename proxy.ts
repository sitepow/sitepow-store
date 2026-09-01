import { NextRequest, NextResponse } from 'next/server'

import { redis } from '@/lib/redis'

export const config = {
  matcher: [
    '/((?!_next|_static|[\\w-]+\\.(?:ico|png|jpg|jpeg|avif|svg|css|js|map|json|txt|webmanifest)).*)',
  ],
}

const ROOT_DOMAINS = ['sitepow.store', 'lvh.me', 'localhost']
const AUTH_DOMAINS = ['accounts.sitepow.store', 'accounts.lvh.me']

export default async function middleware(req: NextRequest) {
  if (req.method === 'OPTIONS') {
    return NextResponse.next()
  }

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

  const authHeader = req.headers.get('authorization')
  const bearerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null

  const cookieToken =
    req.cookies.get('better-auth.session_token')?.value ||
    req.cookies.get('__Secure-better-auth.session_token')?.value ||
    req.cookies.get('__Host-better-auth.session_token')?.value

  const hasUrlAuthToken = url.searchParams.has('auth_token')

  const sessionToken = cookieToken || bearerToken
  const isAuthenticated = !!sessionToken || hasUrlAuthToken

  if (AUTH_DOMAINS.includes(hostname)) {
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

  const isRootDomain = ROOT_DOMAINS.includes(hostname)

  if (isRootDomain) {
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
      console.error('Redis error fetching custom domain by slug:', err)
    }

    if (customDomain) {
      const redirectUrl = new URL(
        `${url.pathname}${url.search}`,
        `https://${customDomain}`,
      )
      return NextResponse.redirect(redirectUrl, { status: 301 })
    }
  } else {
    const cacheKey = `domain:slug:${hostname}`
    try {
      const cachedSlug = await redis.get(cacheKey)
      if (cachedSlug) {
        storeSlug = cachedSlug
      }
    } catch (err) {
      console.error('Redis error in middleware:', err)
    }

    if (!storeSlug) {
      try {
        const resolveRes = await fetch(
          `${url.origin}/api/internal/resolve-domain?domain=${hostname}`,
          {
            headers: {
              'x-internal-secret': process.env.INTERNAL_API_SECRET || '',
            },
            next: { revalidate: 300 },
          },
        )

        if (resolveRes.ok) {
          const data = await resolveRes.json()
          storeSlug = data.slug

          if (storeSlug) {
            await Promise.all([
              redis.setex(cacheKey, 3600, storeSlug),
              redis.setex(`slug:domain:${storeSlug}`, 3600, hostname),
            ]).catch((err) => console.error('Failed to set redis cache:', err))
          }
        }
      } catch (error) {
        console.error('Failed to resolve custom domain:', error)
      }
    }

    if (!storeSlug) {
      return NextResponse.rewrite(new URL('/404', req.url))
    }
  }

  if (url.pathname.startsWith('/user') && !isAuthenticated) {
    const authHost =
      hostname.includes('lvh.me') || hostname.includes('localhost')
        ? 'http://accounts.lvh.me:3000'
        : 'https://accounts.sitepow.store'

    const publicHost = req.headers.get('x-forwarded-host') || host

    const isDevEnv =
      publicHost.includes('lvh.me') || publicHost.includes('localhost')
    const proto = isDevEnv ? 'http' : 'https'

    const publicCurrentUrl = `${proto}://${publicHost}${url.pathname}${url.search}`

    const loginUrl = new URL(`${authHost}/login`)
    loginUrl.searchParams.set('callbackUrl', publicCurrentUrl)

    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.rewrite(
    new URL(`/sites/${storeSlug}${url.pathname}${url.search}`, req.url),
  )
}
