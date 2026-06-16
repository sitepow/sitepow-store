'use server'

import { auth } from '@/auth'
import { ChangePasswordFormValues } from '@/zod/storefront/change-password'
import bcrypt from 'bcryptjs'

import { prisma } from '@/lib/prisma'

export async function updatePassword(input: ChangePasswordFormValues) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('ไม่พบข้อมูลผู้ใช้งาน')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  })

  if (!user?.password) {
    throw new Error('ไม่พบข้อมูลรหัสผ่าน')
  }

  const isPasswordValid = await bcrypt.compare(
    input.currentPassword,
    user.password,
  )
  if (!isPasswordValid) {
    throw new Error('รหัสผ่านปัจจุบันไม่ถูกต้อง')
  }

  const hashedPassword = await bcrypt.hash(input.newPassword, 10)

  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashedPassword },
  })

  return {
    success: true,
    message: 'เปลี่ยนรหัสผ่านสำเร็จแล้ว',
  }
}
