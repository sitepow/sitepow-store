'use server'

import { ChangePasswordFormValues } from '@/zod/storefront/change-password'
import bcrypt from 'bcryptjs'

import { getCurrentUser } from '@/lib/auth/server'
import { prisma } from '@/lib/db/prisma'

export async function updatePassword(input: ChangePasswordFormValues) {
  try {
    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return { success: false, message: 'ไม่พบข้อมูลผู้ใช้งาน' }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    })

    if (!user?.password) {
      return { success: false, message: 'ไม่พบข้อมูลรหัสผ่าน' }
    }

    const isPasswordValid = await bcrypt.compare(
      input.currentPassword,
      user.password,
    )
    if (!isPasswordValid) {
      return { success: false, message: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' }
    }

    const hashedPassword = await bcrypt.hash(input.newPassword, 10)

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    return {
      success: true,
      message: 'เปลี่ยนรหัสผ่านสำเร็จแล้ว',
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
