'use server'

import { RegisterFormInputs } from '@/types/register'
import bcrypt from 'bcryptjs'

import { prisma } from '@/lib/prisma'

export async function registerUser(values: RegisterFormInputs) {
  const { email, password, confirmPassword } = values

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

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  })
}
