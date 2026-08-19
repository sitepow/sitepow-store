'use server'

import { ActorType, LogAction, Prisma } from '@/generated/prisma/client'
import { serializeDecimal } from '@/utils/decimal'

import { createLog } from '@/lib/activity-log'
import { getCurrentUser } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'

const profileSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
  phone: true,
  createdAt: true,
  emailVerified: true,
} satisfies Prisma.UserSelect

export type ProfileData = NonNullable<Awaited<ReturnType<typeof getProfile>>>

export async function getProfile() {
  try {
    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: profileSelect,
    })

    if (!user) {
      return null
    }

    return serializeDecimal(user)
  } catch (error) {
    console.error(error)
    return null
  }
}

export interface UpdateProfileInput {
  firstName: string
  lastName: string
  phone?: string
  image?: string
}

export async function updateProfile(input: UpdateProfileInput) {
  try {
    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return { success: false, message: 'ไม่พบข้อมูลผู้ใช้งาน' }
    }

    const fullName = `${input.firstName.trim()} ${input.lastName.trim()}`.trim()

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        name: fullName,
        phone: input.phone ?? null,
        ...(input.image !== undefined && { image: input.image }),
      },
      select: profileSelect,
    })

    await createLog({
      action: LogAction.UPDATE_STORE_SETTING,
      actorType: ActorType.MERCHANT,
      entity: 'User',
      entityId: userId,
      details: { setting: 'profile', updatedFields: Object.keys(input) },
    })

    return {
      success: true,
      message: 'บันทึกข้อมูลสำเร็จแล้ว',
      data: serializeDecimal(updated),
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
