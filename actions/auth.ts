'use server'

import { UserRole } from '@/generated/prisma/enums'
import { RegisterFormInputs } from '@/types/register'
import bcrypt from 'bcryptjs'

import { prisma } from '@/lib/prisma'

export async function registerUser(values: RegisterFormInputs) {
  const { email, password, confirmPassword, userRole } = values

  if (password !== confirmPassword) {
    throw new Error('รหัสผ่านไม่ตรงกัน')
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    throw new Error('อีเมลนี้ถูกใช้งานแล้ว')
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: userRole,
    },
  })

  if (userRole === UserRole.CUSTOMER) {
    await prisma.customer.create({
      data: {
        email,
        userId: user.id,
      },
    })
  }
}
