import { headers } from 'next/headers'

import { auth } from '@/auth'
import { Prisma } from '@/generated/prisma/client'
import { ActorType, LogAction } from '@/generated/prisma/enums'

import { prisma } from '@/lib/prisma'

export async function createLog({
  action,
  actorType,
  storeId,
  entity,
  entityId,
  details,
}: {
  action: LogAction
  actorType: ActorType
  storeId?: string
  entity: string
  entityId?: string
  details?: Prisma.InputJsonValue
}) {
  try {
    const [session, headersList] = await Promise.all([auth(), headers()])

    const userId = session?.user?.id
    const staff = userId
      ? await prisma.staff.findUnique({
          where: { userId },
          select: { id: true },
        })
      : null
    const staffId = staff?.id ?? undefined

    const ip =
      headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      headersList.get('x-real-ip') ??
      undefined

    await prisma.activityLog.create({
      data: {
        action,
        actorType,
        storeId,
        staffId,
        userId,
        entity,
        entityId,
        details,
        ipAddress: ip,
      },
    })
  } catch (error) {
    console.error('[createLog]', error)
  }
}
