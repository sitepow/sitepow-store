'use server'

import { Prisma } from '@/generated/prisma/client'
import { serializeDecimal } from '@/utils/decimal'

import { prisma } from '@/lib/prisma'

const storefrontCourierSelect = {
  id: true,
  isEnabled: true,
  courierService: {
    select: {
      id: true,
      code: true,
      name: true,
      estimatedDays: true,
      courier: {
        select: { name: true, code: true },
      },
    },
  },
  weightRates: {
    select: {
      zoneType: true,
      minWeight: true,
      maxWeight: true,
      fee: true,
    },
  },
} satisfies Prisma.StoreCourierServiceSelect

export type StorefrontCourierOption = Prisma.StoreCourierServiceGetPayload<{
  select: typeof storefrontCourierSelect
}>

export async function getStorefrontShippingOptions(storeSlug: string) {
  try {
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug },
      select: { id: true },
    })

    if (!store) {
      return []
    }

    return serializeDecimal(
      await prisma.storeCourierService.findMany({
        where: { storeId: store.id, isEnabled: true },
        select: storefrontCourierSelect,
        orderBy: { createdAt: 'asc' },
      }),
    )
  } catch {
    return []
  }
}
