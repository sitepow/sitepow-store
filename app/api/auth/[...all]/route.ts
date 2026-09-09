import { toNextJsHandler } from 'better-auth/next-js'

import { auth } from '@/lib/auth'
import { invalidateCacheByPattern } from '@/lib/cache'

const { GET: originalGET, POST: originalPOST } = toNextJsHandler(auth)

function handleCors(request: Request, response: Response) {
  const origin = request.headers.get('origin')

  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS',
    )
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With',
    )
  }
  return response
}

function sanitizeCookiesForHost(
  request: Request,
  response: Response,
): Response {
  const host = request.headers.get('host')?.split(':')[0].toLowerCase() || ''
  const isSitepow = host === 'sitepow.store' || host.endsWith('.sitepow.store')

  if (!isSitepow && typeof response.headers.getSetCookie === 'function') {
    const setCookies = response.headers.getSetCookie()
    if (setCookies.length > 0) {
      response.headers.delete('set-cookie')
      for (const cookieStr of setCookies) {
        const cleaned = cookieStr
          .replace(/;\s*Domain=\.?sitepow\.store/gi, '')
          .replace(/;\s*Domain=\.?localhost/gi, '')
        response.headers.append('set-cookie', cleaned)
      }
    }
  }
  return response
}

export async function GET(request: Request) {
  const response = await originalGET(request)
  const corsResponse = handleCors(request, response)
  return sanitizeCookiesForHost(request, corsResponse)
}

export async function POST(request: Request) {
  const url = new URL(request.url)
  const isSignOut = url.pathname.endsWith('/sign-out')

  let userId: string | null = null
  if (isSignOut) {
    try {
      const session = await auth.api.getSession({ headers: request.headers })
      if (session?.user?.id) {
        userId = session.user.id
      }
    } catch (e) {
      // Ignore
    }
  }

  const response = await originalPOST(request)

  if (isSignOut && userId) {
    try {
      await invalidateCacheByPattern(`${userId}:*`)
      await invalidateCacheByPattern(`*:${userId}:*`)
    } catch (e) {
      console.error('Failed to invalidate user cache on sign-out:', e)
    }
  }

  const corsResponse = handleCors(request, response)
  const sanitizedResponse = sanitizeCookiesForHost(request, corsResponse)

  if (isSignOut) {
    sanitizedResponse.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, max-age=0, proxy-revalidate',
    )
    sanitizedResponse.headers.set('Pragma', 'no-cache')
    sanitizedResponse.headers.set('Expires', '0')
    sanitizedResponse.headers.set('Clear-Site-Data', '"cache"')
  }

  return sanitizedResponse
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin')
  const response = new Response(null, { status: 204 })

  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS',
    )
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With',
    )
  }

  return response
}
