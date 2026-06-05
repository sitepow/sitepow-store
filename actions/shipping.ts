'use server'

import { Prisma } from '@/generated/prisma/client'
import { ShippingZoneType } from '@/generated/prisma/enums'
import { serializeDecimal } from '@/utils/decimal'
import {
  mapStoreToShippingForm,
  syncStoreServiceWeightRates,
} from '@/utils/shipping'
import { ShippingFormValues } from '@/zod/shipping'

import { prisma } from '@/lib/prisma'

const storeShippingQuery = {
  select: {
    province: true,
    district: true,
    postcode: true,
    shippingSetting: {
      select: { isFreeShipEnabled: true, freeShipMin: true },
    },
    storeCourierServices: {
      include: { weightRates: true },
    },
  },
  where: {} as { id: string },
} satisfies Prisma.StoreFindUniqueArgs

export type StoreShippingPayload = Prisma.StoreGetPayload<
  typeof storeShippingQuery
>

export async function getStoreShippingSettings(
  storeId: string,
): Promise<Partial<ShippingFormValues> | null> {
  const store = serializeDecimal(
    await prisma.store.findUnique({
      ...storeShippingQuery,
      where: { id: storeId },
    }),
  )

  if (!store) {
    return null
  }

  return mapStoreToShippingForm(store)
}

export async function updateStoreShippingSettings(
  storeId: string,
  data: ShippingFormValues,
) {
  try {
    return await prisma.$transaction(async (tx) => {
      await tx.store.update({
        where: { id: storeId },
        data: {
          province: data.storeProvince,
          district: data.storeDistrict,
          postcode: String(data.storePostcode),
        },
      })

      await tx.shippingSetting.upsert({
        where: { storeId },
        create: {
          storeId,
          isFreeShipEnabled: data.isFreeShipEnabled,
          freeShipMin: data.isFreeShipEnabled ? data.freeShipMin : 0,
        },
        update: {
          isFreeShipEnabled: data.isFreeShipEnabled,
          freeShipMin: data.isFreeShipEnabled ? data.freeShipMin : 0,
        },
      })

      for (const service of data.services) {
        const courierServiceRecord = await tx.storeCourierService.upsert({
          where: {
            storeId_courierServiceId: {
              storeId,
              courierServiceId: service.courierServiceId,
            },
          },
          create: {
            storeId,
            courierServiceId: service.courierServiceId,
            isEnabled: service.isEnabled,
          },
          update: {
            isEnabled: service.isEnabled,
          },
        })

        await syncStoreServiceWeightRates(
          tx,
          courierServiceRecord.id,
          service.weightRates.map((wr) => ({
            ...wr,
            zoneType: wr.zoneType as ShippingZoneType,
          })),
        )
      }
    })
  } catch {
    throw new Error('ไม่สามารถบันทึกข้อมูลการจัดส่งได้')
  }
}
