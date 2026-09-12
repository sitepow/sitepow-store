'use server'

import { ChangePasswordFormValues } from '@/zod/storefront/change-password'
import bcrypt from 'bcryptjs'

import { getCurrentUser } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'

export async function updatePassword(input: ChangePasswordFormValues) {
  try {
    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return {
        success: false,
        messageTH: 'ไม่พบข้อมูลผู้ใช้งาน',
        messageEN: 'User not found',
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    })

    if (!user?.password) {
      return {
        success: false,
        messageTH: 'ไม่พบข้อมูลรหัสผ่าน',
        messageEN: 'Password data not found',
      }
    }

    const isPasswordValid = await bcrypt.compare(
      input.currentPassword,
      user.password,
    )
    if (!isPasswordValid) {
      return {
        success: false,
        messageTH: 'รหัสผ่านปัจจุบันไม่ถูกต้อง',
        messageEN: 'Current password is incorrect',
      }
    }

    const hashedPassword = await bcrypt.hash(input.newPassword, 10)

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    return {
      success: true,
      messageTH: 'เปลี่ยนรหัสผ่านสำเร็จแล้ว',
      messageEN: 'Password changed successfully',
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
