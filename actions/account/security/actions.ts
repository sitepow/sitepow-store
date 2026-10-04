'use server'

import { ActorType, LogAction, Prisma } from '@/generated/prisma/client'
import { ChangePasswordFormValues } from '@/zod/account/security'
import bcrypt from 'bcryptjs'

import { createLog } from '@/lib/activity/log'
import { getCurrentUser } from '@/lib/auth/server'
import { verifyEmployeePermission } from '@/lib/auth/permission'
import { prisma } from '@/lib/db/prisma'

const securitySettingsSelect = {
  isTwoFactorEnabled: true,
  password: true,
} satisfies Prisma.UserSelect

export type GetSecuritySettingsResult = Prisma.UserGetPayload<{
  select: typeof securitySettingsSelect
}>

export async function getSecuritySettings(
  userId: string,
  storeId?: string,
): Promise<GetSecuritySettingsResult | null> {
  if (!userId) {
    return null
  }

  try {
    const userSession = await getCurrentUser()
    const currentUserId = userSession?.id

    if (!currentUserId) {
      return null
    }

    if (currentUserId !== userId) {
      if (!storeId) {
        return null
      }
      const authCheck = await verifyEmployeePermission({
        userId: currentUserId,
        storeId,
        permission: 'canViewSecurity',
      })
      if (!authCheck.isAuthorized) {
        return null
      }
    }

    return await prisma.user.findUnique({
      where: { id: userId },
      select: securitySettingsSelect,
    })
  } catch {
    return null
  }
}

export async function updateSecuritySettings(
  userId: string,
  input: ChangePasswordFormValues,
  storeId?: string,
) {
  try {
    if (!userId) {
      return { success: false, message: 'ไม่พบ User ID' }
    }

    const userSession = await getCurrentUser()
    const currentUserId = userSession?.id

    if (!currentUserId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    if (currentUserId !== userId) {
      if (!storeId) {
        return { success: false, message: 'สิทธิ์การใช้งานของคุณไม่เพียงพอ' }
      }
      const authCheck = await verifyEmployeePermission({
        userId: currentUserId,
        storeId,
        permission: 'canUpdateSecurity',
      })
      if (!authCheck.isAuthorized) {
        return {
          success: false,
          message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
        }
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    })

    if (!user) {
      return { success: false, message: 'ไม่พบบัญชีผู้ใช้' }
    }

    if (currentUserId === userId && user.password) {
      const isMatch = await bcrypt.compare(input.currentPassword, user.password)
      if (!isMatch) {
        return { success: false, message: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' }
      }
    }

    const hashedPassword = await bcrypt.hash(input.newPassword, 10)

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    await createLog({
      action: LogAction.UPDATE_STORE_SETTING,
      actorType: ActorType.MERCHANT,
      entity: 'User',
      entityId: userId,
      details: { setting: 'password_changed' },
    })

    return { success: true, message: 'อัปเดตรหัสผ่านสำเร็จ' }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function updateTwoFactor(
  userId: string,
  isTwoFactorEnabled: boolean,
  storeId?: string,
) {
  try {
    if (!userId) {
      return { success: false, message: 'ไม่พบ User ID' }
    }

    const userSession = await getCurrentUser()
    const currentUserId = userSession?.id

    if (!currentUserId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    if (currentUserId !== userId) {
      if (!storeId) {
        return { success: false, message: 'สิทธิ์การใช้งานของคุณไม่เพียงพอ' }
      }
      const authCheck = await verifyEmployeePermission({
        userId: currentUserId,
        storeId,
        permission: 'canUpdateSecurity',
      })
      if (!authCheck.isAuthorized) {
        return {
          success: false,
          message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
        }
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isTwoFactorEnabled },
    })

    await createLog({
      action: LogAction.UPDATE_STORE_SETTING,
      actorType: ActorType.MERCHANT,
      entity: 'User',
      entityId: userId,
      details: { setting: '2fa', isTwoFactorEnabled },
    })

    return { success: true, message: 'อัปเดตการตั้งค่า 2FA สำเร็จ' }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
