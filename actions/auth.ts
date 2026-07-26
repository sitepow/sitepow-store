'use server'

import {
  MILLISECONDS_PER_MINUTE,
  OTP_EXPIRY_MINUTES,
  OTP_MAX_RANGE,
  OTP_MIN_RANGE,
} from '@/constants/system'
import { UserRole } from '@/generated/prisma/enums'
import { RegisterFormInputs } from '@/types/register'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

import { prisma } from '@/lib/prisma'

export async function registerUser(values: RegisterFormInputs) {
  try {
    const { email, password, confirmPassword, userRole } = values

    if (password !== confirmPassword) {
      return { success: false, message: 'รหัสผ่านไม่ตรงกัน' }
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: {
        customer: true,
        employee: true,
      },
    })

    if (existingUser) {
      if (existingUser.role === userRole) {
        return { success: false, message: 'อีเมลนี้ถูกใช้งานในระบบแล้ว' }
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
          success: true,
          message:
            'อัปเดตบัญชีของคุณเป็นผู้ขายเรียบร้อย กรุณาเข้าสู่ระบบเพื่อตั้งค่าร้านค้า',
        }
      }

      if (
        existingUser.role === UserRole.MERCHANT &&
        userRole === UserRole.CUSTOMER
      ) {
        if (!existingUser.customer) {
          await prisma.customer.create({
            data: {
              email,
              userId: existingUser.id,
            },
          })
        }
        return {
          success: true,
          message:
            'บัญชีร้านค้าของคุณสามารถใช้ซื้อสินค้าได้ทันที กรุณาเข้าสู่ระบบ',
        }
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const otp = crypto.randomInt(OTP_MIN_RANGE, OTP_MAX_RANGE).toString()
    const otpDurationInMs = OTP_EXPIRY_MINUTES * MILLISECONDS_PER_MINUTE
    const otpExpires = new Date(Date.now() + otpDurationInMs)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: userRole,
        otp: otp,
        otpExpires: otpExpires,
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
      success: true,
      message: 'ลงทะเบียนสำเร็จเรียบร้อยแล้ว!',
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
