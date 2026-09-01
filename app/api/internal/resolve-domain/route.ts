import { NextResponse } from 'next/server'

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

  try {
    const storeDomain = await prisma.storeDomain.findFirst({
      where: {
        domain: domain.toLowerCase(),
        status: 'ACTIVE',
      },
      select: {
        store: {
          select: {
            slug: true,
          },
        },
      },
    })

    if (!storeDomain) {
      return NextResponse.json(
        { error: 'Store domain not found' },
        { status: 404 },
      )
    }

    return NextResponse.json(
      { slug: storeDomain.store.slug },
      {
        headers: {
          'Cache-Control': 's-maxage=300, stale-while-revalidate=59',
        },
      },
    )
  } catch (error) {
    console.error('Error resolving domain:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
