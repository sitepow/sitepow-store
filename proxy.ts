import { NextRequest, NextResponse } from 'next/server'

import { redis } from '@/lib/redis'

export const config = {
  matcher: [
    '/((?!_next|_static|[\\w-]+\\.(?:ico|png|jpg|jpeg|avif|svg|css|js|map|json|txt|webmanifest)).*)',
  ],
}

const ROOT_DOMAINS = ['sitepow.store', 'lvh.me', 'localhost']
const AUTH_DOMAINS = ['accounts.sitepow.store', 'accounts.lvh.me']

function applyCors(req: NextRequest, res: NextResponse) {
  const origin = req.headers.get('origin')

  if (origin) {
    res.headers.set('Access-Control-Allow-Origin', origin)
    res.headers.set('Access-Control-Allow-Credentials', 'true')
  } else {
    res.headers.set('Access-Control-Allow-Origin', '*')
  }

  res.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS',
  )
  res.headers.set(
    'Access-Control-Allow-Headers',
    req.headers.get('access-control-request-headers') ||
      'Content-Type, Authorization, next-router-prefetch, next-url',
  )

  return res
}

export default async function middleware(req: NextRequest) {
  if (req.method === 'OPTIONS') {
    return applyCors(req, new NextResponse(null, { status: 200 }))
  }

  const url = req.nextUrl
  const host = req.headers.get('host') || ''
  const hostname = host
    .replace(/^www\./, '')
    .split(':')[0]
    .toLowerCase()

  const isProd = process.env.NODE_ENV === 'production'

  if (url.pathname.startsWith('/api/auth')) {
    const authTargetDomain = isProd
      ? 'https://accounts.sitepow.store'
      : 'http://accounts.lvh.me:3000'

    const targetUrl = new URL(`${url.pathname}${url.search}`, authTargetDomain)

    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-forwarded-host', host)
    requestHeaders.delete('host')

    return applyCors(
      req,
      NextResponse.rewrite(targetUrl, {
        request: {
          headers: requestHeaders,
        },
      }),
    )
  }

  if (url.pathname.startsWith('/api')) {
    return applyCors(req, NextResponse.next())
  }

  if (
    url.pathname.match(
      /\.(?:ico|png|jpg|jpeg|avif|svg|css|js|map|json|txt|webmanifest)$/,
    )
  ) {
    return applyCors(req, NextResponse.next())
  }

  const cookieToken =
    req.cookies.get('better-auth.session_token')?.value ||
    req.cookies.get('__Secure-better-auth.session_token')?.value ||
    req.cookies.get('__Host-better-auth.session_token')?.value

  const urlAuthToken = url.searchParams.get('auth_token')
  const sessionToken = cookieToken || urlAuthToken

  if (urlAuthToken && !AUTH_DOMAINS.includes(hostname)) {
    url.searchParams.delete('auth_token')
    const redirectUrl = new URL(`${url.pathname}${url.search}`, req.url)
    const response = NextResponse.redirect(redirectUrl)

    const cookieName = isProd
      ? '__Secure-better-auth.session_token'
      : 'better-auth.session_token'

    response.cookies.set(cookieName, urlAuthToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return applyCors(req, response)
  }

  const isAuthenticated = !!sessionToken

  if (AUTH_DOMAINS.includes(hostname)) {
    if (url.pathname.startsWith('/auth')) {
      return applyCors(req, NextResponse.next())
    }

    const defaultTarget = hostname.includes('sitepow.store')
      ? 'https://sitepow.store'
      : 'http://lvh.me:3000'

    const callbackUrl = url.searchParams.get('callbackUrl') || defaultTarget

    if (url.pathname === '/') {
      if (isAuthenticated) {
        return applyCors(req, NextResponse.redirect(new URL(callbackUrl)))
      }
      return applyCors(req, NextResponse.redirect(new URL('/login', req.url)))
    }

    if (
      isAuthenticated &&
      (url.pathname.startsWith('/login') ||
        url.pathname.startsWith('/register'))
    ) {
      const redirectTarget = new URL(callbackUrl)
      return applyCors(req, NextResponse.redirect(redirectTarget))
    }

    if (
      !isAuthenticated &&
      !url.pathname.startsWith('/login') &&
      !url.pathname.startsWith('/register')
    ) {
      return applyCors(
        req,
        NextResponse.redirect(new URL(`/login${url.search}`, req.url)),
      )
    }

    return applyCors(
      req,
      NextResponse.rewrite(
        new URL(`/auth${url.pathname}${url.search}`, req.url),
      ),
    )
  }

  const isRootDomain = ROOT_DOMAINS.includes(hostname)

  if (isRootDomain) {
    return applyCors(req, NextResponse.next())
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
      return applyCors(req, NextResponse.redirect(redirectUrl, { status: 301 }))
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
      return applyCors(req, NextResponse.rewrite(new URL('/404', req.url)))
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

    return applyCors(req, NextResponse.redirect(loginUrl))
  }

  return applyCors(
    req,
    NextResponse.rewrite(
      new URL(`/sites/${storeSlug}${url.pathname}${url.search}`, req.url),
    ),
  )
}
