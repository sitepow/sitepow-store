'use server'

import {
  MINUTE,
  OTP_EXPIRY_MINUTES,
  OTP_RESEND_COOLDOWN_SECONDS,
  SECOND,
} from '@/constants/system'
import OtpEmail from '@/emails/account/OtpEmail'
import { generateOtp } from '@/utils/auth/otp'

import { getCurrentUser } from '@/lib/auth/server'
import { prisma } from '@/lib/db/prisma'
import { resend } from '@/lib/integrations/resend'

export async function verifyOtp({ otp }: { otp: string }) {
  try {
    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return { success: false, message: 'ไม่พบเซสชันการเข้าสู่ระบบ' }
    }

    if (!otp) {
      return { success: false, message: 'โปรดระบุรหัส OTP' }
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
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
      where: { id: userId },
      data: { otp: null, otpExpires: null, emailVerified: true },
    })

    return { success: true, message: 'ยืนยัน OTP สำเร็จ' }
  } catch (error) {
    console.error(error)
    return { success: false, message: 'เกิดข้อผิดพลาดในการยืนยัน OTP' }
  }
}

export async function sendOtpEmail(email: string, otp: string) {
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: [email],
    subject: 'รหัสยืนยัน OTP สำหรับการเปิดใช้งานบัญชี',
    react: OtpEmail({ otp, expiryMinutes: OTP_EXPIRY_MINUTES }),
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function resendOtp() {
  try {
    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return { success: false, message: 'ไม่พบเซสชันการเข้าสู่ระบบ' }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, emailVerified: true, otpExpires: true },
    })

    if (!user) {
      return { success: false, message: 'ไม่พบข้อมูลผู้ใช้งาน' }
    }

    if (user.emailVerified) {
      return {
        success: false,
        message: 'บัญชีนี้ได้รับการยืนยันอีเมลเรียบร้อยแล้ว',
      }
    }

    if (user.otpExpires) {
      const cooldownInMs = OTP_RESEND_COOLDOWN_SECONDS * SECOND
      const expiryDurationInMs = OTP_EXPIRY_MINUTES * MINUTE

      const lastSentTime = user.otpExpires.getTime() - expiryDurationInMs
      const timePassed = Date.now() - lastSentTime

      if (timePassed < cooldownInMs) {
        const remainingSeconds = Math.ceil((cooldownInMs - timePassed) / SECOND)
        return {
          success: false,
          message: `กรุณารออีก ${remainingSeconds} วินาที ก่อนขอรหัส OTP ใหม่`,
        }
      }
    }

    const { otp: newOtp, otpExpires } = generateOtp()

    await prisma.user.update({
      where: { id: userId },
      data: {
        otp: newOtp,
        otpExpires: otpExpires,
      },
    })

    try {
      await sendOtpEmail(user.email!, newOtp)
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
