import { NextResponse } from 'next/server'

import { DomainStatus } from '@/generated/prisma/enums'

import { prisma } from '@/lib/db/prisma'

export async function GET(request: Request) {
  const secret = request.headers.get('x-internal-secret')
  if (secret !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const domain = searchParams.get('domain')

  if (!domain) {
    return NextResponse.json({ error: 'Domain missing' }, { status: 400 })
  }

  const cleanDomain = domain
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/^www\./, '')

  try {
    const storeDomain = await prisma.storeDomain.findFirst({
      where: {
        OR: [{ domain: cleanDomain }, { domain: `www.${cleanDomain}` }],
        status: {
          in: [
            DomainStatus.ACTIVE,
            DomainStatus.PENDING,
            DomainStatus.VERIFIED,
          ],
        },
      },
      select: {
        store: {
          select: { slug: true },
        },
      },
    })

    let storeSlug = storeDomain?.store?.slug

    if (!storeSlug) {
      const store = await prisma.store.findFirst({
        where: {
          OR: [
            { customDomain: cleanDomain },
            { customDomain: `www.${cleanDomain}` },
          ],
        },
        select: {
          slug: true,
        },
      })
      storeSlug = store?.slug
    }

    if (!storeSlug) {
      return NextResponse.json(
        { error: 'Store domain not found' },
        { status: 404 },
      )
    }

    return NextResponse.json(
      { slug: storeSlug },
      {
        headers: {
          'Cache-Control': 's-maxage=300, stale-while-revalidate=59',
        },
      },
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
