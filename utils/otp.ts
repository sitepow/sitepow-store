import {
  MINUTE,
  OTP_EXPIRY_MINUTES,
  OTP_MAX_RANGE,
  OTP_MIN_RANGE,
} from '@/constants/system'
import { fromNow } from '@/utils/date'
import crypto from 'crypto'

export function generateOtp() {
  return {
    otp: crypto.randomInt(OTP_MIN_RANGE, OTP_MAX_RANGE).toString(),
    otpExpires: fromNow(OTP_EXPIRY_MINUTES * MINUTE),
  }
}
