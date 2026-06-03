'use server'

import { Prisma } from '@/generated/prisma/client'
import { AggregatedRate } from '@/utils/shipping'

import { prisma } from '@/lib/prisma'

export interface GlobalShippingRateMatrixPayload {
  fromProvince: string
  ratesMatrix: Record<string, AggregatedRate[]>
}

export async function upsertGlobalShippingRateMatrix(
  payloads: GlobalShippingRateMatrixPayload[],
): Promise<void> {
  await Promise.all(
    payloads.map((payload) =>
      prisma.globalShippingRateMatrix.upsert({
        where: { fromProvince: payload.fromProvince },
        update: {
          ratesMatrix: payload.ratesMatrix as unknown as Prisma.InputJsonValue,
        },
        create: {
          fromProvince: payload.fromProvince,
          ratesMatrix: payload.ratesMatrix as unknown as Prisma.InputJsonValue,
        },
      }),
    ),
  )
}
