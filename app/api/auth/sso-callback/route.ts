import { NextRequest, NextResponse } from 'next/server'

import crypto from 'crypto'

import { redis } from '@/lib/redis'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const returnTo = searchParams.get('returnTo')
  const provider = searchParams.get('provider')

  if (!returnTo) {
    return NextResponse.redirect(
      'https://sitepow.store/login?error=missing_return',
    )
  }

  const rawCookieHeader = req.headers.get('cookie') || ''
  const match = rawCookieHeader.match(/better-auth\.session_token=([^;]+)/)

  if (!match) {
    const cleanReturnTo = decodeURIComponent(returnTo)
    const loginUrl = new URL('https://sitepow.store/login')
    loginUrl.searchParams.set('returnTo', cleanReturnTo)

    if (provider) {
      loginUrl.searchParams.set('sso_provider', provider)
    }

    return NextResponse.redirect(loginUrl.toString())
  }

  const fullCookieValue = decodeURIComponent(match[1])
  const targetUrl = new URL(returnTo)

  if (
    targetUrl.hostname === 'sitepow.store' ||
    targetUrl.hostname === 'localhost' ||
    targetUrl.hostname === 'lvh.me'
  ) {
    return NextResponse.redirect(returnTo)
  }

  const ticket = crypto.randomBytes(32).toString('hex')
  await redis.set(`auth:ticket:${ticket}`, fullCookieValue, 'EX', 60)

  const claimUrl = new URL(
    `https://${targetUrl.hostname}/api/auth/claim-ticket`,
  )
  claimUrl.searchParams.set('ticket', ticket)
  claimUrl.searchParams.set('redirect', returnTo)

  return NextResponse.redirect(claimUrl.toString())
}
