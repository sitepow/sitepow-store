import { NextResponse } from 'next/server'

import { getStore } from '@/actions/store'
import { StoreStatus } from '@/generated/prisma/enums'

import { prisma } from '@/lib/prisma'

type Props = {
  params: Promise<{ domain: string }>
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET(_req: Request, { params }: Props) {
  const { domain } = await params
  const store = await getStore({ domain })

  if (!store) {
    return new NextResponse('Store not found', { status: 404 })
  }

  const isSearchable =
    store.status === StoreStatus.ACTIVE &&
    Boolean(store.allowSearchEngineIndex ?? true)

  if (!isSearchable) {
    const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`
    return new NextResponse(emptyXml, {
      headers: {
        'Content-Type': 'application/xml',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    })
  }

  const storeDomain = store.customDomain || domain
  const baseUrl = storeDomain.includes('.')
    ? `https://${storeDomain}`
    : `https://${storeDomain}.sitepow.store`

  const now = new Date().toISOString()

  const [products, categories, blogs] = await Promise.all([
    prisma.product.findMany({
      where: { storeId: store.id, isPublished: true },
      select: { slug: true, updatedAt: true },
      take: 5000,
    }),
    prisma.category.findMany({
      where: { storeId: store.id },
      select: { slug: true },
      take: 1000,
    }),
    prisma.blog.findMany({
      where: { storeId: store.id, isPublished: true },
      select: { slug: true, updatedAt: true },
      take: 1000,
    }),
  ])

  const staticPages = [
    { path: '', priority: '1.0', changefreq: 'daily' },
    { path: '/products', priority: '0.9', changefreq: 'daily' },
    { path: '/category', priority: '0.8', changefreq: 'weekly' },
    { path: '/blogs', priority: '0.8', changefreq: 'weekly' },
    { path: '/about', priority: '0.6', changefreq: 'monthly' },
    { path: '/customer-reviews', priority: '0.6', changefreq: 'weekly' },
    { path: '/faqs', priority: '0.5', changefreq: 'monthly' },
    { path: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
    { path: '/refund-return-policy', priority: '0.3', changefreq: 'yearly' },
  ]

  const urls: string[] = []

  for (const page of staticPages) {
    urls.push(`  <url>
    <loc>${escapeXml(`${baseUrl}${page.path}`)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`)
  }

  for (const product of products) {
    urls.push(`  <url>
    <loc>${escapeXml(`${baseUrl}/products/${product.slug}`)}</loc>
    <lastmod>${product.updatedAt ? product.updatedAt.toISOString() : now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`)
  }

  for (const category of categories) {
    urls.push(`  <url>
    <loc>${escapeXml(`${baseUrl}/category/${category.slug}`)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`)
  }

  for (const blog of blogs) {
    urls.push(`  <url>
    <loc>${escapeXml(`${baseUrl}/blogs/${blog.slug}`)}</loc>
    <lastmod>${blog.updatedAt ? blog.updatedAt.toISOString() : now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`)
  }

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`

  return new NextResponse(sitemapXml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
