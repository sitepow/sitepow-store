import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { invalidateCacheByPattern } from '@/lib/cache'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const rawCookieHeader = req.headers.get('cookie') || ''
    const authHeader = req.headers.get('authorization') || ''

    const tokenMatch = rawCookieHeader.match(
      /(?:__Secure-)?better-auth\.session_token=([^;]+)/,
    )
    let sessionToken = tokenMatch
      ? decodeURIComponent(tokenMatch[1].trim())
      : null

    if (!sessionToken && authHeader.startsWith('Bearer ')) {
      sessionToken = authHeader.substring(7).trim()
    }

    let userId: string | null = null

    if (sessionToken) {
      const session = await prisma.session.findUnique({
        where: { token: sessionToken },
        select: { id: true, userId: true },
      })

      if (session) {
        userId = session.userId
      }

      await prisma.session.deleteMany({
        where: { token: sessionToken },
      })
    }

    if (!userId) {
      try {
        const authSession = await auth.api.getSession({
          headers: req.headers,
        })
        if (authSession?.user?.id) {
          userId = authSession.user.id
          if (authSession.session?.id) {
            await prisma.session.deleteMany({
              where: { id: authSession.session.id },
            })
          }
        }
      } catch (e) {
        // Ignore fallback getSession error
      }
    }

    if (userId) {
      try {
        await invalidateCacheByPattern(`${userId}:*`)
        await invalidateCacheByPattern(`*:${userId}:*`)
      } catch (e) {
        console.error('Failed to invalidate user cache on logout:', e)
      }
    }

    try {
      await auth.api.signOut({ headers: req.headers })
    } catch (e) {
      // Ignore if session already deleted
    }

    const response = NextResponse.json({ success: true })

    const cookieNames = [
      'better-auth.session_token',
      '__Secure-better-auth.session_token',
      'better-auth.session_data',
      '__Secure-better-auth.session_data',
      'better-auth.csrf_token',
      'better-auth.dont_remember',
    ]

    const host = req.headers.get('host')?.split(':')[0].toLowerCase() || ''
    const domainsToClear: (string | undefined)[] = [
      undefined,
      '.sitepow.store',
      'sitepow.store',
      '.lvh.me',
      'lvh.me',
      'localhost',
      '.localhost',
    ]

    if (host && !domainsToClear.includes(host)) {
      domainsToClear.push(host)
      domainsToClear.push(`.${host}`)
    }

    const isProd = process.env.NODE_ENV === 'production'

    for (const cookieName of cookieNames) {
      for (const domain of domainsToClear) {
        response.cookies.set(cookieName, '', {
          expires: new Date(0),
          maxAge: 0,
          path: '/',
          domain,
          httpOnly: true,
          sameSite: 'lax',
          secure: isProd,
        })
        response.cookies.set(cookieName, '', {
          expires: new Date(0),
          maxAge: 0,
          path: '/',
          domain,
          httpOnly: true,
          sameSite: 'lax',
          secure: false,
        })
      }
    }

    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, max-age=0, proxy-revalidate',
    )
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Clear-Site-Data', '"cache"')

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
