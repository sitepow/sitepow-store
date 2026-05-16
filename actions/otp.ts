'use server'

import { auth } from '@/auth'
import {
  MILLISECONDS_PER_MINUTE,
  OTP_EXPIRY_MINUTES,
  OTP_MAX_RANGE,
  OTP_MIN_RANGE,
} from '@/constants/system'
import crypto from 'crypto'

import { prisma } from '@/lib/prisma'

export async function verifyOtp({ otp }: { otp: string }) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error('ไม่พบเซสชันการเข้าสู่ระบบ')
  }

  if (!otp) {
    throw new Error('โปรดระบุรหัส OTP')
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  })

  if (!user) {
    throw new Error('ไม่พบข้อมูลผู้ใช้งาน')
  }

  if (!user.otpExpires || user.otpExpires < new Date()) {
    throw new Error('รหัส OTP หมดอายุแล้ว')
  }

  if (user.otp !== otp) {
    throw new Error('รหัส OTP ไม่ถูกต้อง')
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { otp: null, otpExpires: null, isEmailVerified: true },
  })

  return { message: 'ยืนยัน OTP สำเร็จ' }
}

export async function resendOtp() {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error('ไม่พบเซสชันการเข้าสู่ระบบ')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, isEmailVerified: true },
  })

  if (!user) {
    throw new Error('ไม่พบข้อมูลผู้ใช้งาน')
  }

  if (user.isEmailVerified) {
    throw new Error('บัญชีนี้ได้รับการยืนยันอีเมลเรียบร้อยแล้ว')
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
    throw new Error('ระบบส่งอีเมลขัดข้อง กรุณาลองใหม่อีกครั้งในภายหลัง')
  }

  return { message: 'ส่งรหัส OTP ใหม่ไปยังอีเมลของคุณแล้ว' }
}
