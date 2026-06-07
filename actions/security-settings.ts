'use server'

import { Prisma } from '@/generated/prisma/client'
import { ChangePasswordFormValues } from '@/zod/security-settings'
import bcrypt from 'bcryptjs'

import { prisma } from '@/lib/prisma'

const securitySettingsSelect = {
  isTwoFactorEnabled: true,
  password: true,
} satisfies Prisma.UserSelect

export type GetSecuritySettingsResult = Prisma.UserGetPayload<{
  select: typeof securitySettingsSelect
}>

export async function getSecuritySettings(
  userId: string,
): Promise<GetSecuritySettingsResult | null> {
  if (!userId) {
    return null
  }

  try {
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
) {
  try {
    if (!userId) {
      return { success: false, message: 'ไม่พบ User ID' }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    })

    if (!user) {
      return { success: false, message: 'ไม่พบบัญชีผู้ใช้' }
    }

    if (user.password) {
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

    return { success: true, message: 'อัปเดตรหัสผ่านสำเร็จ' }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function updateTwoFactor(
  userId: string,
  isTwoFactorEnabled: boolean,
) {
  try {
    if (!userId) {
      return { success: false, message: 'ไม่พบ User ID' }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isTwoFactorEnabled },
    })

    return { success: true, message: 'อัปเดตการตั้งค่า 2FA สำเร็จ' }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
