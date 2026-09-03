import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true })

  response.cookies.set('better-auth.session_token', '', {
    expires: new Date(0),
    path: '/',
  })

  return response
}
