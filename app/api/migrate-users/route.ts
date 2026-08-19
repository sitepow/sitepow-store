import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  if (
    secret !== process.env.MIGRATION_SECRET &&
    process.env.NODE_ENV === 'production'
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        password: {
          not: null,
        },
      },
      select: {
        id: true,
        email: true,
        password: true,
      },
    })

    let migratedCount = 0
    let skippedCount = 0
    const logs: string[] = []

    for (const user of users) {
      if (!user.password) {
        continue
      }

      const existingAccount = await prisma.account.findFirst({
        where: {
          userId: user.id,
          providerId: 'credential',
        },
      })

      if (!existingAccount) {
        await prisma.account.create({
          data: {
            userId: user.id,
            accountId: user.id,
            providerId: 'credential',
            password: user.password,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })
        migratedCount++
        logs.push(`Migrated: ${user.email}`)
      } else {
        skippedCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Migration completed!`,
      stats: {
        totalFound: users.length,
        migrated: migratedCount,
        skipped: skippedCount,
      },
      logs,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
