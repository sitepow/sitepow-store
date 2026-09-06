import { NextResponse } from 'next/server'

import { getStore } from '@/actions/store'
import { StoreStatus } from '@/generated/prisma/enums'

type Props = {
  params: Promise<{ domain: string }>
}

export async function GET(_req: Request, { params }: Props) {
  const { domain } = await params
  const store = await getStore({ domain })

  if (!store) {
    return new NextResponse('User-agent: *\nDisallow: /', {
      status: 404,
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  const isSearchable =
    store.status === StoreStatus.ACTIVE &&
    Boolean(store.allowSearchEngineIndex ?? true)

  if (!isSearchable) {
    const robotsTxt = `User-agent: *\nDisallow: /`
    return new NextResponse(robotsTxt, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  }

  const storeDomain = store.customDomain || domain
  const baseUrl = storeDomain.includes('.')
    ? `https://${storeDomain}`
    : `https://${storeDomain}.sitepow.store`

  const robotsTxt = `User-agent: *
Allow: /
Disallow: /user/
Disallow: /cart/

Sitemap: ${baseUrl}/sitemap.xml`

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
