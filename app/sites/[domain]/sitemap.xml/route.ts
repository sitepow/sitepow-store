import { NextRequest } from 'next/server'

import { StoreStatus } from '@/generated/prisma/enums'

import { prisma } from '@/lib/db/prisma'
import { getTenantBaseUrl } from '@/lib/tenant/seo'

export const dynamic = 'force-dynamic'

interface SitemapItem {
  loc: string
  lastmod?: string
  changefreq?:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never'
  priority?: number
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '&':
        return '&amp;'
      case '\'':
        return '&apos;'
      case '"':
        return '&quot;'
      default:
        return c
    }
  })
}

function formatXml(items: SitemapItem[]): string {
  const urls = items
    .map((item) => {
      const parts = [`    <loc>${escapeXml(item.loc)}</loc>`]
      if (item.lastmod) parts.push(`    <lastmod>${item.lastmod}</lastmod>`)
      if (item.changefreq)
        parts.push(`    <changefreq>${item.changefreq}</changefreq>`)
      if (item.priority !== undefined)
        parts.push(`    <priority>${item.priority.toFixed(1)}</priority>`)
      return `  <url>\n${parts.join('\n')}\n  </url>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
}

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
      status: StoreStatus.ACTIVE,
    },
    select: {
      id: true,
      slug: true,
      updatedAt: true,
    },
  })

  if (!store) {
    return new Response('Store not found', { status: 404 })
  }

  const baseUrl = await getTenantBaseUrl(domain)

  const [products, categories, blogs] = await Promise.all([
    prisma.product.findMany({
      where: { storeId: store.id, isPublished: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 5000,
    }),
    prisma.category.findMany({
      where: { storeId: store.id },
      select: { slug: true },
      take: 1000,
    }),
    prisma.blog.findMany({
      where: { storeId: store.id },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 2000,
    }),
  ])

  const sitemapItems: SitemapItem[] = [
    {
      loc: `${baseUrl}`,
      lastmod: store.updatedAt.toISOString(),
      changefreq: 'daily',
      priority: 1.0,
    },
    {
      loc: `${baseUrl}/products`,
      changefreq: 'daily',
      priority: 0.9,
    },
    {
      loc: `${baseUrl}/category`,
      changefreq: 'weekly',
      priority: 0.8,
    },
    ...categories.map((cat) => ({
      loc: `${baseUrl}/category?category=${cat.slug}`,
      changefreq: 'weekly' as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      loc: `${baseUrl}/products/${p.slug}`,
      lastmod: p.updatedAt.toISOString(),
      changefreq: 'weekly' as const,
      priority: 0.9,
    })),
    {
      loc: `${baseUrl}/blogs`,
      changefreq: 'weekly',
      priority: 0.7,
    },
    ...blogs.map((b) => ({
      loc: `${baseUrl}/blogs/${b.slug}`,
      lastmod: b.updatedAt.toISOString(),
      changefreq: 'monthly' as const,
      priority: 0.7,
    })),
    { loc: `${baseUrl}/about`, changefreq: 'monthly', priority: 0.5 },
    { loc: `${baseUrl}/faqs`, changefreq: 'monthly', priority: 0.5 },
    { loc: `${baseUrl}/privacy-policy`, changefreq: 'yearly', priority: 0.3 },
    {
      loc: `${baseUrl}/refund-return-policy`,
      changefreq: 'yearly',
      priority: 0.3,
    },
    { loc: `${baseUrl}/customer-reviews`, changefreq: 'weekly', priority: 0.6 },
  ]

  const xml = formatXml(sitemapItems)

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
