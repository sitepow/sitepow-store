import { NextRequest, NextResponse } from 'next/server'

import crypto from 'crypto'

import { redis } from '@/lib/redis'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const returnTo = searchParams.get('returnTo')
  const provider = searchParams.get('provider')

  if (!returnTo) {
    return NextResponse.redirect(
      new URL('/login?error=missing_return', req.url),
    )
  }

  const rawCookieHeader = req.headers.get('cookie') || ''
  const match = rawCookieHeader.match(/better-auth\.session_token=([^;]+)/)

  if (!match) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('returnTo', returnTo)

    if (provider) {
      loginUrl.searchParams.set('sso_provider', provider)
    }

    return NextResponse.redirect(loginUrl)
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
