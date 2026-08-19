'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { useRouter, useSearchParams } from 'next/navigation'

import {
  useRequestForgotPasswordOtp,
  useResetPasswordWithOtp,
} from '@/actions/hooks/auth'
import { ArrowLeftIcon, MailIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { Spinner } from '@/components/ui/spinner'

import { authClient } from '@/lib/auth-client'

interface Step1Inputs {
  email: string
}

interface Step2Inputs {
  otp: string
  newPassword: string
  confirmPassword: string
}

export function ForgotPasswordDialog() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)
  const [targetEmail, setTargetEmail] = useState('')

  const sendOtpMutation = useRequestForgotPasswordOtp()
  const resetPasswordMutation = useResetPasswordWithOtp()

  const formStep1 = useForm<Step1Inputs>({
    defaultValues: { email: '' },
  })

  const formStep2 = useForm<Step2Inputs>({
    defaultValues: {
      otp: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const newPasswordValue = formStep2.watch('newPassword')
  const otpValue = formStep2.watch('otp')

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setTimeout(() => {
        setStep(1)
        setTargetEmail('')
        formStep1.reset()
        formStep2.reset()
      }, 200)
    }
  }

  const onStep1Submit = (data: Step1Inputs) => {
    sendOtpMutation.mutate(
      { email: data.email },
      {
        onSuccess: () => {
          setTargetEmail(data.email)
          setStep(2)
        },
      },
    )
  }

  const onStep2Submit = (data: Step2Inputs) => {
    resetPasswordMutation.mutate(
      {
        email: targetEmail,
        otp: data.otp,
        newPassword: data.newPassword,
      },
      {
        onSuccess: async () => {
          const { error } = await authClient.signIn.email({
            email: targetEmail,
            password: data.newPassword,
            callbackURL: callbackUrl,
          })
          if (error) {
            toast.error(
              error.message ||
                'ตั้งรหัสผ่านสำเร็จ แต่เข้าสู่ระบบไม่สำเร็จ กรุณาล็อกอินด้วยตนเอง',
            )
            handleOpenChange(false)
            return
          }

          toast.success('เข้าสู่ระบบสำเร็จ')
          handleOpenChange(false)
          window.location.href = callbackUrl
        },
      },
    )
  }

  const handleResendOtp = () => {
    sendOtpMutation.mutate({ email: targetEmail })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-primary text-xs font-medium hover:underline"
        >
          ลืมรหัสผ่าน?
        </button>
      </DialogTrigger>
      <DialogContent className="overflow-x-hidden">
        <DialogHeader className="space-y-1 text-center sm:text-left">
          <DialogTitle className="flex items-center justify-center gap-2 text-xl font-bold sm:justify-start">
            {step === 1 ? 'ลืมรหัสผ่าน?' : 'ตั้งรหัสผ่านใหม่'}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? 'กรอกอีเมลของคุณเพื่อรับรหัสยืนยัน OTP'
              : `กรอกรหัส OTP ที่ส่งไปยัง ${targetEmail}`}
          </DialogDescription>
        </DialogHeader>
        {step === 1 && (
          <form
            onSubmit={formStep1.handleSubmit(onStep1Submit)}
            className="mt-2 space-y-4"
          >
            <Field>
              <FieldLabel>อีเมลที่ใช้สมัครไว้</FieldLabel>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="name@example.com"
                  className="h-11 rounded-xl pr-10"
                  {...formStep1.register('email', {
                    required: 'กรุณาระบุอีเมลของคุณ',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'รูปแบบอีเมลไม่ถูกต้อง',
                    },
                  })}
                />
                <MailIcon className="text-muted-foreground absolute top-3 right-3 size-5" />
              </div>
              <FieldError>
                {formStep1.formState.errors.email?.message}
              </FieldError>
            </Field>
            <Button
              type="submit"
              className="h-11 w-full rounded-xl text-base font-medium"
              size="lg"
              disabled={sendOtpMutation.isPending}
            >
              {sendOtpMutation.isPending && <Spinner className="mr-2" />}
              ส่งรหัส OTP
            </Button>
          </form>
        )}
        {step === 2 && (
          <form
            onSubmit={formStep2.handleSubmit(onStep2Submit)}
            className="mt-2 space-y-4"
          >
            <Field className="flex flex-col items-center justify-center">
              <FieldLabel className="mb-2 self-start">
                รหัส OTP (6 หลัก)
              </FieldLabel>
              <InputOTP
                maxLength={6}
                value={otpValue}
                onChange={(val) => formStep2.setValue('otp', val)}
              >
                <InputOTPGroup className="*:size-9 *:text-base sm:*:size-10">
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator className="mx-1" />
                <InputOTPGroup className="*:size-9 *:text-base sm:*:size-10">
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <FieldDescription className="mt-2 text-xs">
                ไม่ได้รับรหัส?{' '}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={sendOtpMutation.isPending}
                  className="text-primary font-semibold hover:underline disabled:opacity-50"
                >
                  ส่งรหัสอีกครั้ง
                </button>
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel>รหัสผ่านใหม่</FieldLabel>
              <Input
                type="password"
                placeholder="อย่างน้อย 6 ตัวอักษร"
                className="h-11 rounded-xl"
                {...formStep2.register('newPassword', {
                  required: 'กรุณากำหนดรหัสผ่านใหม่',
                  minLength: {
                    value: 6,
                    message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
                  },
                })}
              />
              <FieldError>
                {formStep2.formState.errors.newPassword?.message}
              </FieldError>
            </Field>
            <Field>
              <FieldLabel>ยืนยันรหัสผ่านใหม่</FieldLabel>
              <Input
                type="password"
                placeholder="ระบุรหัสผ่านใหม่อีกครั้ง"
                className="h-11 rounded-xl"
                {...formStep2.register('confirmPassword', {
                  required: 'กรุณายืนยันรหัสผ่าน',
                  validate: (val) =>
                    val === newPasswordValue || 'รหัสผ่านทั้งสองช่องไม่ตรงกัน',
                })}
              />
              <FieldError>
                {formStep2.formState.errors.confirmPassword?.message}
              </FieldError>
            </Field>
            <Button
              type="submit"
              className="h-11 w-full rounded-xl text-base font-medium"
              size="lg"
              disabled={
                resetPasswordMutation.isPending || otpValue?.length !== 6
              }
            >
              {resetPasswordMutation.isPending && <Spinner className="mr-2" />}
              ยืนยันการเปลี่ยนรหัสผ่าน
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setStep(1)
                formStep2.reset()
              }}
            >
              <ArrowLeftIcon className="size-4" /> ย้อนกลับไปเปลี่ยนอีเมล
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
