'use server'

import { UserRole } from '@/generated/prisma/enums'
import { RegisterFormInputs } from '@/types/auth'
import { isPast } from '@/utils/formatting/date'
import { generateOtp } from '@/utils/auth/otp'
import bcrypt from 'bcryptjs'

import { prisma } from '@/lib/db/prisma'

import { sendOtpEmail } from '@/actions/account/email-verification/actions'

export interface RequestOtpInput {
  email: string
}

export interface ResetPasswordWithOtpInput {
  email: string
  otp: string
  newPassword: string
}

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
    const { otp, otpExpires } = generateOtp()

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: userRole,
        otp: otp,
        otpExpires: otpExpires,
        accounts: {
          create: {
            accountId: email,
            providerId: 'credential',
            password: hashedPassword,
          },
        },
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

    try {
      await sendOtpEmail(email, otp)
    } catch (error) {
      console.error(error)
      return {
        success: true,
        message:
          'ลงทะเบียนสำเร็จเรียบร้อยแล้ว แต่ระบบไม่สามารถส่งอีเมล OTP ได้ในขณะนี้ กรุณากดขอ OTP ใหม่อีกครั้ง',
      }
    }

    return {
      success: true,
      message:
        'ลงทะเบียนสำเร็จเรียบร้อยแล้ว! กรุณาตรวจสอบอีเมลเพื่อยืนยัน OTP!',
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function requestForgotPasswordOtp(input: RequestOtpInput) {
  try {
    const { email } = input

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return { success: false, message: 'ไม่พบผู้ใช้งานด้วยอีเมลนี้ในระบบ' }
    }

    let otpToSend = user.otp

    const isOtpValid = user.otp && user.otpExpires && !isPast(user.otpExpires)

    if (!isOtpValid) {
      const { otp: newOtp, otpExpires } = generateOtp()

      await prisma.user.update({
        where: { id: user.id },
        data: {
          otp: newOtp,
          otpExpires: otpExpires,
        },
      })

      otpToSend = newOtp
    }

    try {
      await sendOtpEmail(email, otpToSend!)
    } catch (error) {
      console.error(error)
      return {
        success: false,
      }
    }

    return {
      success: true,
      message: isOtpValid
        ? 'ส่งรหัส OTP เดิมที่ยังไม่หมดอายุไปยังอีเมลเรียบร้อยแล้ว'
        : 'ส่งรหัส OTP ใหม่ไปยังอีเมลเรียบร้อยแล้ว',
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
    }
  }
}

export async function resetPasswordWithOtp(input: ResetPasswordWithOtpInput) {
  try {
    const { email, otp, newPassword } = input

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return { success: false, message: 'ไม่พบผู้ใช้งานในระบบ' }
    }

    if (!user.otp || !user.otpExpires) {
      return { success: false, message: 'กรุณากดขอรหัส OTP ก่อนทำรายการ' }
    }

    if (user.otp !== otp) {
      return { success: false, message: 'รหัส OTP ไม่ถูกต้อง' }
    }

    if (isPast(user.otpExpires)) {
      return { success: false, message: 'รหัส OTP หมดอายุแล้ว กรุณาขอรหัสใหม่' }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          otp: null,
          otpExpires: null,
        },
      }),
      prisma.account.updateMany({
        where: {
          userId: user.id,
          providerId: 'credential',
        },
        data: {
          password: hashedPassword,
        },
      }),
    ])

    return {
      success: true,
      message: 'ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว',
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
    }
  }
}
