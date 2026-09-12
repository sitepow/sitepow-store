'use server'

import {
  MILLISECONDS_PER_MINUTE,
  OTP_EXPIRY_MINUTES,
  OTP_MAX_RANGE,
  OTP_MIN_RANGE,
  SERVER_ERROR_MESSAGE_EN,
  SERVER_ERROR_MESSAGE_TH,
} from '@/constants/system'
import { UserRole } from '@/generated/prisma/enums'
import { RegisterFormInputs } from '@/types/register'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

import { prisma } from '@/lib/prisma'

import { sendOtpEmail } from './email'

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
      return {
        success: false,
        messageTH: 'รหัสผ่านไม่ตรงกัน',
        messageEN: 'Passwords do not match',
        message: 'รหัสผ่านไม่ตรงกัน',
      }
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
        return {
          success: false,
          messageTH: 'อีเมลนี้ถูกใช้งานในระบบแล้ว',
          messageEN: 'This email is already in use',
          message: 'อีเมลนี้ถูกใช้งานในระบบแล้ว',
        }
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
          messageTH:
            'อัปเดตบัญชีของคุณเป็นผู้ขายเรียบร้อย กรุณาเข้าสู่ระบบเพื่อตั้งค่าร้านค้า',
          messageEN:
            'Your account has been updated to merchant. Please log in to set up your store',
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
          messageTH:
            'บัญชีร้านค้าของคุณสามารถใช้ซื้อสินค้าได้ทันที กรุณาเข้าสู่ระบบ',
          messageEN:
            'Your merchant account can be used to purchase products immediately. Please log in',
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
        messageTH:
          'ลงทะเบียนสำเร็จเรียบร้อยแล้ว แต่ระบบไม่สามารถส่งอีเมล OTP ได้ในขณะนี้ กรุณากดขอ OTP ใหม่อีกครั้ง',
        messageEN:
          'Registration successful, but failed to send OTP email at this time. Please request OTP again',
        message:
          'ลงทะเบียนสำเร็จเรียบร้อยแล้ว แต่ระบบไม่สามารถส่งอีเมล OTP ได้ในขณะนี้ กรุณากดขอ OTP ใหม่อีกครั้ง',
      }
    }

    return {
      success: true,
      messageTH:
        'ลงทะเบียนสำเร็จเรียบร้อยแล้ว! กรุณาตรวจสอบอีเมลเพื่อยืนยัน OTP!',
      messageEN:
        'Registration successful! Please check your email to verify OTP!',
      message:
        'ลงทะเบียนสำเร็จเรียบร้อยแล้ว! กรุณาตรวจสอบอีเมลเพื่อยืนยัน OTP!',
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      messageTH: SERVER_ERROR_MESSAGE_TH,
      messageEN: SERVER_ERROR_MESSAGE_EN,
      message: SERVER_ERROR_MESSAGE_TH,
    }
  }
}

export async function requestForgotPasswordOtp(input: RequestOtpInput) {
  try {
    const { email } = input

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return {
        success: false,
        messageTH: 'ไม่พบผู้ใช้งานด้วยอีเมลนี้ในระบบ',
        messageEN: 'No user found with this email in the system',
        message: 'ไม่พบผู้ใช้งานด้วยอีเมลนี้ในระบบ',
      }
    }

    const now = new Date()
    let otpToSend = user.otp

    const isOtpValid =
      user.otp && user.otpExpires && new Date(user.otpExpires) > now

    if (!isOtpValid) {
      const newOtp = crypto.randomInt(OTP_MIN_RANGE, OTP_MAX_RANGE).toString()
      const otpDurationInMs = OTP_EXPIRY_MINUTES * MILLISECONDS_PER_MINUTE
      const otpExpires = new Date(Date.now() + otpDurationInMs)

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
        messageTH: 'ไม่สามารถส่งอีเมล OTP ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง',
        messageEN: 'Failed to send OTP email at this time. Please try again',
        message: 'ไม่สามารถส่งอีเมล OTP ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง',
      }
    }

    const otpMsgTH = isOtpValid
      ? 'ส่งรหัส OTP เดิมที่ยังไม่หมดอายุไปยังอีเมลเรียบร้อยแล้ว'
      : 'ส่งรหัส OTP ใหม่ไปยังอีเมลเรียบร้อยแล้ว'
    const otpMsgEN = isOtpValid
      ? 'Existing valid OTP has been sent to your email'
      : 'A new OTP has been sent to your email'

    return {
      success: true,
      messageTH: otpMsgTH,
      messageEN: otpMsgEN,
      message: otpMsgTH,
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      messageTH: SERVER_ERROR_MESSAGE_TH,
      messageEN: SERVER_ERROR_MESSAGE_EN,
      message: SERVER_ERROR_MESSAGE_TH,
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
      return {
        success: false,
        messageTH: 'ไม่พบผู้ใช้งานในระบบ',
        messageEN: 'User not found in system',
        message: 'ไม่พบผู้ใช้งานในระบบ',
      }
    }

    if (!user.otp || !user.otpExpires) {
      return {
        success: false,
        messageTH: 'กรุณากดขอรหัส OTP ก่อนทำรายการ',
        messageEN: 'Please request an OTP first',
        message: 'กรุณากดขอรหัส OTP ก่อนทำรายการ',
      }
    }

    if (user.otp !== otp) {
      return {
        success: false,
        messageTH: 'รหัส OTP ไม่ถูกต้อง',
        messageEN: 'Invalid OTP code',
        message: 'รหัส OTP ไม่ถูกต้อง',
      }
    }

    if (new Date() > new Date(user.otpExpires)) {
      return {
        success: false,
        messageTH: 'รหัส OTP หมดอายุแล้ว กรุณาขอรหัสใหม่',
        messageEN: 'OTP code has expired. Please request a new one',
        message: 'รหัส OTP หมดอายุแล้ว กรุณาขอรหัสใหม่',
      }
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
      messageTH: 'ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว',
      messageEN: 'Password reset successfully',
      message: 'ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว',
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      messageTH: SERVER_ERROR_MESSAGE_TH,
      messageEN: SERVER_ERROR_MESSAGE_EN,
      message: SERVER_ERROR_MESSAGE_TH,
    }
  }
}
