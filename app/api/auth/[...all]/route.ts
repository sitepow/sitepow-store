import { toNextJsHandler } from 'better-auth/next-js'

import { auth } from '@/lib/auth/config'

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

export async function GET(request: Request) {
  const response = await originalGET(request)
  return handleCors(request, response)
}

export async function POST(request: Request) {
  const response = await originalPOST(request)
  return handleCors(request, response)
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
