'use server'

import { auth } from '@/auth'
import { NotificationSettingsFormValues } from '@/zod/storefront/notification-settings'

import { prisma } from '@/lib/prisma'

export async function getNotificationSettings() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('ไม่พบข้อมูลผู้ใช้งาน')
  }

  const settings = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { orderNotify: true, marketingNotify: true },
  })

  return settings
}

export async function updateNotificationSettings(
  input: NotificationSettingsFormValues,
) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('ไม่พบข้อมูลผู้ใช้งาน')
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      orderNotify: input.orderNotify,
      marketingNotify: input.marketingNotify,
    },
  })

  return { success: true, message: 'บันทึกการตั้งค่าสำเร็จแล้ว' }
}
