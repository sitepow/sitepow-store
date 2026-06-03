'use server'

import { ShippingZoneType } from '@/generated/prisma/enums'
import { ShippingFormValues } from '@/zod/shipping'

import { prisma } from '@/lib/prisma'

export async function getStoreShippingSettings(
  storeId: string,
): Promise<Partial<ShippingFormValues> | null> {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: {
      province: true,
      district: true,
      postcode: true,
      shippingSetting: {
        select: {
          isFreeShipEnabled: true,
          freeShipMin: true,
        },
      },
      storeCourierServices: {
        include: { weightRates: true },
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
    storeProvince: store.province || '',
    storeDistrict: store.district || '',
    storePostcode: store.postcode ? Number(store.postcode) : 0,
    isFreeShipEnabled: store.shippingSetting?.isFreeShipEnabled ?? false,
    freeShipMin: store.shippingSetting?.freeShipMin
      ? Number(store.shippingSetting.freeShipMin)
      : 0,
    services,
  }
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

        await tx.storeServiceWeightRate.deleteMany({
          where: {
            storeCourierServiceId: courierServiceRecord.id,
          },
        })

        if (service.weightRates.length > 0) {
          await tx.storeServiceWeightRate.createMany({
            data: service.weightRates.map((wr) => ({
              storeCourierServiceId: courierServiceRecord.id,
              zoneType: wr.zoneType as ShippingZoneType,
              minWeight: wr.minWeight,
              maxWeight: wr.maxWeight,
              fee: wr.fee,
            })),
          })
        }
      }
    })
  } catch {
    throw new Error('ไม่สามารถบันทึกข้อมูลการจัดส่งได้')
  }
}
