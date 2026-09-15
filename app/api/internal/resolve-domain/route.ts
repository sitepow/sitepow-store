import { NextResponse } from 'next/server'

import { DomainStatus } from '@/generated/prisma/enums'

import { prisma } from '@/lib/prisma'

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
    .replace(/^www\./, '')

  try {
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { customDomain: cleanDomain },
          { customDomain: `www.${cleanDomain}` },
        ],
        customDomainStatus: DomainStatus.ACTIVE,
      },
      select: {
        slug: true,
      },
    })

    if (!store) {
      return NextResponse.json(
        { error: 'Store domain not found' },
        { status: 404 },
      )
    }

    return NextResponse.json(
      { slug: store.slug },
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
