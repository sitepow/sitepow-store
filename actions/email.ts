'use server'

import {
  MILLISECONDS_PER_MINUTE,
  OTP_EXPIRY_MINUTES,
  OTP_MAX_RANGE,
  OTP_MIN_RANGE,
  OTP_RESEND_COOLDOWN_SECONDS,
  SECOND,
} from '@/constants/system'
import OtpEmail from '@/emails/OtpEmail'
import crypto from 'crypto'

import { getCurrentUser } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'
import { resend } from '@/lib/resend'

export async function verifyOtp({ otp }: { otp: string }) {
  try {
    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return {
        success: false,
        messageTH: 'ไม่พบเซสชันการเข้าสู่ระบบ',
        messageEN: 'No login session found',
      }
    }

    if (!otp) {
      return {
        success: false,
        messageTH: 'โปรดระบุรหัส OTP',
        messageEN: 'Please enter the OTP code',
      }
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    })

    if (!user) {
      return {
        success: false,
        messageTH: 'ไม่พบข้อมูลผู้ใช้งาน',
        messageEN: 'User not found',
      }
    }

    if (!user.otpExpires || user.otpExpires < new Date()) {
      return {
        success: false,
        messageTH: 'รหัส OTP หมดอายุแล้ว',
        messageEN: 'OTP code has expired',
      }
    }

    if (user.otp !== otp) {
      return {
        success: false,
        messageTH: 'รหัส OTP ไม่ถูกต้อง',
        messageEN: 'Invalid OTP code',
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { otp: null, otpExpires: null, emailVerified: true },
    })

    return {
      success: true,
      messageTH: 'ยืนยัน OTP สำเร็จ',
      messageEN: 'OTP verified successfully',
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      messageTH: 'เกิดข้อผิดพลาดในการยืนยัน OTP',
      messageEN: 'Error verifying OTP',
    }
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
      return {
        success: false,
        messageTH: 'ไม่พบเซสชันการเข้าสู่ระบบ',
        messageEN: 'No login session found',
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, emailVerified: true, otpExpires: true },
    })

    if (!user) {
      return {
        success: false,
        messageTH: 'ไม่พบข้อมูลผู้ใช้งาน',
        messageEN: 'User not found',
      }
    }

    if (user.emailVerified) {
      return {
        success: false,
        messageTH: 'บัญชีนี้ได้รับการยืนยันอีเมลเรียบร้อยแล้ว',
        messageEN: 'This account email has already been verified',
      }
    }

    if (user.otpExpires) {
      const cooldownInMs = OTP_RESEND_COOLDOWN_SECONDS * SECOND
      const expiryDurationInMs = OTP_EXPIRY_MINUTES * MILLISECONDS_PER_MINUTE

      const lastSentTime = user.otpExpires.getTime() - expiryDurationInMs
      const timePassed = Date.now() - lastSentTime

      if (timePassed < cooldownInMs) {
        const remainingSeconds = Math.ceil((cooldownInMs - timePassed) / SECOND)
        return {
          success: false,
          messageTH: `กรุณารออีก ${remainingSeconds} วินาที ก่อนขอรหัส OTP ใหม่`,
          messageEN: `Please wait ${remainingSeconds} seconds before requesting a new OTP`,
        }
      }
    }

    const newOtp = crypto.randomInt(OTP_MIN_RANGE, OTP_MAX_RANGE).toString()
    const otpDurationInMs = OTP_EXPIRY_MINUTES * MILLISECONDS_PER_MINUTE
    const otpExpires = new Date(Date.now() + otpDurationInMs)

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
        messageTH: 'ระบบส่งอีเมลขัดข้อง กรุณาลองใหม่อีกครั้งในภายหลัง',
        messageEN: 'Email service error. Please try again later',
      }
    }

    return {
      success: true,
      messageTH: 'ส่งรหัส OTP ใหม่ไปยังอีเมลของคุณแล้ว',
      messageEN: 'New OTP has been sent to your email',
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
