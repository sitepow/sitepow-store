import { headers } from 'next/headers'

import { Prisma } from '@/generated/prisma/client'
import { ActorType, LogAction } from '@/generated/prisma/enums'

import { getServerSession } from '@/lib/auth/server'
import { prisma } from '@/lib/db/prisma'

export interface LogDetails {
  summary?: string
  title?: string
  description?: string
  message?: string
  actionType?: string
  changes?:
    | Record<string, { before?: unknown; after?: unknown }>
    | Array<{ field: string; from?: unknown; to?: unknown }>
  metadata?: Record<string, unknown>
  [key: string]: unknown
}

export interface CreateLogParams {
  action: LogAction
  actorType: ActorType
  storeId?: string
  entity: string
  entityId?: string
  details?: Prisma.InputJsonValue | LogDetails
  userId?: string
  employeeId?: string
  ipAddress?: string
}

export async function createLog({
  action,
  actorType,
  storeId,
  entity,
  entityId,
  details,
  userId: explicitUserId,
  employeeId: explicitEmployeeId,
  ipAddress: explicitIpAddress,
}: CreateLogParams) {
  try {
    const [session, headersList] = await Promise.all([
      getServerSession(),
      headers(),
    ])

    const userId = explicitUserId ?? session?.user?.id

    let employeeId = explicitEmployeeId
    if (!employeeId && userId) {
      const employee = await prisma.employee.findUnique({
        where: { userId },
        select: { id: true },
      })
      employeeId = employee?.id ?? undefined
    }

    const ip =
      explicitIpAddress ??
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
        details: details as Prisma.InputJsonValue | undefined,
        ipAddress: ip,
      },
    })
  } catch (error) {
    console.error('[createLog]', error)
  }
}

