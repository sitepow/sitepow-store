'use server'

import { Prisma } from '@/generated/prisma/client'
import { NotificationSettingsFormValues } from '@/zod/notification-settings'

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

    await prisma.store.update({
      where: { id: storeId },
      data: input,
    })

    return { success: true, message: 'บันทึกการตั้งค่าการแจ้งเตือนสำเร็จ' }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
