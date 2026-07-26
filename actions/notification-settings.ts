'use server'

import { ActorType, LogAction, Prisma } from '@/generated/prisma/client'
import { NotificationSettingsFormValues } from '@/zod/notification-settings'

import { createLog } from '@/lib/activity-log'
import { auth } from '@/lib/auth'
import { verifyEmployeePermission } from '@/lib/permission'
import { prisma } from '@/lib/prisma'

const notificationSettingsSelect = {
  notifyLowStock: true,
  notifyDailySummary: true,
  notifyBillingAlert: true,
} satisfies Prisma.StoreSelect

export type GetNotificationSettingsResult = Prisma.StoreGetPayload<{
  select: typeof notificationSettingsSelect
}>

export async function getNotificationSettings(
  storeId: string,
): Promise<GetNotificationSettingsResult | null> {
  if (!storeId) {
    return null
  }

  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return null
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canManageStoreSettings',
    })

    if (!authCheck.isAuthorized) {
      return null
    }

    return await prisma.store.findUnique({
      where: { id: storeId },
      select: notificationSettingsSelect,
    })
  } catch {
    return null
  }
}

export async function updateNotificationSettings(
  storeId: string,
  input: NotificationSettingsFormValues,
) {
  try {
    if (!storeId) {
      return { success: false, message: 'ไม่พบ Store ID' }
    }

    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const authCheck = await verifyEmployeePermission({
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

    await prisma.store.update({
      where: { id: storeId },
      data: input,
    })

    await createLog({
      action: LogAction.UPDATE_STORE_SETTING,
      actorType: ActorType.MERCHANT,
      storeId,
      entity: 'Store',
      entityId: storeId,
      details: { setting: 'notification', updatedFields: Object.keys(input) },
    })

    return { success: true, message: 'บันทึกการตั้งค่าการแจ้งเตือนสำเร็จ' }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
