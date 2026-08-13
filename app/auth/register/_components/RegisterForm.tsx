/* eslint-disable react-hooks/immutability */
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'

import { registerUser } from '@/actions/auth'
import { REGISTER_PROVIDERS } from '@/constants/register'
import { UserRole } from '@/generated/prisma/enums'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { useLandingImages } from '@/hooks/use-landing-images'
import { RegisterFormInputs } from '@/types/register'
import { getClientAuthUrl } from '@/utils/auth'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeftIcon } from 'lucide-react'

import { ProtectedByBrand } from '@/components/ProtectedByBrand'
import { SSOButton } from '@/components/SSOButton'
import { SectionHeader } from '@/components/SectionHeader'
import { SupportContact } from '@/components/SupportContact'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'

export function RegisterForm() {
  const isMounted = useIsMounted()
  const searchParams = useSearchParams()
  const role = searchParams.get('role') as UserRole
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const [isCredentials, setIsCredentials] = useState<boolean>(false)

  const { currentImage } = useLandingImages()

  const registerHref = isMounted
    ? getClientAuthUrl({ path: 'login', role, callbackUrl })
    : '#'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: registerUser,
    onSuccess: async (_, variables) => {
      const result = await signIn('credentials', {
        email: variables.email,
        password: variables.password,
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        toast.error(
          'สมัครสมาชิกสำเร็จ แต่เข้าสู่ระบบล้มเหลว กรุณาเข้าสู่ระบบเอง',
        )
        window.location.href = callbackUrl
        return
      }

      window.location.href = callbackUrl
    },
  })

  const handleRegister = async (providerId: string) => {
    if (providerId === 'credentials') {
      setIsCredentials(true)
    } else {
      await signIn(providerId, {
        callbackUrl: callbackUrl,
      })
    }
  }

  return (
    <div className="text-foreground container mx-auto flex min-h-[calc(100vh-80px)] flex-col justify-center gap-6 p-4 sm:p-10 lg:max-w-7xl">
      <div className="flex w-full">
        <div
          style={{
            backgroundImage: currentImage ? `url('${currentImage}')` : 'none',
          }}
          className="hidden w-full rounded-l-3xl lg:block"
        />
        <div className="sm:shadow-airy border-border bg-background flex w-full flex-col items-center gap-8 rounded-3xl border p-6 sm:p-10 md:p-14 lg:-ml-6 lg:rounded-r-3xl dark:bg-neutral-800">
          <SectionHeader
            className="text-center"
            title={
              role !== UserRole.CUSTOMER
                ? 'สมัครเปิดร้านค้าของคุณที่นี่'
                : 'สมัครบัญชีซื้อของออนไลน์'
            }
            description={
              role !== UserRole.CUSTOMER && (
                <>
                  เพื่อขอทดลองใช้งาน{' '}
                  <span className="text-bold text-primary">Pro Package</span>{' '}
                  ฟรี 14 วัน ยังไม่ต้องชำระเงิน ไม่มีข้อผูกมัด
                </>
              )
            }
          />
          {isCredentials && (
            <form
              onSubmit={handleSubmit((data) =>
                mutate({ ...data, userRole: UserRole.MERCHANT }),
              )}
              className="flex w-full flex-col gap-3"
            >
              <Field>
                <FieldLabel>E-mail</FieldLabel>
                <Input
                  placeholder="ระบุ E-mail ของคุณ"
                  className="h-12 rounded-xl"
                  {...register('email', {
                    required: 'โปรดระบุ E-mail ของคุณ',
                  })}
                />
                <FieldDescription>
                  โปรดใช้อีเมลจริงเท่านั้น
                  เนื่องจากระบบจะส่งลิงค์ยืนยันไปให้หลังจากสมัครสมาชิกสำเร็จแล้ว
                </FieldDescription>
                <FieldError>{errors?.email?.message}</FieldError>
              </Field>
              <Field>
                <FieldLabel>รหัสผ่าน</FieldLabel>
                <Input
                  type="password"
                  placeholder="ระบุรหัสผ่าน"
                  className="h-12 rounded-xl"
                  {...register('password', { required: 'โปรดระบุรหัสผ่าน' })}
                />
                <FieldError>{errors?.password?.message}</FieldError>
              </Field>
              <Field>
                <FieldLabel>ยืนยันรหัสผ่าน</FieldLabel>
                <Input
                  type="password"
                  placeholder="ระบุรหัสผ่านเดิมอีกครั้ง"
                  className="h-12 rounded-xl"
                  {...register('confirmPassword', {
                    required: 'โปรดระบุรหัสผ่านอีกครั้ง',
                  })}
                />
                <FieldError>{errors?.confirmPassword?.message}</FieldError>
              </Field>
              <div className="mt-2 grid grid-cols-12 gap-2">
                <Button
                  className="col-span-4"
                  variant="outline"
                  size="lg"
                  disabled={isPending}
                  onClick={() => setIsCredentials(false)}
                >
                  <ArrowLeftIcon /> ย้อนกลับ
                </Button>
                <Button
                  type="submit"
                  className="col-span-8"
                  size="lg"
                  disabled={isPending}
                >
                  {isPending && <Spinner />} สมัครสมาชิก
                </Button>
              </div>
            </form>
          )}
          {!isCredentials && (
            <div className="w-full max-w-md space-y-8">
              <div className="space-y-6">
                <div className="flex w-full flex-col gap-4">
                  {REGISTER_PROVIDERS.map((provider, idx) => (
                    <div
                      key={idx}
                      className="w-full transition-transform active:scale-[0.98]"
                    >
                      <SSOButton
                        onClick={() => handleRegister(provider.id)}
                        {...provider}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-center text-sm">
                มีบัญชีผู้ใช้งานอยู่แล้ว?{' '}
                <a
                  href={registerHref}
                  className="text-primary transition-all hover:underline"
                >
                  เข้าสู่ระบบที่นี่
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
      {role !== UserRole.CUSTOMER && <SupportContact />}
      {role === UserRole.CUSTOMER && <ProtectedByBrand />}
    </div>
  )
}
