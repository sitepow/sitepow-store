'use server'

import { ActorType, LogAction, Prisma } from '@/generated/prisma/client'
import { NotificationSettingsFormValues } from '@/zod/notification-settings'

import { createLog } from '@/lib/activity-log'
import { getCurrentUser } from '@/lib/auth-server'
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
    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return null
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canViewNotifications',
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
      return {
        success: false,
        messageTH: 'ไม่พบ Store ID',
        messageEN: 'Store ID not found',
      }
    }

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
      permission: 'canUpdateNotifications',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        messageTH: authCheck.messageTH || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
        messageEN: authCheck.messageEN || 'Insufficient permissions',
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

    return {
      success: true,
      messageTH: 'บันทึกการตั้งค่าการแจ้งเตือนสำเร็จ',
      messageEN: 'Notification settings updated successfully',
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
