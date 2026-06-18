'use server'

import {
  MILLISECONDS_PER_MINUTE,
  OTP_EXPIRY_MINUTES,
  OTP_MAX_RANGE,
  OTP_MIN_RANGE,
} from '@/constants/system'
import crypto from 'crypto'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function verifyOtp({ otp }: { otp: string }) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'ไม่พบเซสชันการเข้าสู่ระบบ' }
    }

    if (!otp) {
      return { success: false, message: 'โปรดระบุรหัส OTP' }
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    })

    if (!user) {
      return { success: false, message: 'ไม่พบข้อมูลผู้ใช้งาน' }
    }

    if (!user.otpExpires || user.otpExpires < new Date()) {
      return { success: false, message: 'รหัส OTP หมดอายุแล้ว' }
    }

    if (user.otp !== otp) {
      return { success: false, message: 'รหัส OTP ไม่ถูกต้อง' }
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { otp: null, otpExpires: null, isEmailVerified: true },
    })

    return { success: true, message: 'ยืนยัน OTP สำเร็จ' }
  } catch (error) {
    console.error(error)
    return { success: false, message: 'เกิดข้อผิดพลาดในการยืนยัน OTP' }
  }
}

export async function resendOtp() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'ไม่พบเซสชันการเข้าสู่ระบบ' }
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, isEmailVerified: true },
    })

    if (!user) {
      return { success: false, message: 'ไม่พบข้อมูลผู้ใช้งาน' }
    }

    if (user.isEmailVerified) {
      return {
        success: false,
        message: 'บัญชีนี้ได้รับการยืนยันอีเมลเรียบร้อยแล้ว',
      }
    }

    const newOtp = crypto.randomInt(OTP_MIN_RANGE, OTP_MAX_RANGE).toString()
    const otpDurationInMs = OTP_EXPIRY_MINUTES * MILLISECONDS_PER_MINUTE
    const otpExpires = new Date(Date.now() + otpDurationInMs)

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        otp: newOtp,
        otpExpires: otpExpires,
      },
    })

    try {
      // await sendOtpEmail(user.email, newOtp)
    } catch {
      return {
        success: false,
        message: 'ระบบส่งอีเมลขัดข้อง กรุณาลองใหม่อีกครั้งในภายหลัง',
      }
    }

    return { success: true, message: 'ส่งรหัส OTP ใหม่ไปยังอีเมลของคุณแล้ว' }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
