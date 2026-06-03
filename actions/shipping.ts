'use server'

import { ShippingFormValues } from '@/zod/shipping'

import { prisma } from '@/lib/prisma'

export async function getStoreShippingSettings(
  storeId: string,
): Promise<Partial<ShippingFormValues> | null> {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: {
      storeCourierServices: {
        include: {
          weightRates: true,
          zoneRates: true,
        },
      },
    },
  })

  if (!store) {
    return null
  }

  const services = store.storeCourierServices.map((scs) => ({
    courierServiceId: scs.courierServiceId,
    isEnabled: scs.isEnabled,
    weightRates: scs.weightRates.map((wr) => ({
      id: wr.id,
      zoneType: wr.zoneType,
      minWeight: Number(wr.minWeight),
      maxWeight: Number(wr.maxWeight),
      fee: Number(wr.fee),
    })),
    zoneRates: [],
  }))

  return {
    services,
  }
}
