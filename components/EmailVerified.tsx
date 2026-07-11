'use client'

import { useEffect, useState } from 'react'

import { resendOtp, verifyOtp } from '@/actions/otp'
import { useSession } from '@/hooks/use-session'
import { maskEmail } from '@/utils/email'
import { useMutation } from '@tanstack/react-query'
import { AlertCircleIcon } from 'lucide-react'

import { Alert, AlertAction, AlertDescription, AlertTitle } from './ui/alert'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from './ui/input-otp'
import { Spinner } from './ui/spinner'

export function EmailVerified() {
  const { user, update } = useSession()

  const [otp, setOtp] = useState('')
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const verify = useMutation({
    mutationFn: verifyOtp,
    onSuccess: async () => {
      await update({
        user: {
          isEmailVerified: true,
        },
      })
    },
  })

  const resend = useMutation({
    mutationFn: resendOtp,
  })

  const handleResend = async () => {
    await resend.mutate()
    setCountdown(60)
  }

  return (
    <Alert className="border-l-primary w-full rounded-none border-l-4 shadow-none">
      <AlertCircleIcon className="text-primary h-5 w-5" />
      <AlertTitle className="text-primary font-semibold">
        มีสิ่งที่ต้องดำเนินการตอนนี้
      </AlertTitle>
      <AlertDescription className="text-muted-foreground mt-1">
        โปรดกรอกรหัสยืนยันที่ส่งไปยังอีเมลของคุณเพื่อเปิดใช้งานบัญชี
        <span className="mt-0.5 block text-xs opacity-50">
          (หากไม่พบในกล่องขาเข้า โปรดตรวจสอบใน อีเมลขยะ หรือ ถังขยะ)
        </span>
      </AlertDescription>
      <AlertAction className="mt-3 sm:mt-0">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="default" className="bg-primary text-white">
              ยืนยันอีเมล
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-center text-xl font-bold tracking-tight sm:text-left">
                ยืนยันรหัส OTP
              </DialogTitle>
              <DialogDescription className="text-center sm:text-left">
                ระบบได้ส่งรหัสผ่านแบบใช้ครั้งเดียว (OTP) จำนวน 6 หลัก <br />
                ไปยังอีเมล{' '}
                <span className="text-foreground font-semibold">
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
                disabled={verify.isPending}
              >
                <InputOTPGroup className="*:size-12 *:text-lg">
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup className="*:size-12 *:text-lg">
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <div className="text-muted-foreground text-sm">
                ไม่ได้รับรหัสใช่หรือไม่?{' '}
                {countdown > 0 ? (
                  <span className="text-primary font-medium">
                    ส่งรหัสอีกครั้งใน ({countdown} วินาที)
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-primary font-semibold hover:underline"
                  >
                    ส่งรหัสใหม่
                  </button>
                )}
              </div>
            </div>
            <DialogFooter className="gap-2 sm:justify-end">
              <Button
                type="button"
                className="w-full sm:w-auto"
                disabled={otp.length !== 6 || verify.isPending}
                onClick={async () => {
                  await verify.mutate({ otp })
                }}
              >
                {verify.isPending && <Spinner />}
                {verify.isPending ? 'กำลังตรวจสอบ...' : 'ยืนยันรหัส'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AlertAction>
    </Alert>
  )
}
