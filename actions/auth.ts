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
    include: {
      customerProfile: true,
      staffProfile: true,
    },
  })

  if (existingUser) {
    if (existingUser.role === userRole) {
      throw new Error('อีเมลนี้ถูกใช้งานในระบบแล้ว')
    }

    if (
      existingUser.role === UserRole.CUSTOMER &&
      userRole === UserRole.MERCHANT
    ) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { role: UserRole.MERCHANT },
      })

      return {
        message:
          'อัปเดตบัญชีของคุณเป็นผู้ขายเรียบร้อย กรุณาเข้าสู่ระบบเพื่อตั้งค่าร้านค้า',
      }
    }

    if (
      existingUser.role === UserRole.MERCHANT &&
      userRole === UserRole.CUSTOMER
    ) {
      if (!existingUser.customerProfile) {
        await prisma.customer.create({
          data: {
            email,
            userId: existingUser.id,
          },
        })
      }
      return {
        message:
          'บัญชีร้านค้าของคุณสามารถใช้ซื้อสินค้าได้ทันที กรุณาเข้าสู่ระบบ',
      }
    }
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

  return {
    message: 'ลงทะเบียนสำเร็จเรียบร้อยแล้ว!',
  }
}
