'use client'

import { useEffect, useState } from 'react'

import { useResendOtp, useVerifyOtp } from '@/actions/account/email-verification/hooks'
import { OTP_RESEND_COOLDOWN_SECONDS, SECOND } from '@/constants/system'
import { useSession } from '@/hooks/use-session'
import { useStoreData } from '@/stores/sites/use-store-data'
import { maskEmail } from '@/utils/formatting/mask-email'
import { AlertCircleIcon } from 'lucide-react'

import { Alert, AlertTitle } from '@/components/./ui/alert'
import { Button } from '@/components/./ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/./ui/dialog'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/./ui/input-otp'
import { Spinner } from '@/components/./ui/spinner'

export function EmailVerified() {
  const { store } = useStoreData()
  const { user } = useSession()

  const [otp, setOtp] = useState('')
  const [countdown, setCountdown] = useState(0)

  const verifyMutation = useVerifyOtp()
  const resendMutation = useResendOtp()

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), SECOND)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleResend = async () => {
    const res = await resendMutation.mutateAsync()
    if (res.success) {
      setCountdown(OTP_RESEND_COOLDOWN_SECONDS)
    }
  }

  const handleVerify = async () => {
    await verifyMutation.mutateAsync({ otp })
  }

  return (
    <Alert
      className="border-l-primary w-full rounded-none border-l-4 shadow-none"
      style={{ '--primary': store?.primaryColor } as React.CSSProperties}
    >
      <AlertCircleIcon className="text-primary size-5" />
      <AlertTitle className="text-primary font-semibold">
        มีสิ่งที่ต้องดำเนินการตอนนี้
      </AlertTitle>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-5">
        <div className="text-muted-foreground flex-1 shrink-0 text-sm">
          โปรดกรอกรหัสยืนยันที่ส่งไปยังอีเมลของคุณเพื่อเปิดใช้งานบัญชี
          <span className="mt-0.5 block text-xs opacity-50">
            (หากไม่พบในกล่องขาเข้า โปรดตรวจสอบใน อีเมลขยะ หรือ ถังขยะ)
          </span>
        </div>
        <div className="w-full shrink-0 sm:w-auto">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="default" className="bg-primary text-white">
                ยืนยันอีเมล
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
              <DialogHeader className="space-y-2">
                <DialogTitle className="text-center text-xl font-bold tracking-tight sm:text-left">
                  ยืนยันรหัส OTP
                </DialogTitle>
                <DialogDescription className="text-center sm:text-left">
                  ระบบได้ส่งรหัสผ่านแบบใช้ครั้งเดียว (OTP) จำนวน 6 หลัก{' '}
                  <br className="hidden sm:inline" />
                  ไปยังอีเมล{' '}
                  <span className="text-foreground font-semibold break-all">
                    {maskEmail(user?.email)}
                  </span>{' '}
                  แล้ว
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center justify-center space-y-4 py-2">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                  disabled={verifyMutation.isPending}
                >
                  <InputOTPGroup className="xs:*:size-10 *:size-9 *:text-base sm:*:size-12 sm:*:text-lg">
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator className="mx-0.5 sm:mx-1" />
                  <InputOTPGroup className="xs:*:size-10 *:size-9 *:text-base sm:*:size-12 sm:*:text-lg">
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                <div className="text-muted-foreground text-center text-xs sm:text-sm">
                  ไม่ได้รับรหัสใช่หรือไม่?{' '}
                  {countdown > 0 ? (
                    <span className="text-primary block font-medium sm:inline">
                      ส่งรหัสอีกครั้งใน ({countdown} วินาที)
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendMutation.isPending}
                      className="text-primary font-semibold hover:underline disabled:opacity-50"
                    >
                      {resendMutation.isPending ? 'กำลังส่ง...' : 'ส่งรหัสใหม่'}
                    </button>
                  )}
                </div>
              </div>
              <DialogFooter className="gap-2 sm:justify-end">
                <Button
                  type="button"
                  className="w-full sm:w-auto"
                  disabled={otp.length !== 6 || verifyMutation.isPending}
                  onClick={handleVerify}
                >
                  {verifyMutation.isPending && <Spinner />}
                  {verifyMutation.isPending ? 'กำลังตรวจสอบ...' : 'ยืนยันรหัส'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Alert>
  )
}
