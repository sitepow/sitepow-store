'use server'

import { REMOTE_AREAS } from '@/constants/shipping'
import { Prisma } from '@/generated/prisma/client'
import {
  ActorType,
  LogAction,
  ShippingZoneType,
} from '@/generated/prisma/enums'
import { serializeDecimal } from '@/utils/decimal'
import {
  getRegionKey,
  mapStoreToShippingForm,
  syncStoreServiceWeightRates,
} from '@/utils/shipping'
import { ShippingFormValues } from '@/zod/shipping'

import { createLog } from '@/lib/activity-log'
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

    await createLog({
      action: LogAction.UPDATE_STORE_SETTING,
      actorType: ActorType.MERCHANT,
      storeId,
      entity: 'ShippingSetting',
      entityId: storeId,
      details: { branchId, setting: 'shipping' },
    })

    return { success: true, message: 'บันทึกข้อมูลการจัดส่งสำเร็จแล้ว' }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function calculateMultiBranchShippingFee(params: {
  storeId: string
  destinationProvince: string
  destinationPostcode: string
  groups: Array<{ branchId: string; province: string; weight: number }>
}) {
  const { storeId, destinationProvince, destinationPostcode, groups } = params

  const isRemote = REMOTE_AREAS.some(
    (area) => area.postcode === destinationPostcode,
  )

  const courierServices = await prisma.storeCourierService.findMany({
    where: { storeId, isEnabled: true },
    include: { weightRates: true },
  })

  const serviceFeesMap: Record<string, number | null> = {}

  for (const cs of courierServices) {
    serviceFeesMap[cs.id] = 0
  }

  for (const group of groups) {
    let zoneType: ShippingZoneType = ShippingZoneType.CROSS_REGION
    if (isRemote) {
      zoneType = ShippingZoneType.REMOTE_AREA
    } else if (group.province === destinationProvince) {
      zoneType = ShippingZoneType.SAME_PROVINCE
    } else if (
      getRegionKey(group.province) === getRegionKey(destinationProvince)
    ) {
      zoneType = ShippingZoneType.SAME_REGION
    }

    for (const cs of courierServices) {
      if (serviceFeesMap[cs.id] === null) {
        continue
      }

      const rate = cs.weightRates.find(
        (r) =>
          r.zoneType === zoneType &&
          group.weight >= Number(r.minWeight) &&
          group.weight <= Number(r.maxWeight),
      )

      if (rate) {
        serviceFeesMap[cs.id] = (serviceFeesMap[cs.id] ?? 0) + Number(rate.fee)
      } else {
        serviceFeesMap[cs.id] = null
      }
    }
  }

  return courierServices.map((cs) => ({
    serviceId: cs.id,
    fee: serviceFeesMap[cs.id],
  }))
}
