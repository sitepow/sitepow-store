import { NextRequest, NextResponse } from 'next/server'

import crypto from 'crypto'

import { auth } from '@/lib/auth'
import { redis } from '@/lib/redis'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const returnTo = searchParams.get('returnTo') || 'https://sitepow.store'

  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) {
    return NextResponse.redirect(new URL('/login?error=no_session', req.url))
  }

  const targetUrl = new URL(returnTo)

  if (
    targetUrl.hostname.endsWith('sitepow.store') ||
    targetUrl.hostname === 'localhost' ||
    targetUrl.hostname === 'lvh.me'
  ) {
    return NextResponse.redirect(returnTo)
  }

  const ticket = crypto.randomBytes(32).toString('hex')
  await redis.set(`auth:ticket:${ticket}`, session.session.token, 'EX', 30)

  const claimUrl = new URL(
    `https://${targetUrl.hostname}/api/auth/claim-ticket`,
  )
  claimUrl.searchParams.set('ticket', ticket)
  claimUrl.searchParams.set('redirect', returnTo)

  return NextResponse.redirect(claimUrl.toString())
}
