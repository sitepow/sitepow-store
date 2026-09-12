'use server'

import { ActorType, LogAction } from '@/generated/prisma/enums'
import { serializeDecimal } from '@/utils/decimal'
import { TaxSettingFormValues } from '@/zod/tax'

import { createLog } from '@/lib/activity-log'
import { getCurrentUser } from '@/lib/auth-server'
import { verifyEmployeePermission } from '@/lib/permission'
import { prisma } from '@/lib/prisma'

export async function getTaxSetting(storeId: string) {
  try {
    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return null
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canViewTax',
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
      permission: 'canUpdateTax',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        messageTH: authCheck.messageTH || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
        messageEN: authCheck.messageEN || 'Insufficient permissions',
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
      messageTH: 'บันทึกการตั้งค่าสำเร็จแล้ว',
      messageEN: 'Tax settings updated successfully',
      data: serializeDecimal(result),
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
    }
  }
}
