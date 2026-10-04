'use server'

import { COURIERS_LIST } from '@/constants/store/shipping'
import { ActorType, LogAction, Prisma } from '@/generated/prisma/client'
import {
  AggregatedRate,
  getProvinceDetails,
  syncStoreServiceWeightRates,
} from '@/utils/shipping/shipping'

import { createLog } from '@/lib/activity/log'
import { auth } from '@/lib/auth/config'
import { getCurrentUser } from '@/lib/auth/server'
import { verifyEmployeePermission } from '@/lib/auth/permission'
import { prisma } from '@/lib/db/prisma'

const MatrixSelect = {
  fromProvince: true,
  updatedAt: true,
} satisfies Prisma.GlobalShippingRateMatrixSelect

export interface GlobalShippingRateMatrixPayload {
  fromProvince: string
  ratesMatrix: Record<string, AggregatedRate[]>
}

export type GetMatrixItem = Prisma.GlobalShippingRateMatrixGetPayload<{
  select: typeof MatrixSelect
}> | null

export async function getGlobalShippingRateMatrixProvinces() {
  return await prisma.globalShippingRateMatrix.findMany({
    select: {
      fromProvince: true,
    },
    orderBy: {
      fromProvince: 'asc',
    },
  })
}

export async function getGlobalShippingRateMatrixMetadata(
  fromProvince: string,
): Promise<GetMatrixItem> {
  return await prisma.globalShippingRateMatrix.findUnique({
    where: { fromProvince },
    select: MatrixSelect,
  })
}

export async function upsertGlobalShippingRateMatrix(
  payloads: GlobalShippingRateMatrixPayload[],
) {
  try {
    await Promise.all(
      payloads.map((payload) =>
        prisma.globalShippingRateMatrix.upsert({
          where: { fromProvince: payload.fromProvince },
          update: {
            ratesMatrix:
              payload.ratesMatrix as unknown as Prisma.InputJsonValue,
          },
          create: {
            fromProvince: payload.fromProvince,
            ratesMatrix:
              payload.ratesMatrix as unknown as Prisma.InputJsonValue,
          },
        }),
      ),
    )

    await createLog({
      action: LogAction.UPDATE_STORE_SETTING,
      actorType: ActorType.SUPER_ADMIN,
      entity: 'GlobalShippingRateMatrix',
      details: { provinces: payloads.map((p) => p.fromProvince) },
    })

    return { success: true, message: 'บันทึกข้อมูลเรทจัดส่งกลางสำเร็จแล้ว' }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function applyGlobalRatesToStore(
  storeId: string,
  branchId: string,
  fromProvince: string,
) {
  try {
    if (!storeId) {
      return { success: false, message: 'ไม่พบ Store ID' }
    }

    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canUpdateShipping',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    if (!fromProvince) {
      return {
        success: false,
        message: 'กรุณาระบุจังหวัดต้นทางของร้านค้าก่อนดำเนินการ',
      }
    }

    const provinceDetails = getProvinceDetails(fromProvince)
    const matrixRow = await prisma.globalShippingRateMatrix.findUnique({
      where: { fromProvince },
    })

    if (!matrixRow) {
      return {
        success: false,
        message: `ไม่พบข้อมูลเรทจัดส่งสำหรับจังหวัด ${fromProvince}`,
      }
    }

    const ratesMatrix = matrixRow.ratesMatrix as unknown as Record<
      string,
      AggregatedRate[]
    >

    for (const courier of COURIERS_LIST) {
      await prisma.courier.upsert({
        where: { id: courier.id },
        update: {},
        create: { id: courier.id, name: courier.name },
      })

      for (const service of courier.services) {
        await prisma.courierService.upsert({
          where: { id: service.id },
          update: {},
          create: {
            id: service.id,
            courierId: courier.id,
            name: service.name,
            estimatedDays: service.estimatedDays,
          },
        })
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.branch.update({
        where: { id: branchId },
        data: {
          province: fromProvince,
          district: provinceDetails.state,
          subDistrict: provinceDetails.district,
          postcode: provinceDetails.postcode,
        },
      })

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

        await syncStoreServiceWeightRates(tx, storeCourierService.id, rates)
      }
    })

    await createLog({
      action: LogAction.UPDATE_STORE_SETTING,
      actorType: ActorType.MERCHANT,
      storeId,
      entity: 'ShippingSetting',
      entityId: storeId,
      details: { fromProvince, branchId, type: 'applied_global_rates' },
    })

    return { success: true, message: 'ปรับใช้เรทจัดส่งกลางเรียบร้อยแล้ว' }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
