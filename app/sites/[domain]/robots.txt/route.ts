import { NextResponse } from 'next/server'

import { getStore } from '@/actions/store'
import { StoreStatus } from '@/generated/prisma/enums'
import { getStoreUrl } from '@/utils/storefront-seo'

type Props = {
  params: Promise<{ domain: string }>
}

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: Props) {
  const { domain } = await params
  const store = await getStore({ domain })

  if (!store) {
    return new NextResponse('User-agent: *\nDisallow: /', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  const isSearchable =
    store.status === StoreStatus.ACTIVE &&
    Boolean(store.allowSearchEngineIndex ?? true)

  if (!isSearchable) {
    const robotsTxt = `User-agent: *\nDisallow: /`
    return new NextResponse(robotsTxt, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control':
          'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    })
  }

  const baseUrl = getStoreUrl(store, domain)

  const robotsTxt = `User-agent: *
Allow: /
Disallow: /user/
Disallow: /cart/
Disallow: /login
Disallow: /register

Sitemap: ${baseUrl}/sitemap.xml`

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control':
        'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
