import { NextRequest } from 'next/server'

import { StoreStatus } from '@/generated/prisma/enums'

import { prisma } from '@/lib/db/prisma'
import { getTenantBaseUrl } from '@/lib/tenant/seo'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ domain: string }> },
) {
  const { domain } = await params

  const store = await prisma.store.findFirst({
    where: {
      OR: [
        { slug: domain },
        { customDomain: domain },
        { customDomain: `www.${domain}` },
        { StoreDomain: { some: { domain } } },
      ],
    },
    select: { status: true, slug: true },
  })

  if (!store || store.status !== StoreStatus.ACTIVE) {
    const disallowAll = `User-agent: *\nDisallow: /\n`
    return new Response(disallowAll, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  }

  const baseUrl = await getTenantBaseUrl(domain)
  const host = baseUrl.replace(/^https?:\/\//, '')

  const robotsTxt = `# Sitepow Store - Tenant Robots Configuration
User-agent: *
Allow: /
Allow: /products
Allow: /category
Allow: /blogs
Allow: /about
Allow: /faqs
Allow: /privacy-policy
Allow: /refund-return-policy
Allow: /customer-reviews

Disallow: /cart
Disallow: /cart/*
Disallow: /checkout
Disallow: /checkout/*
Disallow: /user
Disallow: /user/*
Disallow: /customer/*
Disallow: /auth/*
Disallow: /login
Disallow: /register
Disallow: /*?*sort=*
Disallow: /*?*filter=*

# Sitemap เฉพาะของโดเมนร้านค้านี้
Sitemap: ${baseUrl}/sitemap.xml
Host: ${host}
`

  return new Response(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
