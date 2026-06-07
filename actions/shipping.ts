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

const branchShippingSelect = {
  province: true,
  district: true,
  postcode: true,
} satisfies Prisma.BranchSelect

const storeShippingSelect = {
  shippingSetting: {
    select: { isFreeShipEnabled: true, freeShipMin: true },
  },
  storeCourierServices: {
    include: { weightRates: true },
  },
} satisfies Prisma.StoreSelect

export type StoreShippingPayload = Prisma.StoreGetPayload<{
  select: typeof storeShippingSelect
}> & {
  branch: Prisma.BranchGetPayload<{
    select: typeof branchShippingSelect
  }> | null
}

export async function getStoreShippingSettings(
  storeId: string,
  branchId: string,
): Promise<Partial<ShippingFormValues> | null> {
  const [store, branch] = await Promise.all([
    prisma.store.findUnique({
      where: { id: storeId },
      select: storeShippingSelect,
    }),
    prisma.branch.findUnique({
      where: { id: branchId },
      select: branchShippingSelect,
    }),
  ])

  if (!store) {
    return null
  }

  const serialized = serializeDecimal({ ...store, branch })

  return mapStoreToShippingForm(serialized)
}

export async function updateStoreShippingSettings(
  storeId: string,
  branchId: string,
  data: ShippingFormValues,
) {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.branch.update({
        where: { id: branchId },
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

    return { success: true, message: 'บันทึกข้อมูลการจัดส่งสำเร็จแล้ว' }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
