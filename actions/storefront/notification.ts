'use server'

import { NotificationSettingsFormValues } from '@/zod/storefront/notification-settings'

import { getCurrentUser } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'

export async function getNotificationSettings() {
  try {
    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return null
    }

    const settings = await prisma.user.findUnique({
      where: { id: userId },
      select: { orderNotify: true, marketingNotify: true },
    })

    return settings
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function updateNotificationSettings(
  input: NotificationSettingsFormValues,
) {
  try {
    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return { success: false, message: 'ไม่พบข้อมูลผู้ใช้งาน' }
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        orderNotify: input.orderNotify,
        marketingNotify: input.marketingNotify,
      },
    })

    return { success: true, message: 'บันทึกการตั้งค่าสำเร็จแล้ว' }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
