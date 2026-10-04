import { headers } from 'next/headers'

import { Prisma } from '@/generated/prisma/client'
import { ActorType, LogAction } from '@/generated/prisma/enums'

import { getServerSession } from '@/lib/auth/server'
import { prisma } from '@/lib/db/prisma'

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
    const [session, headersList] = await Promise.all([
      getServerSession(),
      headers(),
    ])

    const userId = session?.user?.id
    const employee = userId
      ? await prisma.employee.findUnique({
          where: { userId },
          select: { id: true },
        })
      : null
    const employeeId = employee?.id ?? undefined

    const ip =
      headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      headersList.get('x-real-ip') ??
      undefined

    await prisma.activityLog.create({
      data: {
        action,
        actorType,
        storeId,
        employeeId,
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
