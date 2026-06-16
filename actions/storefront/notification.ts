'use server'

import { auth } from '@/auth'
import { NotificationSettingsFormValues } from '@/zod/storefront/notification-settings'

import { prisma } from '@/lib/prisma'

export async function getNotificationSettings() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return null
    }

    const settings = await prisma.user.findUnique({
      where: { id: session.user.id },
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
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, message: 'ไม่พบข้อมูลผู้ใช้งาน' }
    }

    await prisma.user.update({
      where: { id: session.user.id },
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
