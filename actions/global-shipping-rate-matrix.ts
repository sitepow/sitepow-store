'use server'

import { COURIERS_LIST } from '@/constants/shipping'
import { Prisma } from '@/generated/prisma/client'
import { AggregatedRate, getProvinceDetails } from '@/utils/shipping'

import { prisma } from '@/lib/prisma'

export interface GlobalShippingRateMatrixPayload {
  fromProvince: string
  ratesMatrix: Record<string, AggregatedRate[]>
}

export async function getGlobalShippingRateMatrixMetadata(
  fromProvince: string,
) {
  const matrix = await prisma.globalShippingRateMatrix.findUnique({
    where: { fromProvince },
    select: { updatedAt: true },
  })

  return matrix
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

export async function applyGlobalRatesToStore(
  storeId: string,
  fromProvince: string,
): Promise<void> {
  if (!fromProvince) {
    throw new Error('กรุณาระบุจังหวัดต้นทางของร้านค้าก่อนดำเนินการ')
  }

  const provinceDetails = getProvinceDetails(fromProvince)
  const matrixRow = await prisma.globalShippingRateMatrix.findUnique({
    where: { fromProvince },
  })

  if (!matrixRow) {
    throw new Error(`ไม่พบข้อมูลเรทจัดส่งสำหรับจังหวัด ${fromProvince}`)
  }

  const ratesMatrix = matrixRow.ratesMatrix as unknown as Record<
    string,
    AggregatedRate[]
  >

  await prisma.$transaction(async (tx) => {
    await tx.store.update({
      where: { id: storeId },
      data: {
        province: fromProvince,
        district: provinceDetails.state,
        subDistrict: provinceDetails.district,
        postcode: provinceDetails.postcode,
      },
    })

    for (const courier of COURIERS_LIST) {
      await tx.courier.upsert({
        where: { id: courier.id },
        update: {},
        create: { id: courier.id, code: courier.code, name: courier.name },
      })

      for (const service of courier.services) {
        await tx.courierService.upsert({
          where: { id: service.id },
          update: {},
          create: {
            id: service.id,
            courierId: courier.id,
            code: service.code,
            name: service.name,
          },
        })
      }
    }

    const allServiceIds = COURIERS_LIST.flatMap((c) =>
      c.services.map((s) => s.id),
    )

    for (const courierServiceId of allServiceIds) {
      const storeCourierService = await tx.storeCourierService.upsert({
        where: { storeId_courierServiceId: { storeId, courierServiceId } },
        update: {},
        create: { storeId, courierServiceId, isEnabled: true },
      })

      const rates = ratesMatrix[courierServiceId]
      if (!rates || rates.length === 0) {
        continue
      }

      await tx.storeServiceWeightRate.deleteMany({
        where: { storeCourierServiceId: storeCourierService.id },
      })

      await tx.storeServiceWeightRate.createMany({
        data: rates.map((rate) => ({
          storeCourierServiceId: storeCourierService.id,
          zoneType: rate.zoneType,
          minWeight: rate.minWeight,
          maxWeight: rate.maxWeight,
          fee: rate.fee,
        })),
      })
    }
  })
}
