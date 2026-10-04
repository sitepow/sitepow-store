import { NextRequest, NextResponse } from 'next/server'

import { SESSION_COOKIE_MAX_AGE_SECONDS } from '@/constants/system'

import { redis } from '@/lib/redis'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const ticket = searchParams.get('ticket')
  const redirectUrl = searchParams.get('redirect') || '/'

  if (!ticket) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const sessionToken = await redis.get(`auth:ticket:${ticket}`)
  if (!sessionToken) {
    return NextResponse.redirect(
      new URL('/login?error=expired_ticket', req.url),
    )
  }

  await redis.del(`auth:ticket:${ticket}`)

  const response = NextResponse.redirect(new URL(redirectUrl, req.url))

  response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate')

  response.cookies.set('better-auth.session_token', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
  })

  return response
}
