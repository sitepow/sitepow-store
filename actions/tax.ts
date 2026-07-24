'use server'

import { ActorType, LogAction } from '@/generated/prisma/enums'
import { serializeDecimal } from '@/utils/decimal'
import { TaxSettingFormValues } from '@/zod/tax'

import { createLog } from '@/lib/activity-log'
import { auth } from '@/lib/auth'
import { verifyStaffPermission } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'

export async function getTaxSetting(storeId: string) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return null
    }

    const authCheck = await verifyStaffPermission({
      userId,
      storeId,
      permission: 'canManageStoreSettings',
    })

    if (!authCheck.isAuthorized) {
      return null
    }

    return serializeDecimal(
      await prisma.store.findUnique({
        where: { id: storeId },
        select: { isVatRegistered: true, taxId: true, vatRate: true },
      }),
    )
  } catch {
    return null
  }
}

export async function updateTaxSetting(
  storeId: string,
  data: TaxSettingFormValues,
) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const authCheck = await verifyStaffPermission({
      userId,
      storeId,
      permission: 'canManageStoreSettings',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    const result = await prisma.store.update({
      where: { id: storeId },
      data: {
        ...data,
        vatRate: parseFloat(data.vatRate),
      },
    })

    await createLog({
      action: LogAction.UPDATE_STORE_SETTING,
      actorType: ActorType.MERCHANT,
      storeId,
      entity: 'Store',
      entityId: storeId,
      details: { setting: 'tax', updatedFields: Object.keys(data) },
    })

    return {
      success: true,
      message: 'บันทึกการตั้งค่าสำเร็จแล้ว',
      data: serializeDecimal(result),
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
    }
  }
}
