'use server'

import { DEFAULT_INTERNATIONAL_ZONES, REMOTE_AREAS } from '@/constants/shipping'
import { Prisma } from '@/generated/prisma/client'
import {
  ActorType,
  CountryCode,
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
import { getCurrentUser } from '@/lib/auth-server'
import { verifyEmployeePermission } from '@/lib/permission'
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
  try {
    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return null
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canViewShipping',
    })

    if (!authCheck.isAuthorized) {
      return null
    }

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
  } catch {
    return null
  }
}

export async function updateStoreShippingSettings(
  storeId: string,
  branchId: string,
  data: ShippingFormValues,
) {
  try {
    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return {
        success: false,
        messageTH: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
        messageEN: 'Please sign in to proceed',
      }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canUpdateShipping',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        messageTH: authCheck.messageTH || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
        messageEN: authCheck.messageEN || 'Insufficient permissions',
      }
    }

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
          freeShipMin: data.isFreeShipEnabled ? data.freeShipMin : 150,
        },
        update: {
          isFreeShipEnabled: data.isFreeShipEnabled,
          freeShipMin: data.isFreeShipEnabled ? data.freeShipMin : 150,
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

    return {
      success: true,
      messageTH: 'บันทึกข้อมูลการจัดส่งสำเร็จแล้ว',
      messageEN: 'Shipping settings updated successfully',
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function calculateMultiBranchShippingFee(params: {
  storeId: string
  destinationCountry?: CountryCode
  destinationProvince: string
  destinationPostcode: string
  groups: Array<{ branchId: string; province: string; weight: number }>
}) {
  const {
    storeId,
    destinationCountry = CountryCode.TH,
    destinationProvince,
    destinationPostcode,
    groups,
  } = params

  if (destinationCountry !== CountryCode.TH) {
    const rawTotalWeight = groups.reduce((sum, g) => sum + (g.weight || 0), 0)
    let totalWeight =
      rawTotalWeight > 100 ? rawTotalWeight / 1000 : rawTotalWeight
    if (totalWeight <= 0) {
      totalWeight = 0.5
    }

    const customZone = await prisma.shippingZone.findFirst({
      where: {
        storeId,
        countries: { has: destinationCountry },
      },
      include: { rates: true },
    })

    if (customZone && customZone.rates.length > 0) {
      return customZone.rates.map((rate) => {
        const matches =
          totalWeight >= Number(rate.minWeight) &&
          totalWeight <= Number(rate.maxWeight)
        return {
          serviceId: rate.id,
          fee: matches ? Number(rate.fee) : null,
        }
      })
    }

    const defaultPreset =
      DEFAULT_INTERNATIONAL_ZONES.find((z) =>
        z.countries.includes(destinationCountry),
      ) ?? DEFAULT_INTERNATIONAL_ZONES[DEFAULT_INTERNATIONAL_ZONES.length - 1]

    return defaultPreset.services.map((srv) => {
      const matchedTier = srv.weightRates.find(
        (wr) => totalWeight >= wr.minWeight && totalWeight <= wr.maxWeight,
      )
      return {
        serviceId: srv.id,
        fee: matchedTier ? matchedTier.fee : null,
      }
    })
  }

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
